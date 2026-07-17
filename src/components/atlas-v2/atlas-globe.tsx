"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Effects, Html, OrbitControls, useTexture } from "@react-three/drei";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
} from "react";
import * as THREE from "three";
import {
  OrbitControls as OrbitControlsImpl,
  UnrealBloomPass,
} from "three-stdlib";
import {
  angularDistanceDegrees,
  latLonToVector3,
  tangentQuaternion,
} from "@/lib/atlas/geo";
import type { AtlasRegion, SeasonRace } from "@/lib/atlas/season-2026";
import styles from "./season-atlas.module.css";

type AtlasGlobeProps = {
  races: readonly SeasonRace[];
  hoveredRace: SeasonRace | null;
  selectedRace: SeasonRace | null;
  currentRace: SeasonRace;
  reducedMotion: boolean;
  compact: boolean;
  active: boolean;
  onHoverRace: (raceId: string | null) => void;
  onSelectRace: (raceId: string | null) => void;
};

type SceneProps = AtlasGlobeProps;

type LabelOffset = readonly [number, number];

const EARTH_RADIUS = 2;
const NODE_RADIUS = 2.035;
const CAMERA_NEAR_DISTANCE = 4.35;
const CAMERA_FAR_DISTANCE = 9.2;
const EUROPE_REGION: AtlasRegion = "EUROPE";

const EUROPE_LABEL_OFFSETS: Record<string, LabelOffset> = {
  monaco: [-118, 72],
  "barcelona-catalunya": [-158, 108],
  austria: [82, -42],
  "great-britain": [-142, -82],
  belgium: [-146, -32],
  hungary: [116, 28],
  netherlands: [-112, -122],
  italy: [78, 76],
  madrid: [-166, 144],
};

const DEFAULT_LABEL_OFFSETS: Record<string, LabelOffset> = {
  australia: [56, 36],
  china: [70, -38],
  japan: [92, 4],
  miami: [-76, 28],
  canada: [-84, -24],
  azerbaijan: [82, 12],
  singapore: [72, 28],
  "united-states": [-94, 16],
  mexico: [-96, 48],
  "sao-paulo": [-82, 36],
  "las-vegas": [-94, -32],
  qatar: [78, -26],
  "abu-dhabi": [86, 18],
};

const EARTH_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vObjectPosition;

  void main() {
    vUv = uv;
    vObjectPosition = position;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EARTH_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform vec3 uLightDirection;
  uniform vec3 uFocusPoint;
  uniform float uFocusStrength;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vObjectPosition;

  float atlasLuminance(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
  }

  void main() {
    vec3 normal = normalize(vWorldNormal);
    float sun = dot(normal, normalize(uLightDirection));
    float daylight = smoothstep(-0.24, 0.42, sun);
    float nightSide = 1.0 - smoothstep(-0.20, 0.20, sun);

    vec3 daySample = texture2D(uDayMap, vUv).rgb;
    vec3 nightSample = texture2D(uNightMap, vUv).rgb;
    float nightLuma = atlasLuminance(nightSample);
    float cityMask = smoothstep(0.13, 0.62, nightLuma);

    vec3 dayColor = pow(daySample, vec3(1.08));
    dayColor *= vec3(0.40, 0.56, 0.76);
    dayColor *= 0.18 + max(sun, 0.0) * 0.78;

    vec3 nightBase = daySample * vec3(0.018, 0.035, 0.070);
    vec3 cityColor = mix(
      vec3(0.82, 0.64, 0.36),
      vec3(1.45, 1.08, 0.62),
      smoothstep(0.25, 0.90, nightLuma)
    );
    vec3 color = mix(nightBase, dayColor, daylight);
    color += cityColor * cityMask * nightSide * 1.45;

    float focusDot = max(dot(normalize(vObjectPosition), normalize(uFocusPoint)), 0.0);
    float localFocus = pow(focusDot, 58.0) * uFocusStrength;
    color += vec3(0.18, 0.34, 0.62) * localFocus * 0.80;
    color += vec3(0.82, 0.66, 0.39) * localFocus * localFocus * 0.42;

    float polarShade = smoothstep(0.0, 0.95, abs(normal.y));
    color += vec3(0.04, 0.07, 0.12) * polarShade * 0.25;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const CLOUD_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalView;

  void main() {
    vUv = uv;
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CLOUD_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uCloudMap;
  varying vec2 vUv;
  varying vec3 vNormalView;

  void main() {
    vec3 sampleColor = texture2D(uCloudMap, vUv).rgb;
    float density = smoothstep(0.38, 0.82, dot(sampleColor, vec3(0.3333)));
    float rim = pow(1.0 - max(vNormalView.z, 0.0), 2.2);
    float alpha = density * (0.12 + rim * 0.11);
    gl_FragColor = vec4(vec3(0.57, 0.72, 0.90) * (0.65 + rim * 0.35), alpha);
  }
`;

const ATMOSPHERE_VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormalView;

  void main() {
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOSPHERE_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vNormalView;

  void main() {
    float fresnel = pow(1.0 - abs(vNormalView.z), 3.15);
    vec3 color = mix(vec3(0.05, 0.20, 0.48), vec3(0.24, 0.62, 1.0), fresnel);
    gl_FragColor = vec4(color, fresnel * 0.46);
  }
`;

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function createStarGeometry(count: number, seed: number) {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const cold = new THREE.Color("#7caee1");
  const white = new THREE.Color("#e4edf7");
  const warm = new THREE.Color("#d8b77a");

  for (let index = 0; index < count; index += 1) {
    const radius = 15 + random() * 27;
    const theta = random() * Math.PI * 2;
    const z = random() * 2 - 1;
    const planar = Math.sqrt(1 - z * z);
    const colorChoice = random();
    const color = colorChoice > 0.94 ? warm : colorChoice > 0.52 ? white : cold;
    const brightness = 0.42 + random() * 0.58;

    positions[index * 3] = Math.cos(theta) * planar * radius;
    positions[index * 3 + 1] = z * radius;
    positions[index * 3 + 2] = Math.sin(theta) * planar * radius;
    colors[index * 3] = color.r * brightness;
    colors[index * 3 + 1] = color.g * brightness;
    colors[index * 3 + 2] = color.b * brightness;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function createDustGeometry(count: number) {
  const random = seededRandom(32026);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const cold = new THREE.Color("#285b92");
  const warm = new THREE.Color("#9d7646");

  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 11 + random() * 23;
    const thickness = (random() - 0.5) * 2.8;
    const color = index % 7 === 0 ? warm : cold;

    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = thickness + Math.sin(angle * 2.0) * 1.3;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
    colors[index * 3] = color.r * (0.25 + random() * 0.35);
    colors[index * 3 + 1] = color.g * (0.25 + random() * 0.35);
    colors[index * 3 + 2] = color.b * (0.25 + random() * 0.35);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function StarField({ compact, reducedMotion }: { compact: boolean; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const starGeometry = useMemo(
    () => createStarGeometry(compact ? 760 : 1650, 2026),
    [compact],
  );
  const dustGeometry = useMemo(
    () => createDustGeometry(compact ? 240 : 660),
    [compact],
  );

  useEffect(
    () => () => {
      starGeometry.dispose();
      dustGeometry.dispose();
    },
    [dustGeometry, starGeometry],
  );

  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return;
    groupRef.current.rotation.y += delta * 0.0025;
  });

  return (
    <group ref={groupRef} rotation={[0.14, 0, -0.18]}>
      <points geometry={starGeometry}>
        <pointsMaterial
          size={compact ? 0.026 : 0.022}
          sizeAttenuation
          transparent
          opacity={0.78}
          depthWrite={false}
          vertexColors
          toneMapped={false}
        />
      </points>
      <points geometry={dustGeometry} rotation={[0.5, 0.25, -0.18]}>
        <pointsMaterial
          size={0.018}
          sizeAttenuation
          transparent
          opacity={0.32}
          depthWrite={false}
          vertexColors
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

function EarthSystem({ focusRace, reducedMotion }: { focusRace: SeasonRace | null; reducedMotion: boolean }) {
  const cloudRef = useRef<THREE.Mesh>(null);
  const earthMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const [dayMap, nightMap, cloudMap] = useTexture([
    "/atlas-v2/earth-day.png",
    "/atlas-v2/earth-night.jpg",
    "/atlas-v2/earth-clouds.jpg",
  ]);
  const { gl } = useThree();
  const focusTarget = useMemo(() => new THREE.Vector3(1, 0, 0), []);

  useEffect(() => {
    const maxAnisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    for (const texture of [dayMap, nightMap, cloudMap]) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = maxAnisotropy;
      texture.needsUpdate = true;
    }
  }, [cloudMap, dayMap, gl, nightMap]);

  const earthUniforms = useMemo(
    () => ({
      uDayMap: { value: dayMap },
      uNightMap: { value: nightMap },
      uLightDirection: { value: new THREE.Vector3(2.4, 1.15, -1.4).normalize() },
      uFocusPoint: { value: new THREE.Vector3(1, 0, 0) },
      uFocusStrength: { value: 0 },
    }),
    [dayMap, nightMap],
  );

  const cloudUniforms = useMemo(
    () => ({ uCloudMap: { value: cloudMap } }),
    [cloudMap],
  );

  useFrame((_, delta) => {
    if (cloudRef.current && !reducedMotion) {
      cloudRef.current.rotation.y += delta * 0.006;
    }

    const material = earthMaterialRef.current;
    if (!material) return;

    const desiredStrength = focusRace ? 1 : 0;
    material.uniforms.uFocusStrength.value = THREE.MathUtils.damp(
      material.uniforms.uFocusStrength.value,
      desiredStrength,
      5.5,
      delta,
    );

    if (focusRace) {
      focusTarget.copy(
        latLonToVector3(focusRace.latitude, focusRace.longitude, 1),
      );
    }
    material.uniforms.uFocusPoint.value.lerp(focusTarget, 1 - Math.exp(-delta * 6));
    material.uniforms.uFocusPoint.value.normalize();
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 128, 96]} />
        <shaderMaterial
          ref={earthMaterialRef}
          uniforms={earthUniforms}
          vertexShader={EARTH_VERTEX_SHADER}
          fragmentShader={EARTH_FRAGMENT_SHADER}
        />
      </mesh>
      <mesh ref={cloudRef} scale={1.0085} renderOrder={2}>
        <sphereGeometry args={[EARTH_RADIUS, 96, 72]} />
        <shaderMaterial
          uniforms={cloudUniforms}
          vertexShader={CLOUD_VERTEX_SHADER}
          fragmentShader={CLOUD_FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh scale={1.055} renderOrder={1}>
        <sphereGeometry args={[EARTH_RADIUS, 96, 72]} />
        <shaderMaterial
          vertexShader={ATMOSPHERE_VERTEX_SHADER}
          fragmentShader={ATMOSPHERE_FRAGMENT_SHADER}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function RaceLabel({
  race,
  position,
  show,
  active,
  offset,
}: {
  race: SeasonRace;
  position: THREE.Vector3;
  show: boolean;
  active: boolean;
  offset: LabelOffset;
}) {
  const labelRef = useRef<HTMLDivElement>(null);
  const opacityRef = useRef(0);
  const { camera } = useThree();
  const normal = useMemo(() => position.clone().normalize(), [position]);
  const cameraDirection = useMemo(() => new THREE.Vector3(), []);
  const customStyle = {
    "--atlas-label-x": `${offset[0]}px`,
    "--atlas-label-y": `${offset[1]}px`,
  } as CSSProperties;

  useFrame((_, delta) => {
    if (!labelRef.current) return;
    cameraDirection.copy(camera.position).normalize();
    const frontFacing = normal.dot(cameraDirection) > 0.12;
    const target = show && frontFacing ? 1 : 0;
    opacityRef.current = THREE.MathUtils.damp(
      opacityRef.current,
      target,
      8,
      delta,
    );
    labelRef.current.style.opacity = opacityRef.current.toFixed(3);
    labelRef.current.style.visibility =
      opacityRef.current < 0.015 ? "hidden" : "visible";
  });

  return (
    <Html
      position={position}
      center
      distanceFactor={7.4}
      zIndexRange={[24, 2]}
      style={{ pointerEvents: "none" }}
    >
      <div
        ref={labelRef}
        className={`${styles.raceLabel} ${active ? styles.raceLabelActive : ""}`}
        style={customStyle}
      >
        <span className={styles.raceLabelLine} aria-hidden="true" />
        <span className={styles.raceLabelName}>{race.city}</span>
        <span className={styles.raceLabelMeta}>R{String(race.round).padStart(2, "0")}</span>
      </div>
    </Html>
  );
}

function RaceNode({
  race,
  hovered,
  selected,
  current,
  showLabel,
  reducedMotion,
}: {
  race: SeasonRace;
  hovered: boolean;
  selected: boolean;
  current: boolean;
  showLabel: boolean;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const coreMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const energyRef = useRef(0);
  const position = useMemo(
    () => latLonToVector3(race.latitude, race.longitude, NODE_RADIUS),
    [race.latitude, race.longitude],
  );
  const normal = useMemo(() => position.clone().normalize(), [position]);
  const quaternion = useMemo(() => tangentQuaternion(normal), [normal]);
  const active = hovered || selected;
  const labelOffset =
    EUROPE_LABEL_OFFSETS[race.id] ?? DEFAULT_LABEL_OFFSETS[race.id] ?? [58, -20];

  useFrame(({ clock }, delta) => {
    const target = active ? 1 : current ? 0.55 : 0.12;
    energyRef.current = THREE.MathUtils.damp(
      energyRef.current,
      target,
      active ? 10 : 5,
      delta,
    );
    const energy = energyRef.current;
    const pulse = reducedMotion
      ? 1
      : 1 + Math.sin(clock.elapsedTime * 2.2 + race.round * 0.47) * 0.16;

    if (groupRef.current) {
      groupRef.current.scale.setScalar(0.88 + energy * 0.38);
    }
    if (haloMaterialRef.current) {
      haloMaterialRef.current.opacity = 0.10 + energy * 0.34;
    }
    if (ringMaterialRef.current) {
      ringMaterialRef.current.opacity = (0.08 + energy * 0.38) / pulse;
    }
    if (coreMaterialRef.current) {
      coreMaterialRef.current.emissiveIntensity = 0.75 + energy * 4.2;
    }
  });

  const activeColor = active || current ? "#ffe2a1" : "#b7d3e8";
  const nodeOpacity = race.status === "completed" && !active ? 0.5 : 0.86;

  return (
    <>
      <group ref={groupRef} position={position} quaternion={quaternion}>
        <mesh>
          <sphereGeometry args={[0.021, 16, 12]} />
          <meshStandardMaterial
            ref={coreMaterialRef}
            color={activeColor}
            emissive={activeColor}
            emissiveIntensity={2}
            roughness={0.25}
            metalness={0.1}
            transparent
            opacity={nodeOpacity}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, 0.004]}>
          <circleGeometry args={[0.061, 36]} />
          <meshBasicMaterial
            ref={haloMaterialRef}
            color={activeColor}
            transparent
            opacity={0.15}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, 0.006]}>
          <ringGeometry args={[0.076, 0.081, 42]} />
          <meshBasicMaterial
            ref={ringMaterialRef}
            color={activeColor}
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        {[0, 1, 2].map((trailIndex) => (
          <mesh
            key={trailIndex}
            position={[-0.034 - trailIndex * 0.024, 0.007 * trailIndex, -0.004]}
            scale={1 - trailIndex * 0.23}
          >
            <sphereGeometry args={[0.007, 8, 6]} />
            <meshBasicMaterial
              color={activeColor}
              transparent
              opacity={(0.28 - trailIndex * 0.07) * nodeOpacity}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      <RaceLabel
        race={race}
        position={position.clone().multiplyScalar(1.025)}
        show={showLabel}
        active={active || current}
        offset={labelOffset}
      />
    </>
  );
}

function RegionLabel({ currentRace, hide }: { currentRace: SeasonRace; hide: boolean }) {
  const labelRef = useRef<HTMLDivElement>(null);
  const opacityRef = useRef(0);
  const { camera } = useThree();
  const position = useMemo(
    () => latLonToVector3(48.2, 11.2, 2.28),
    [],
  );
  const normal = useMemo(() => position.clone().normalize(), [position]);
  const cameraDirection = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!labelRef.current) return;
    cameraDirection.copy(camera.position).normalize();
    const visible = normal.dot(cameraDirection) > 0.25 && !hide;
    opacityRef.current = THREE.MathUtils.damp(
      opacityRef.current,
      visible ? 1 : 0,
      5,
      delta,
    );
    labelRef.current.style.opacity = opacityRef.current.toFixed(3);
  });

  return (
    <Html
      position={position}
      center
      distanceFactor={7.8}
      zIndexRange={[18, 1]}
      style={{ pointerEvents: "none" }}
    >
      <div ref={labelRef} className={styles.regionLabel}>
        <span>Europe</span>
        <small>09 circuits · current R{String(currentRace.round).padStart(2, "0")}</small>
      </div>
    </Html>
  );
}

function FocusParticles({ focusRace, reducedMotion }: { focusRace: SeasonRace | null; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const strengthRef = useRef(0);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const count = 84;
  const { geometry, radii, angles, heights, speeds } = useMemo(() => {
    const random = seededRandom(22610);
    const positions = new Float32Array(count * 3);
    const localRadii = new Float32Array(count);
    const localAngles = new Float32Array(count);
    const localHeights = new Float32Array(count);
    const localSpeeds = new Float32Array(count);
    const bufferGeometry = new THREE.BufferGeometry();

    for (let index = 0; index < count; index += 1) {
      localRadii[index] = 0.045 + random() * 0.19;
      localAngles[index] = random() * Math.PI * 2;
      localHeights[index] = (random() - 0.5) * 0.08;
      localSpeeds[index] = 0.45 + random() * 1.1;
    }
    bufferGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return {
      geometry: bufferGeometry,
      radii: localRadii,
      angles: localAngles,
      heights: localHeights,
      speeds: localSpeeds,
    };
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }, delta) => {
    const targetStrength = focusRace ? 1 : 0;
    strengthRef.current = THREE.MathUtils.damp(
      strengthRef.current,
      targetStrength,
      6,
      delta,
    );
    const strength = strengthRef.current;

    if (focusRace) {
      targetPosition.copy(
        latLonToVector3(focusRace.latitude, focusRace.longitude, NODE_RADIUS + 0.018),
      );
      targetQuaternion.copy(tangentQuaternion(targetPosition.clone().normalize()));
    }

    if (groupRef.current) {
      groupRef.current.position.lerp(targetPosition, 1 - Math.exp(-delta * 10));
      groupRef.current.quaternion.slerp(targetQuaternion, 1 - Math.exp(-delta * 10));
      groupRef.current.visible = strength > 0.008;
    }
    if (materialRef.current) {
      materialRef.current.opacity = strength * 0.7;
    }
    if (ringMaterialRef.current) {
      ringMaterialRef.current.opacity = strength * 0.32;
    }

    const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
    const positions = attribute.array as Float32Array;
    const elapsed = reducedMotion ? 0 : clock.elapsedTime;
    for (let index = 0; index < count; index += 1) {
      const convergence = THREE.MathUtils.lerp(1, 0.42, strength);
      const radius = radii[index] * convergence;
      const angle = angles[index] + elapsed * speeds[index] * (0.2 + strength * 0.75);
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle) * radius;
      positions[index * 3 + 2] = heights[index] + Math.sin(angle * 2.3) * 0.012;
    }
    attribute.needsUpdate = true;
  });

  return (
    <group ref={groupRef} visible={false}>
      <points geometry={geometry}>
        <pointsMaterial
          ref={materialRef}
          color="#ffd993"
          size={0.012}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
      <mesh position={[0, 0, -0.002]}>
        <ringGeometry args={[0.12, 0.124, 64]} />
        <meshBasicMaterial
          ref={ringMaterialRef}
          color="#95c9ff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function RaycastMagnet({
  races,
  onHoverRace,
  onSelectRace,
}: {
  races: readonly SeasonRace[];
  onHoverRace: (raceId: string | null) => void;
  onSelectRace: (raceId: string | null) => void;
}) {
  const hitTargetRef = useRef<THREE.Mesh>(null);
  const { camera, gl, raycaster } = useThree();
  const pointerNdc = useRef(new THREE.Vector2(99, 99));
  const pointerInside = useRef(false);
  const pointerDown = useRef<{ x: number; y: number; at: number } | null>(null);
  const nearestRaceId = useRef<string | null>(null);
  const lastReportedRaceId = useRef<string | null>(null);
  const raceVectors = useMemo(
    () =>
      races.map((race) => ({
        race,
        vector: latLonToVector3(race.latitude, race.longitude, 1),
      })),
    [races],
  );

  const resolveNearestRace = useCallback(() => {
    if (!hitTargetRef.current) return null;

    raycaster.setFromCamera(pointerNdc.current, camera);
    const hit = raycaster.intersectObject(hitTargetRef.current, false)[0];
    let closestId: string | null = null;

    if (hit) {
      const surfaceVector = hit.point.clone().normalize();
      let closestDistance = Number.POSITIVE_INFINITY;
      for (const entry of raceVectors) {
        const distance = angularDistanceDegrees(surfaceVector, entry.vector);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = entry.race.id;
        }
      }
      const cameraDistance = camera.position.length();
      const magneticRadius = THREE.MathUtils.mapLinear(
        cameraDistance,
        CAMERA_NEAR_DISTANCE,
        CAMERA_FAR_DISTANCE,
        7.5,
        13.5,
      );
      if (closestDistance > magneticRadius) closestId = null;
    }

    nearestRaceId.current = closestId;
    return closestId;
  }, [camera, raceVectors, raycaster]);

  useEffect(() => {
    const canvas = gl.domElement;
    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointerNdc.current.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      pointerInside.current = true;
    };
    const handleEnter = (event: PointerEvent) => updatePointer(event);
    const handleMove = (event: PointerEvent) => updatePointer(event);
    const handleLeave = () => {
      pointerInside.current = false;
      pointerDown.current = null;
      nearestRaceId.current = null;
      lastReportedRaceId.current = null;
      onHoverRace(null);
      canvas.style.cursor = "grab";
    };
    const handleDown = (event: PointerEvent) => {
      updatePointer(event);
      pointerDown.current = { x: event.clientX, y: event.clientY, at: performance.now() };
      canvas.style.cursor = "grabbing";
    };
    const handleUp = (event: PointerEvent) => {
      updatePointer(event);
      const start = pointerDown.current;
      pointerDown.current = null;
      const closestId = resolveNearestRace();
      const travel = start
        ? Math.hypot(event.clientX - start.x, event.clientY - start.y)
        : Number.POSITIVE_INFINITY;
      const elapsed = start ? performance.now() - start.at : Number.POSITIVE_INFINITY;
      if (travel < 9 && elapsed < 520 && closestId) {
        onSelectRace(closestId);
      }
      canvas.style.cursor = closestId ? "pointer" : "grab";
    };

    canvas.addEventListener("pointerenter", handleEnter);
    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerleave", handleLeave);
    canvas.addEventListener("pointerdown", handleDown);
    canvas.addEventListener("pointerup", handleUp);
    canvas.addEventListener("pointercancel", handleLeave);
    canvas.style.cursor = "grab";

    return () => {
      canvas.removeEventListener("pointerenter", handleEnter);
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerleave", handleLeave);
      canvas.removeEventListener("pointerdown", handleDown);
      canvas.removeEventListener("pointerup", handleUp);
      canvas.removeEventListener("pointercancel", handleLeave);
      canvas.style.cursor = "";
    };
  }, [gl, onHoverRace, onSelectRace, resolveNearestRace]);

  useFrame(() => {
    if (!hitTargetRef.current || !pointerInside.current) return;
    const closestId = resolveNearestRace();
    if (closestId !== lastReportedRaceId.current) {
      lastReportedRaceId.current = closestId;
      onHoverRace(closestId);
    }
    if (!pointerDown.current) {
      gl.domElement.style.cursor = closestId ? "pointer" : "grab";
    }
  });

  return (
    <mesh ref={hitTargetRef}>
      <sphereGeometry args={[EARTH_RADIUS + 0.035, 48, 32]} />
      <meshBasicMaterial
        transparent
        opacity={0}
        depthWrite={false}
        colorWrite={false}
      />
    </mesh>
  );
}

function AtlasControls({
  hoveredRace,
  selectedRace,
  reducedMotion,
}: {
  hoveredRace: SeasonRace | null;
  selectedRace: SeasonRace | null;
  reducedMotion: boolean;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const interactingRef = useRef(false);
  const autoRotateSpeedRef = useRef(0);
  const idleCooldownRef = useRef(0);
  const flightTargetRef = useRef(new THREE.Vector3());
  const flyingRef = useRef(false);
  const hoverBaseDistanceRef = useRef<number | null>(null);
  const hoverDistanceTargetRef = useRef<number | null>(null);

  useEffect(() => {
    if (!selectedRace) {
      flyingRef.current = false;
      return;
    }
    flightTargetRef.current.copy(
      latLonToVector3(selectedRace.latitude, selectedRace.longitude, 5.15),
    );
    if (reducedMotion) {
      camera.position.copy(flightTargetRef.current);
      controlsRef.current?.update();
      flyingRef.current = false;
    } else {
      flyingRef.current = true;
    }
  }, [camera, reducedMotion, selectedRace]);

  useEffect(() => {
    if (selectedRace) {
      hoverBaseDistanceRef.current = null;
      hoverDistanceTargetRef.current = null;
      return;
    }

    if (hoveredRace) {
      if (hoverBaseDistanceRef.current === null) {
        hoverBaseDistanceRef.current = camera.position.length();
      }
      hoverDistanceTargetRef.current = Math.max(
        CAMERA_NEAR_DISTANCE,
        hoverBaseDistanceRef.current - 0.24,
      );
    } else if (hoverBaseDistanceRef.current !== null) {
      hoverDistanceTargetRef.current = hoverBaseDistanceRef.current;
    }
  }, [camera, hoveredRace, selectedRace]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    idleCooldownRef.current = Math.max(0, idleCooldownRef.current - delta);
    const waitingForIdle = idleCooldownRef.current > 0;
    const shouldPause =
      reducedMotion || interactingRef.current || waitingForIdle || Boolean(selectedRace);
    const desiredAutoSpeed = shouldPause ? 0 : hoveredRace ? 0.07 : 0.2;
    autoRotateSpeedRef.current = THREE.MathUtils.damp(
      autoRotateSpeedRef.current,
      desiredAutoSpeed,
      2.2,
      delta,
    );
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = autoRotateSpeedRef.current;

    if (flyingRef.current && selectedRace && !interactingRef.current) {
      camera.position.lerp(
        flightTargetRef.current,
        1 - Math.exp(-delta * 1.85),
      );
      if (camera.position.distanceTo(flightTargetRef.current) < 0.018) {
        flyingRef.current = false;
      }
    } else if (
      hoverDistanceTargetRef.current !== null &&
      !interactingRef.current &&
      !selectedRace &&
      !reducedMotion
    ) {
      const currentDistance = camera.position.length();
      const nextDistance = THREE.MathUtils.damp(
        currentDistance,
        hoverDistanceTargetRef.current,
        4.2,
        delta,
      );
      camera.position.normalize().multiplyScalar(nextDistance);
      if (
        !hoveredRace &&
        Math.abs(nextDistance - hoverDistanceTargetRef.current) < 0.006
      ) {
        hoverBaseDistanceRef.current = null;
        hoverDistanceTargetRef.current = null;
      }
    }
  }, -2);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.065}
      rotateSpeed={0.42}
      zoomSpeed={0.65}
      minDistance={CAMERA_NEAR_DISTANCE}
      maxDistance={CAMERA_FAR_DISTANCE}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI - 0.12}
      onStart={() => {
        interactingRef.current = true;
        flyingRef.current = false;
        autoRotateSpeedRef.current = 0;
        if (controlsRef.current) controlsRef.current.autoRotateSpeed = 0;
        idleCooldownRef.current = 2.4;
      }}
      onEnd={() => {
        interactingRef.current = false;
        idleCooldownRef.current = 2.4;
      }}
    />
  );
}

function SubtleBloom({ enabled }: { enabled: boolean }) {
  const { size } = useThree();
  const pass = useMemo(
    () => new UnrealBloomPass(new THREE.Vector2(1, 1), 0.44, 0.52, 0.76),
    [],
  );

  useEffect(() => {
    pass.setSize(size.width, size.height);
  }, [pass, size]);

  useEffect(() => () => pass.dispose(), [pass]);

  if (!enabled) return null;

  return (
    <Effects multisamping={2} disableGamma>
      <primitive object={pass} />
    </Effects>
  );
}

function AtlasScene({
  races,
  hoveredRace,
  selectedRace,
  currentRace,
  reducedMotion,
  compact,
  onHoverRace,
  onSelectRace,
}: SceneProps) {
  const activeFocusRace = selectedRace ?? hoveredRace;
  const europeFocused = selectedRace?.region === EUROPE_REGION;
  const nearbyRaceIds = useMemo(() => {
    if (!hoveredRace) return new Set<string>();
    const hoveredVector = latLonToVector3(
      hoveredRace.latitude,
      hoveredRace.longitude,
      1,
    );
    return new Set(
      races
        .filter((race) => {
          const raceVector = latLonToVector3(race.latitude, race.longitude, 1);
          return angularDistanceDegrees(hoveredVector, raceVector) < 11.5;
        })
        .map((race) => race.id),
    );
  }, [hoveredRace, races]);

  return (
    <>
      <color attach="background" args={["#01040a"]} />
      <fog attach="fog" args={["#01040a", 15, 39]} />
      <ambientLight intensity={0.08} />
      <directionalLight position={[4, 3, 2]} intensity={0.32} color="#a9ccf4" />
      <StarField compact={compact} reducedMotion={reducedMotion} />
      <EarthSystem focusRace={activeFocusRace} reducedMotion={reducedMotion} />
      {races.map((race) => {
        const hovered = hoveredRace?.id === race.id;
        const selected = selectedRace?.id === race.id;
        const current = currentRace.id === race.id;
        const showLabel =
          current ||
          hovered ||
          selected ||
          nearbyRaceIds.has(race.id) ||
          (europeFocused && race.region === EUROPE_REGION);

        return (
          <RaceNode
            key={race.id}
            race={race}
            hovered={hovered}
            selected={selected}
            current={current}
            showLabel={showLabel}
            reducedMotion={reducedMotion}
          />
        );
      })}
      <RegionLabel currentRace={currentRace} hide={Boolean(hoveredRace || selectedRace)} />
      <FocusParticles focusRace={activeFocusRace} reducedMotion={reducedMotion} />
      <RaycastMagnet
        races={races}
        onHoverRace={onHoverRace}
        onSelectRace={onSelectRace}
      />
      <AtlasControls
        hoveredRace={hoveredRace}
        selectedRace={selectedRace}
        reducedMotion={reducedMotion}
      />
      <SubtleBloom enabled={!compact && !reducedMotion} />
    </>
  );
}

export function AtlasGlobe(props: AtlasGlobeProps) {
  const initialCamera = useMemo(() => latLonToVector3(31, 5, 7.45), []);

  return (
    <Canvas
      className={styles.canvas}
      frameloop={props.active ? "always" : "never"}
      dpr={props.compact ? [1, 1.25] : [1, 1.7]}
      camera={{
        position: initialCamera.toArray(),
        fov: 36,
        near: 0.1,
        far: 80,
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.92,
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.setClearColor("#01040a", 1);
      }}
    >
      <Suspense fallback={null}>
        <AtlasScene {...props} />
      </Suspense>
    </Canvas>
  );
}
