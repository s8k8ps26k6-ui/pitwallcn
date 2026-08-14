"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import europeFeature from "@/lib/atlas/europe-50m.json";
import { latLonToVector3 } from "@/lib/atlas/geo";

type Coordinate = readonly [number, number];
type LinearRing = readonly Coordinate[];
type PolygonCoordinates = readonly LinearRing[];
type MultiPolygonCoordinates = readonly PolygonCoordinates[];

const BASE_RADIUS = 2.004;
const MAX_TRIANGLE_EDGE = THREE.MathUtils.degToRad(3.2);
const MAX_OUTLINE_EDGE = THREE.MathUtils.degToRad(1.6);

function cleanRing(ring: LinearRing) {
  if (ring.length < 2) return [...ring];
  const first = ring[0];
  const last = ring[ring.length - 1];
  return first[0] === last[0] && first[1] === last[1]
    ? ring.slice(0, -1)
    : [...ring];
}

function unitVector([longitude, latitude]: Coordinate) {
  return latLonToVector3(latitude, longitude, 1).normalize();
}

function angularDistance(a: THREE.Vector3, b: THREE.Vector3) {
  return Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
}

function sphericalMidpoint(a: THREE.Vector3, b: THREE.Vector3) {
  return a.clone().add(b).normalize();
}

function appendCurvedTriangle(
  output: number[],
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
  depth = 0,
) {
  const ab = angularDistance(a, b);
  const bc = angularDistance(b, c);
  const ca = angularDistance(c, a);
  const longest = Math.max(ab, bc, ca);

  if (longest <= MAX_TRIANGLE_EDGE || depth >= 8) {
    for (const point of [a, b, c]) {
      output.push(
        point.x * BASE_RADIUS,
        point.y * BASE_RADIUS,
        point.z * BASE_RADIUS,
      );
    }
    return;
  }

  if (longest === ab) {
    const midpoint = sphericalMidpoint(a, b);
    appendCurvedTriangle(output, a, midpoint, c, depth + 1);
    appendCurvedTriangle(output, midpoint, b, c, depth + 1);
  } else if (longest === bc) {
    const midpoint = sphericalMidpoint(b, c);
    appendCurvedTriangle(output, a, b, midpoint, depth + 1);
    appendCurvedTriangle(output, a, midpoint, c, depth + 1);
  } else {
    const midpoint = sphericalMidpoint(c, a);
    appendCurvedTriangle(output, a, b, midpoint, depth + 1);
    appendCurvedTriangle(output, midpoint, b, c, depth + 1);
  }
}

function appendCurvedOutline(
  output: number[],
  start: THREE.Vector3,
  end: THREE.Vector3,
) {
  const steps = Math.max(1, Math.ceil(angularDistance(start, end) / MAX_OUTLINE_EDGE));
  let previous = start;

  for (let step = 1; step <= steps; step += 1) {
    const next = start.clone().lerp(end, step / steps).normalize();
    output.push(
      previous.x * BASE_RADIUS,
      previous.y * BASE_RADIUS,
      previous.z * BASE_RADIUS,
      next.x * BASE_RADIUS,
      next.y * BASE_RADIUS,
      next.z * BASE_RADIUS,
    );
    previous = next;
  }
}

function buildEuropeGeometry() {
  const fillPositions: number[] = [];
  const outlinePositions: number[] = [];
  const polygons = europeFeature.geometry
    .coordinates as unknown as MultiPolygonCoordinates;

  for (const polygon of polygons) {
    const [outerSource, ...holeSources] = polygon;
    const outer = cleanRing(outerSource);
    const holes = holeSources.map(cleanRing).filter((ring) => ring.length >= 3);
    if (outer.length < 3) continue;

    const contour = outer.map(
      ([longitude, latitude]) => new THREE.Vector2(longitude, latitude),
    );
    const holeVectors = holes.map((ring) =>
      ring.map(
        ([longitude, latitude]) => new THREE.Vector2(longitude, latitude),
      ),
    );
    const flattened = [...outer, ...holes.flat()];
    const faces = THREE.ShapeUtils.triangulateShape(contour, holeVectors);

    for (const [aIndex, bIndex, cIndex] of faces) {
      appendCurvedTriangle(
        fillPositions,
        unitVector(flattened[aIndex]),
        unitVector(flattened[bIndex]),
        unitVector(flattened[cIndex]),
      );
    }

    for (const ring of [outer, ...holes]) {
      for (let index = 0; index < ring.length; index += 1) {
        appendCurvedOutline(
          outlinePositions,
          unitVector(ring[index]),
          unitVector(ring[(index + 1) % ring.length]),
        );
      }
    }
  }

  const fill = new THREE.BufferGeometry();
  fill.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(fillPositions, 3),
  );
  fill.computeVertexNormals();
  fill.computeBoundingSphere();

  const outline = new THREE.BufferGeometry();
  outline.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(outlinePositions, 3),
  );
  outline.computeBoundingSphere();

  return { fill, outline };
}

export function EuropePlate({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const fillMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const outlineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const progressRef = useRef(0);
  const geometry = useMemo(buildEuropeGeometry, []);

  useEffect(
    () => () => {
      geometry.fill.dispose();
      geometry.outline.dispose();
    },
    [geometry],
  );

  useFrame((_, delta) => {
    const target = active ? 1 : 0;
    progressRef.current = reducedMotion
      ? target
      : THREE.MathUtils.damp(progressRef.current, target, active ? 3.4 : 4.8, delta);
    const progress = progressRef.current;
    const reveal = THREE.MathUtils.smoothstep(progress, 0.28, 0.82);

    if (groupRef.current) {
      groupRef.current.visible = progress > 0.015;
      groupRef.current.scale.setScalar(1 + progress * 0.008);
    }
    if (fillMaterialRef.current) {
      fillMaterialRef.current.opacity = reveal * 0.13;
    }
    if (outlineMaterialRef.current) {
      outlineMaterialRef.current.opacity = reveal * 0.34;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh geometry={geometry.fill} renderOrder={3}>
        <meshBasicMaterial
          ref={fillMaterialRef}
          color="#377baa"
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
      <lineSegments geometry={geometry.outline} renderOrder={4}>
        <lineBasicMaterial
          ref={outlineMaterialRef}
          color="#9ac6e4"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
