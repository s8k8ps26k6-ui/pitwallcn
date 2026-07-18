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
import {
  chooseAdaptiveLabelOffset,
  isProjectedPointVisible,
  isSurfacePointVisible,
  type AtlasLabelOffset,
} from "@/lib/atlas/visibility";
import type { SeasonRace } from "@/lib/atlas/season-2026";
import { EuropePlate } from "./europe-plate";
import styles from "./season-atlas.module.css";

export type AtlasViewMode = "global" | "europe-focus" | "station-focus";
export const EUROPE_ENTRY_ID = "europe-season";

type AtlasGlobeProps = {
  races: readonly SeasonRace[];
  hoveredTargetId: string | null;
  hoveredRace: SeasonRace | null;
  selectedRace: SeasonRace | null;
  currentRace: SeasonRace;
  autoFocusRace: SeasonRace | null;
  autoFocusVersion: number;
  viewMode: AtlasViewMode;
  navigationVersion: number;
  reducedMotion: boolean;
  compact: boolean;
  active: boolean;
  onHoverTarget: (targetId: string | null) => void;
  onSelectTarget: (targetId: string) => void;
  onSceneReady: () => void;
};

type SceneProps = AtlasGlobeProps;

type LabelOffset = AtlasLabelOffset;

type StationAnchor = {
  race: SeasonRace;
  normal: THREE.Vector3;
  position: THREE.Vector3;
  labelOffset: LabelOffset;
};

type InteractiveTarget = {
  id: string;
  kind: "station" | "region";
  normal: THREE.Vector3;
  position: THREE.Vector3;
};

type NodeState = "idle" | "current" | "hovered" | "selected";

const EARTH_RADIUS = 2;
const NODE_RADIUS = 2.035;
const CAMERA_NEAR_DISTANCE = 4.35;
const CAMERA_FAR_DISTANCE = 9.2;
const EUROPE_REGION = "EUROPE";

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

    vec3 nightBase = daySample * vec3(0.075, 0.105, 0.155);
    nightBase += vec3(0.012, 0.024, 0.044) * (0.48 + 0.52 * max(normal.y, 0.0));
    vec3 cityColor = mix(
      vec3(0.82, 0.64, 0.36),
      vec3(1.45, 1.08, 0.62),
      smoothstep(0.25, 0.90, nightLuma)
    );
    vec3 color = mix(nightBase, dayColor, daylight);
    color += cityColor * cityMask * nightSide * 0.72;

    float focusDot = max(dot(normalize(vObjectPosition), normalize(uFocusPoint)), 0.0);
    float localFocus = pow(focusDot, 96.0) * uFocusStrength;
    color += vec3(0.12, 0.28, 0.52) * localFocus * 0.32;
    color += vec3(0.52, 0.42, 0.24) * localFocus * localFocus * 0.16;

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
    float alpha = density * (0.075 + rim * 0.065);
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
    float fresnel = pow(1.0 - abs(vNormalView.z), 4.1);
    vec3 color = mix(vec3(0.05, 0.20, 0.48), vec3(0.24, 0.62, 1.0), fresnel);
    gl_FragColor = vec4(color, fresnel * 0.27);
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

function EarthSystem({
  focusNormal,
  focusLevel,
  reducedMotion,
}: {
  focusNormal: THREE.Vector3 | null;
  focusLevel: number;
  reducedMotion: boolean;
}) {
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
      cloudRef.current.rotation.y += delta * 0.0035;
    }

    const material = earthMaterialRef.current;
    if (!material) return;

    const desiredStrength = focusNormal ? focusLevel : 0;
    material.uniforms.uFocusStrength.value = THREE.MathUtils.damp(
      material.uniforms.uFocusStrength.value,
      desiredStrength,
      4.2,
      delta,
    );

    if (focusNormal) focusTarget.copy(focusNormal);
    material.uniforms.uFocusPoint.value.lerp(
      focusTarget,
      1 - Math.exp(-delta * 5),
    );
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
      <mesh scale={1.036} renderOrder={1}>
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
  anchor,
  show,
  emphasis,
  selectable,
  onSelect,
}: {
  anchor: StationAnchor;
  show: boolean;
  emphasis: NodeState;
  selectable: boolean;
  onSelect: (raceId: string) => void;
}) {
  const labelRef = useRef<HTMLDivElement>(null);
  const opacityRef = useRef(0);
  const { camera, size } = useThree();
  const cameraDirection = useMemo(() => new THREE.Vector3(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const [offsetX, offsetY] = anchor.labelOffset;
  const customStyle = {
    "--atlas-label-x": `${offsetX}px`,
    "--atlas-label-y": `${offsetY}px`,
    "--atlas-leader-length": `${Math.hypot(offsetX, offsetY)}px`,
    "--atlas-leader-angle": `${Math.atan2(offsetY, offsetX)}rad`,
  } as CSSProperties;

  useEffect(() => {
    opacityRef.current = 0;
  }, [size.height, size.width]);

  useFrame((_, delta) => {
    if (!labelRef.current) return;
    cameraDirection.copy(camera.position).normalize();
    const frontFacing = isSurfacePointVisible(
      anchor.normal.dot(cameraDirection),
      camera.position.length(),
      EARTH_RADIUS,
    );
    projected.copy(anchor.position).project(camera);
    const placement =
      frontFacing && isProjectedPointVisible(projected)
        ? chooseAdaptiveLabelOffset({
            point: projected,
            viewportWidth: size.width,
            viewportHeight: size.height,
            preferred: anchor.labelOffset,
          })
        : null;
    const emphasisOpacity =
      emphasis === "selected"
        ? 1
        : emphasis === "hovered"
          ? 0.92
          : emphasis === "current"
            ? 0.52
            : 0.22;
    const target = show && placement ? emphasisOpacity : 0;
    opacityRef.current = THREE.MathUtils.damp(
      opacityRef.current,
      target,
      target > opacityRef.current ? 7 : 9,
      delta,
    );
    labelRef.current.style.opacity = opacityRef.current.toFixed(3);
    labelRef.current.style.visibility =
      opacityRef.current < 0.015 ? "hidden" : "visible";
    labelRef.current.style.pointerEvents =
      selectable && opacityRef.current > 0.2 ? "auto" : "none";
    labelRef.current.dataset.atlasVisible =
      show && placement ? "true" : "false";
    if (placement) {
      const [nextX, nextY] = placement;
      labelRef.current.style.setProperty("--atlas-label-x", `${nextX}px`);
      labelRef.current.style.setProperty("--atlas-label-y", `${nextY}px`);
      labelRef.current.style.setProperty(
        "--atlas-leader-length",
        `${Math.hypot(nextX, nextY)}px`,
      );
      labelRef.current.style.setProperty(
        "--atlas-leader-angle",
        `${Math.atan2(nextY, nextX)}rad`,
      );
      labelRef.current.classList.toggle(styles.raceLabelLeft, nextX < 0);
    }
  });

  return (
    <Html
      position={anchor.position}
      center
      distanceFactor={7.4}
      zIndexRange={[24, 2]}
      style={{ pointerEvents: selectable ? "auto" : "none" }}
    >
      <div
        ref={labelRef}
        className={`${styles.raceLabelAnchor} ${
          emphasis === "selected" || emphasis === "hovered"
            ? styles.raceLabelActive
            : ""
        } ${offsetX < 0 ? styles.raceLabelLeft : ""}`}
        style={customStyle}
        data-atlas-station-label={anchor.race.id}
        data-atlas-region={anchor.race.region}
      >
        <span className={styles.raceLabelLine} aria-hidden="true" />
        <button
          type="button"
          className={styles.raceLabelBody}
          tabIndex={selectable ? 0 : -1}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(anchor.race.id);
          }}
        >
          <span className={styles.raceLabelName}>{anchor.race.city}</span>
          <span className={styles.raceLabelMeta}>
            R{String(anchor.race.round).padStart(2, "0")}
          </span>
        </button>
      </div>
    </Html>
  );
}

function RaceNode({
  anchor,
  state,
  visibility,
  showLabel,
  labelSelectable,
  revealDelay = 0,
  revealVersion,
  reducedMotion,
  onSelect,
}: {
  anchor: StationAnchor;
  state: NodeState;
  visibility: number;
  showLabel: boolean;
  labelSelectable: boolean;
  revealDelay?: number;
  revealVersion: number;
  reducedMotion: boolean;
  onSelect: (raceId: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const coreMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const energyRef = useRef(0);
  const visibilityRef = useRef(0);
  const revealElapsedRef = useRef(
    revealDelay > 0 ? 0 : Number.POSITIVE_INFINITY,
  );
  const { camera, size } = useThree();
  const cameraDirection = useMemo(() => new THREE.Vector3(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const targetColor = useMemo(() => {
    if (state === "selected") return new THREE.Color("#f2d28c");
    if (state === "hovered") return new THREE.Color("#c9e7ff");
    if (state === "current") return new THREE.Color("#d5bd83");
    return new THREE.Color("#b7c0c7");
  }, [state]);
  const quaternion = useMemo(
    () => tangentQuaternion(anchor.normal),
    [anchor.normal],
  );

  useEffect(() => {
    revealElapsedRef.current =
      visibility > 0 && revealDelay > 0 ? 0 : Number.POSITIVE_INFINITY;
    visibilityRef.current = 0;
  }, [revealDelay, revealVersion, size.height, size.width, visibility]);

  useFrame(({ clock }, delta) => {
    if (revealElapsedRef.current !== Number.POSITIVE_INFINITY) {
      revealElapsedRef.current += delta;
    }
    cameraDirection.copy(camera.position).normalize();
    const surfaceVisible = isSurfacePointVisible(
      anchor.normal.dot(cameraDirection),
      camera.position.length(),
      EARTH_RADIUS,
      0.006,
    );
    projected.copy(anchor.position).project(camera);
    const screenVisible = isProjectedPointVisible(projected);
    const revealReady = revealElapsedRef.current >= revealDelay;
    const visibilityTarget =
      revealReady && surfaceVisible && screenVisible ? visibility : 0;
    visibilityRef.current = THREE.MathUtils.damp(
      visibilityRef.current,
      visibilityTarget,
      visibilityTarget > visibilityRef.current ? 5.5 : 7.5,
      delta,
    );

    const target =
      state === "selected"
        ? 1
        : state === "hovered"
          ? 0.62
          : state === "current"
            ? 0.26
            : 0.08;
    energyRef.current = THREE.MathUtils.damp(
      energyRef.current,
      target,
      state === "idle" ? 4 : 7,
      delta,
    );
    const energy = energyRef.current;
    const active = state !== "idle";
    const breath =
      reducedMotion || !active
        ? 1
        : 1 +
          Math.sin(
            clock.elapsedTime * (state === "current" ? 0.34 : 0.78) +
              anchor.race.round * 0.37,
          ) *
            (state === "current" ? 0.018 : 0.025);
    const visibilityValue = visibilityRef.current;

    if (groupRef.current) {
      groupRef.current.visible = visibilityValue > 0.004;
      groupRef.current.scale.setScalar((0.96 + energy * 0.1) * breath);
    }
    if (haloMaterialRef.current) {
      haloMaterialRef.current.opacity =
        visibilityValue * (0.028 + energy * 0.12);
      haloMaterialRef.current.color.lerp(
        targetColor,
        1 - Math.exp(-delta * 7),
      );
    }
    if (ringMaterialRef.current) {
      ringMaterialRef.current.opacity =
        visibilityValue * (0.014 + energy * 0.075);
      ringMaterialRef.current.color.lerp(
        targetColor,
        1 - Math.exp(-delta * 7),
      );
    }
    if (coreMaterialRef.current) {
      const luminanceBreath = active ? 1 + (breath - 1) * 1.4 : 1;
      coreMaterialRef.current.opacity =
        visibilityValue * (0.56 + energy * 0.38);
      coreMaterialRef.current.emissiveIntensity =
        (0.52 + energy * 1.1) * luminanceBreath;
      coreMaterialRef.current.color.lerp(
        targetColor,
        1 - Math.exp(-delta * 7),
      );
      coreMaterialRef.current.emissive.lerp(
        targetColor,
        1 - Math.exp(-delta * 7),
      );
    }
  });

  return (
    <>
      <group
        ref={groupRef}
        position={anchor.position}
        quaternion={quaternion}
        visible={false}
      >
        <mesh>
          <sphereGeometry args={[0.021, 16, 12]} />
          <meshStandardMaterial
            ref={coreMaterialRef}
            color="#b7c0c7"
            emissive="#b7c0c7"
            emissiveIntensity={0.6}
            roughness={0.25}
            metalness={0.1}
            transparent
            opacity={0}
          />
        </mesh>
        <mesh position={[0, 0, 0.004]}>
          <circleGeometry args={[0.038, 32]} />
          <meshBasicMaterial
            ref={haloMaterialRef}
            color="#b7c0c7"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh position={[0, 0, 0.006]}>
          <ringGeometry args={[0.039, 0.043, 36]} />
          <meshBasicMaterial
            ref={ringMaterialRef}
            color="#b7c0c7"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
      <RaceLabel
        anchor={anchor}
        show={showLabel}
        emphasis={state}
        selectable={labelSelectable}
        onSelect={onSelect}
      />
    </>
  );
}

function EuropeEntryNode({
  normal,
  position,
  hovered,
  current,
  visible,
  onSelect,
}: {
  normal: THREE.Vector3;
  position: THREE.Vector3;
  hovered: boolean;
  current: boolean;
  visible: boolean;
  onSelect: (targetId: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const visibilityRef = useRef(0);
  const { camera, size } = useThree();
  const cameraDirection = useMemo(() => new THREE.Vector3(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const quaternion = useMemo(() => tangentQuaternion(normal), [normal]);
  const warm = useMemo(() => new THREE.Color("#e2c988"), []);
  const cold = useMemo(() => new THREE.Color("#c4dcf0"), []);

  useEffect(() => {
    visibilityRef.current = 0;
  }, [size.height, size.width]);

  useFrame((_, delta) => {
    cameraDirection.copy(camera.position).normalize();
    const frontFacing = isSurfacePointVisible(
      normal.dot(cameraDirection),
      camera.position.length(),
      EARTH_RADIUS,
    );
    projected.copy(position).project(camera);
    const placement =
      frontFacing && isProjectedPointVisible(projected)
        ? chooseAdaptiveLabelOffset({
            point: projected,
            viewportWidth: size.width,
            viewportHeight: size.height,
            preferred: [70, -42],
            labelWidth: 194,
          })
        : null;
    const target = visible && placement ? 1 : 0;
    visibilityRef.current = THREE.MathUtils.damp(
      visibilityRef.current,
      target,
      target > visibilityRef.current ? 5.5 : 8,
      delta,
    );
    const value = visibilityRef.current;
    const energy = hovered ? 0.66 : current ? 0.46 : 0.24;
    const targetColor = current || hovered ? warm : cold;
    if (groupRef.current) {
      groupRef.current.visible = value > 0.004;
      groupRef.current.scale.setScalar(0.98 + energy * 0.08);
    }
    if (coreMaterialRef.current) {
      coreMaterialRef.current.opacity = value * (0.65 + energy * 0.25);
      coreMaterialRef.current.emissiveIntensity = 0.62 + energy * 0.85;
      coreMaterialRef.current.color.lerp(targetColor, 1 - Math.exp(-delta * 7));
      coreMaterialRef.current.emissive.lerp(targetColor, 1 - Math.exp(-delta * 7));
    }
    if (haloMaterialRef.current) {
      haloMaterialRef.current.opacity = value * (0.04 + energy * 0.1);
      haloMaterialRef.current.color.lerp(targetColor, 1 - Math.exp(-delta * 7));
    }
    if (ringMaterialRef.current) {
      ringMaterialRef.current.opacity = value * (0.025 + energy * 0.07);
      ringMaterialRef.current.color.lerp(targetColor, 1 - Math.exp(-delta * 7));
    }
    if (labelRef.current) {
      labelRef.current.style.opacity = (
        value * (hovered || current ? 1 : 0.78)
      ).toFixed(3);
      labelRef.current.style.visibility = value < 0.015 ? "hidden" : "visible";
      labelRef.current.style.pointerEvents = value > 0.2 ? "auto" : "none";
      if (placement) {
        const [nextX, nextY] = placement;
        labelRef.current.style.setProperty("--atlas-region-x", `${nextX}px`);
        labelRef.current.style.setProperty("--atlas-region-y", `${nextY}px`);
        labelRef.current.style.setProperty(
          "--atlas-region-line-length",
          `${Math.hypot(nextX, nextY)}px`,
        );
        labelRef.current.style.setProperty(
          "--atlas-region-line-angle",
          `${Math.atan2(nextY, nextX)}rad`,
        );
        labelRef.current.classList.toggle(styles.regionLabelLeft, nextX < 0);
      }
    }
  });

  return (
    <>
      <group
        ref={groupRef}
        position={position}
        quaternion={quaternion}
        visible={false}
      >
        <mesh>
          <sphereGeometry args={[0.024, 18, 14]} />
          <meshStandardMaterial
            ref={coreMaterialRef}
            color="#e2c988"
            emissive="#d8bd79"
            emissiveIntensity={0.8}
            roughness={0.3}
            transparent
            opacity={0}
          />
        </mesh>
        <mesh position={[0, 0, 0.004]}>
          <circleGeometry args={[0.044, 36]} />
          <meshBasicMaterial
            ref={haloMaterialRef}
            color="#c4dcf0"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh position={[0, 0, 0.006]}>
          <ringGeometry args={[0.045, 0.049, 40]} />
          <meshBasicMaterial
            ref={ringMaterialRef}
            color="#e0c784"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </group>
      <Html
        position={position}
        center
        distanceFactor={7.6}
        zIndexRange={[26, 3]}
        style={{ pointerEvents: "auto" }}
      >
        <div ref={labelRef} className={styles.regionLabelAnchor}>
          <span className={styles.regionLabelLine} aria-hidden="true" />
          <button
            type="button"
            className={styles.regionLabel}
            data-atlas-target={EUROPE_ENTRY_ID}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(EUROPE_ENTRY_ID);
            }}
          >
            EUROPE SEASON <span aria-hidden="true">·</span> 9 ROUNDS
          </button>
        </div>
      </Html>
    </>
  );
}

function FocusParticles({
  focusPosition,
  level,
  reducedMotion,
}: {
  focusPosition: THREE.Vector3 | null;
  level: "current" | "hovered" | "selected" | null;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const strengthRef = useRef(0);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const count = 40;
  const { geometry, radii, angles, heights, speeds } = useMemo(() => {
    const random = seededRandom(22610);
    const positions = new Float32Array(count * 3);
    const localRadii = new Float32Array(count);
    const localAngles = new Float32Array(count);
    const localHeights = new Float32Array(count);
    const localSpeeds = new Float32Array(count);
    const bufferGeometry = new THREE.BufferGeometry();

    for (let index = 0; index < count; index += 1) {
      localRadii[index] = 0.018 + random() * 0.037;
      localAngles[index] = random() * Math.PI * 2;
      localHeights[index] = (random() - 0.5) * 0.026;
      localSpeeds[index] = 0.32 + random() * 0.58;
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
    const targetStrength =
      level === "selected" ? 1 : level === "hovered" ? 0.62 : level === "current" ? 0.42 : 0;
    strengthRef.current = THREE.MathUtils.damp(
      strengthRef.current,
      targetStrength,
      targetStrength > strengthRef.current ? 5.5 : 7.5,
      delta,
    );
    const strength = strengthRef.current;

    if (focusPosition) {
      targetPosition.copy(focusPosition).setLength(NODE_RADIUS + 0.012);
      targetQuaternion.copy(tangentQuaternion(targetPosition.clone().normalize()));
    }

    if (groupRef.current) {
      groupRef.current.position.lerp(targetPosition, 1 - Math.exp(-delta * 8));
      groupRef.current.quaternion.slerp(targetQuaternion, 1 - Math.exp(-delta * 8));
      groupRef.current.visible = strength > 0.008;
    }
    if (materialRef.current) {
      materialRef.current.opacity = strength * 0.2;
    }
    if (ringMaterialRef.current) {
      ringMaterialRef.current.opacity = strength * 0.1;
    }

    const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
    const positions = attribute.array as Float32Array;
    const elapsed = reducedMotion ? 0 : clock.elapsedTime;
    for (let index = 0; index < count; index += 1) {
      const convergence = THREE.MathUtils.lerp(1, 0.62, strength);
      const radius = radii[index] * convergence;
      const angle = angles[index] + elapsed * speeds[index] * (0.2 + strength * 0.75);
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle) * radius;
      positions[index * 3 + 2] = heights[index] + Math.sin(angle * 2.3) * 0.004;
    }
    attribute.needsUpdate = true;
  });

  return (
    <group ref={groupRef} visible={false}>
      <points geometry={geometry}>
        <pointsMaterial
          ref={materialRef}
          color="#ffd993"
          size={0.0075}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh position={[0, 0, -0.002]}>
        <ringGeometry args={[0.039, 0.043, 48]} />
        <meshBasicMaterial
          ref={ringMaterialRef}
          color="#95c9ff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function RaycastMagnet({
  targets,
  resetKey,
  onHoverTarget,
  onSelectTarget,
}: {
  targets: readonly InteractiveTarget[];
  resetKey: string;
  onHoverTarget: (targetId: string | null) => void;
  onSelectTarget: (targetId: string) => void;
}) {
  const hitTargetRef = useRef<THREE.Mesh>(null);
  const { camera, gl, raycaster } = useThree();
  const pointerNdc = useRef(new THREE.Vector2(99, 99));
  const pointerInside = useRef(false);
  const pointerDown = useRef<{ x: number; y: number; at: number } | null>(null);
  const draggingRef = useRef(false);
  const stableIdRef = useRef<string | null>(null);
  const stableSinceRef = useRef(0);
  const pendingIdRef = useRef<string | null>(null);
  const pendingSinceRef = useRef(0);
  const missSinceRef = useRef<number | null>(null);
  const lastReportedIdRef = useRef<string | null>(null);
  const suspendUntilRef = useRef(0);
  const targetMap = useMemo(
    () => new Map(targets.map((target) => [target.id, target])),
    [targets],
  );
  const projected = useMemo(() => new THREE.Vector3(), []);

  const acquireRadius = useCallback(() => {
    const mapped = THREE.MathUtils.mapLinear(
      camera.position.length(),
      CAMERA_NEAR_DISTANCE,
      CAMERA_FAR_DISTANCE,
      3.2,
      5.5,
    );
    return THREE.MathUtils.clamp(mapped, 3.2, 5.5);
  }, [camera]);

  const reportTarget = useCallback(
    (targetId: string | null) => {
      if (lastReportedIdRef.current === targetId) return;
      lastReportedIdRef.current = targetId;
      onHoverTarget(targetId);
    },
    [onHoverTarget],
  );

  const resolveNearestTarget = useCallback(() => {
    if (!hitTargetRef.current) return null;

    raycaster.setFromCamera(pointerNdc.current, camera);
    const hit = raycaster.intersectObject(hitTargetRef.current, false)[0];
    if (!hit) return null;

    const surface = hit.point.clone().normalize();
    const cameraDirection = camera.position.clone().normalize();
    let closest: { id: string; distance: number; surface: THREE.Vector3 } | null = null;

    for (const target of targets) {
      if (
        !isSurfacePointVisible(
          target.normal.dot(cameraDirection),
          camera.position.length(),
          EARTH_RADIUS,
          0.008,
        )
      ) {
        continue;
      }
      projected.copy(target.position).project(camera);
      if (!isProjectedPointVisible(projected)) continue;
      const distance = angularDistanceDegrees(surface, target.normal);
      if (!closest || distance < closest.distance) {
        closest = { id: target.id, distance, surface };
      }
    }

    return closest;
  }, [camera, projected, raycaster, targets]);

  useEffect(() => {
    stableIdRef.current = null;
    stableSinceRef.current = 0;
    pendingIdRef.current = null;
    missSinceRef.current = null;
    suspendUntilRef.current = performance.now() + 420;
    reportTarget(null);
  }, [reportTarget, resetKey]);

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
    const handleMove = (event: PointerEvent) => {
      updatePointer(event);
      const start = pointerDown.current;
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) {
        draggingRef.current = true;
      }
    };
    const handleLeave = () => {
      pointerInside.current = false;
      pointerDown.current = null;
      draggingRef.current = false;
      canvas.style.cursor = "grab";
    };
    const handleDown = (event: PointerEvent) => {
      updatePointer(event);
      pointerDown.current = { x: event.clientX, y: event.clientY, at: performance.now() };
      draggingRef.current = false;
      canvas.style.cursor = "grabbing";
    };
    const handleUp = (event: PointerEvent) => {
      updatePointer(event);
      const start = pointerDown.current;
      const wasDragging = draggingRef.current;
      pointerDown.current = null;
      draggingRef.current = false;
      const closest = resolveNearestTarget();
      const travel = start
        ? Math.hypot(event.clientX - start.x, event.clientY - start.y)
        : Number.POSITIVE_INFINITY;
      const elapsed = start ? performance.now() - start.at : Number.POSITIVE_INFINITY;
      const tappedTarget =
        closest && closest.distance <= acquireRadius() * 1.08
          ? closest.id
          : stableIdRef.current;
      if (!wasDragging && travel < 9 && elapsed < 520 && tappedTarget) {
        onSelectTarget(tappedTarget);
      }
      canvas.style.cursor = tappedTarget ? "pointer" : "grab";
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
  }, [acquireRadius, gl, onSelectTarget, resolveNearestTarget]);

  useFrame(() => {
    const now = performance.now();
    if (!hitTargetRef.current || now < suspendUntilRef.current) return;
    if (draggingRef.current) return;

    const closest = pointerInside.current ? resolveNearestTarget() : null;
    const acquire = acquireRadius();
    const release = acquire * 1.45;
    const stableId = stableIdRef.current;
    const stableTarget = stableId ? targetMap.get(stableId) : null;
    const stableDistance =
      closest && stableTarget
        ? angularDistanceDegrees(closest.surface, stableTarget.normal)
        : Number.POSITIVE_INFINITY;
    const stableAge = now - stableSinceRef.current;

    if (!stableId || !stableTarget) {
      if (closest && closest.distance <= acquire) {
        if (pendingIdRef.current !== closest.id) {
          pendingIdRef.current = closest.id;
          pendingSinceRef.current = now;
        } else if (now - pendingSinceRef.current >= 90) {
          stableIdRef.current = closest.id;
          stableSinceRef.current = now;
          pendingIdRef.current = null;
          missSinceRef.current = null;
          reportTarget(closest.id);
        }
      } else {
        pendingIdRef.current = null;
      }
    } else if (closest?.id === stableId && closest.distance <= release) {
      pendingIdRef.current = null;
      missSinceRef.current = null;
    } else if (closest && closest.distance <= acquire) {
      const switchMargin = Math.min(0.65, acquire * 0.15);
      const hasClearAdvantage =
        stableDistance > release || stableDistance - closest.distance >= switchMargin;
      if (hasClearAdvantage && stableAge >= 220) {
        if (pendingIdRef.current !== closest.id) {
          pendingIdRef.current = closest.id;
          pendingSinceRef.current = now;
        } else if (now - pendingSinceRef.current >= 110) {
          stableIdRef.current = closest.id;
          stableSinceRef.current = now;
          pendingIdRef.current = null;
          missSinceRef.current = null;
          reportTarget(closest.id);
        }
      } else {
        pendingIdRef.current = null;
      }
      missSinceRef.current = null;
    } else {
      pendingIdRef.current = null;
      const remainsInsideRelease =
        closest !== null && stableDistance <= release;
      if (remainsInsideRelease) {
        missSinceRef.current = null;
      } else if (missSinceRef.current === null) {
        missSinceRef.current = now;
      } else if (stableAge >= 220 && now - missSinceRef.current >= 180) {
        stableIdRef.current = null;
        stableSinceRef.current = 0;
        missSinceRef.current = null;
        reportTarget(null);
      }
    }

    if (!pointerDown.current) {
      gl.domElement.style.cursor = stableIdRef.current ? "pointer" : "grab";
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
  viewMode,
  navigationVersion,
  hoveredTargetId,
  selectedRace,
  autoFocusRace,
  autoFocusVersion,
  europeNormal,
  reducedMotion,
}: {
  viewMode: AtlasViewMode;
  navigationVersion: number;
  hoveredTargetId: string | null;
  selectedRace: SeasonRace | null;
  autoFocusRace: SeasonRace | null;
  autoFocusVersion: number;
  europeNormal: THREE.Vector3;
  reducedMotion: boolean;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const interactingRef = useRef(false);
  const autoRotateSpeedRef = useRef(0);
  const idleCooldownRef = useRef(0);
  const flightRef = useRef<{
    fromDirection: THREE.Vector3;
    fromDistance: number;
    toDistance: number;
    fromTarget: THREE.Vector3;
    rotation: THREE.Quaternion;
    elapsed: number;
    duration: number;
  } | null>(null);
  const hoverBaseDistanceRef = useRef<number | null>(null);
  const hoverDistanceTargetRef = useRef<number | null>(null);
  const appliedAutoFocusRef = useRef(0);
  const appliedNavigationRef = useRef<number | null>(null);
  const zeroTarget = useMemo(() => new THREE.Vector3(), []);
  const frameDirection = useMemo(() => new THREE.Vector3(), []);
  const frameRotation = useMemo(() => new THREE.Quaternion(), []);

  const modeRange =
    viewMode === "global"
      ? { min: CAMERA_NEAR_DISTANCE, max: CAMERA_FAR_DISTANCE }
      : viewMode === "europe-focus"
        ? { min: 4.55, max: 6.4 }
        : { min: 4.25, max: 5.85 };

  useEffect(() => {
    const hasNewNavigation = appliedNavigationRef.current !== navigationVersion;
    const hasNewAutoFocus =
      viewMode === "global" &&
      Boolean(autoFocusRace) &&
      autoFocusVersion > appliedAutoFocusRef.current;
    if (!hasNewNavigation && !hasNewAutoFocus) return;

    appliedNavigationRef.current = navigationVersion;
    if (hasNewAutoFocus) appliedAutoFocusRef.current = autoFocusVersion;

    const controls = controlsRef.current;
    const homeNormal = latLonToVector3(31, 5, 1).normalize();
    const autoFocusNormal =
      autoFocusRace?.region === EUROPE_REGION
        ? europeNormal
        : autoFocusRace
          ? latLonToVector3(
              autoFocusRace.latitude,
              autoFocusRace.longitude,
              1,
            ).normalize()
          : homeNormal;
    const desiredNormal =
      hasNewAutoFocus
        ? autoFocusNormal
        : viewMode === "global"
        ? homeNormal
        : viewMode === "europe-focus"
          ? europeNormal
          : selectedRace
            ? latLonToVector3(
                selectedRace.latitude,
                selectedRace.longitude,
                1,
              ).normalize()
            : europeNormal;
    const desiredDistance = hasNewAutoFocus
      ? autoFocusRace?.region === EUROPE_REGION
        ? 5.35
        : 5.25
      : viewMode === "global"
        ? 7.45
        : viewMode === "europe-focus"
          ? 5.08
          : 4.58;

    if (controls) {
      controls.minDistance = modeRange.min;
      controls.maxDistance = modeRange.max;
    }
    hoverBaseDistanceRef.current = null;
    hoverDistanceTargetRef.current = null;
    interactingRef.current = false;
    autoRotateSpeedRef.current = 0;
    idleCooldownRef.current = viewMode === "global" ? 1.15 : 0;

    if (reducedMotion) {
      camera.position.copy(desiredNormal).multiplyScalar(desiredDistance);
      controls?.target.copy(zeroTarget);
      controls?.update();
      flightRef.current = null;
    } else {
      const fromDirection = camera.position.clone().normalize();
      flightRef.current = {
        fromDirection,
        fromDistance: camera.position.length(),
        toDistance: desiredDistance,
        fromTarget: controls?.target.clone() ?? zeroTarget.clone(),
        rotation: new THREE.Quaternion().setFromUnitVectors(
          fromDirection,
          desiredNormal,
        ),
        elapsed: 0,
        duration: viewMode === "global" ? 1.35 : 1.18,
      };
    }
  }, [
    autoFocusRace,
    autoFocusVersion,
    camera,
    europeNormal,
    modeRange.max,
    modeRange.min,
    navigationVersion,
    reducedMotion,
    selectedRace,
    viewMode,
    zeroTarget,
  ]);

  useEffect(() => {
    if (viewMode !== "global" || flightRef.current) {
      hoverBaseDistanceRef.current = null;
      hoverDistanceTargetRef.current = null;
      return;
    }

    if (hoveredTargetId) {
      if (hoverBaseDistanceRef.current === null) {
        hoverBaseDistanceRef.current = camera.position.length();
      }
      hoverDistanceTargetRef.current = Math.max(
        CAMERA_NEAR_DISTANCE,
        hoverBaseDistanceRef.current - 0.1,
      );
    } else if (hoverBaseDistanceRef.current !== null) {
      hoverDistanceTargetRef.current = hoverBaseDistanceRef.current;
    }
  }, [camera, hoveredTargetId, navigationVersion, viewMode]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    idleCooldownRef.current = Math.max(0, idleCooldownRef.current - delta);
    const waitingForIdle = idleCooldownRef.current > 0;
    const shouldPause =
      reducedMotion ||
      interactingRef.current ||
      waitingForIdle ||
      Boolean(flightRef.current) ||
      viewMode !== "global";
    const desiredAutoSpeed = shouldPause ? 0 : hoveredTargetId ? 0.055 : 0.19;
    autoRotateSpeedRef.current = THREE.MathUtils.damp(
      autoRotateSpeedRef.current,
      desiredAutoSpeed,
      2.2,
      delta,
    );
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = autoRotateSpeedRef.current;

    const flight = flightRef.current;
    if (flight && !interactingRef.current) {
      flight.elapsed = Math.min(flight.duration, flight.elapsed + delta);
      const linearProgress = flight.elapsed / flight.duration;
      const progress =
        linearProgress < 0.5
          ? 4 * linearProgress * linearProgress * linearProgress
          : 1 - Math.pow(-2 * linearProgress + 2, 3) / 2;
      frameRotation.identity().slerp(flight.rotation, progress);
      frameDirection
        .copy(flight.fromDirection)
        .applyQuaternion(frameRotation)
        .normalize();
      camera.position
        .copy(frameDirection)
        .multiplyScalar(
          THREE.MathUtils.lerp(
            flight.fromDistance,
            flight.toDistance,
            progress,
          ),
        );
      controls.target.lerpVectors(flight.fromTarget, zeroTarget, progress);
      controls.update();
      if (linearProgress >= 1) flightRef.current = null;
    } else if (
      hoverDistanceTargetRef.current !== null &&
      !interactingRef.current &&
      viewMode === "global" &&
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
        !hoveredTargetId &&
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
      minDistance={modeRange.min}
      maxDistance={modeRange.max}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI - 0.12}
      onStart={() => {
        interactingRef.current = true;
        flightRef.current = null;
        hoverBaseDistanceRef.current = null;
        hoverDistanceTargetRef.current = null;
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
    () => new UnrealBloomPass(new THREE.Vector2(1, 1), 0.26, 0.34, 0.92),
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

function ViewportSync({ compact }: { compact: boolean }) {
  const { camera, gl, size } = useThree();

  useEffect(() => {
    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      compact ? 1.25 : 1.7,
    );
    gl.setPixelRatio(pixelRatio);
    gl.setSize(size.width, size.height, false);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = size.width / Math.max(size.height, 1);
      camera.updateProjectionMatrix();
    }
  }, [camera, compact, gl, size.height, size.width]);

  return null;
}

function AtlasScene({
  races,
  hoveredTargetId,
  hoveredRace,
  selectedRace,
  currentRace,
  autoFocusRace,
  autoFocusVersion,
  viewMode,
  navigationVersion,
  reducedMotion,
  compact,
  onHoverTarget,
  onSelectTarget,
  onSceneReady,
}: SceneProps) {
  const stationAnchors = useMemo<StationAnchor[]>(
    () =>
      races.map((race) => {
        const position = latLonToVector3(
          race.latitude,
          race.longitude,
          NODE_RADIUS,
        );
        return {
          race,
          position,
          normal: position.clone().normalize(),
          labelOffset:
            EUROPE_LABEL_OFFSETS[race.id] ??
            DEFAULT_LABEL_OFFSETS[race.id] ??
            [58, -20],
        };
      }),
    [races],
  );
  const anchorMap = useMemo(
    () => new Map(stationAnchors.map((anchor) => [anchor.race.id, anchor])),
    [stationAnchors],
  );
  const europeAnchors = useMemo(
    () =>
      stationAnchors.filter(
        (anchor) => anchor.race.region === EUROPE_REGION,
      ),
    [stationAnchors],
  );
  const europeNormal = useMemo(() => {
    const result = new THREE.Vector3();
    for (const anchor of europeAnchors) result.add(anchor.normal);
    return result.normalize();
  }, [europeAnchors]);
  const europeEntry = useMemo<InteractiveTarget>(
    () => ({
      id: EUROPE_ENTRY_ID,
      kind: "region",
      normal: europeNormal,
      position: europeNormal.clone().multiplyScalar(NODE_RADIUS),
    }),
    [europeNormal],
  );
  const isEuropeContext =
    viewMode === "europe-focus" ||
    (viewMode === "station-focus" &&
      selectedRace?.region === EUROPE_REGION);
  const currentFocusAnchor =
    viewMode === "global" && currentRace.region === EUROPE_REGION
      ? europeEntry
      : anchorMap.get(currentRace.id) ?? null;
  const activeFocusAnchor = selectedRace
    ? anchorMap.get(selectedRace.id) ?? null
    : hoveredTargetId === EUROPE_ENTRY_ID
      ? europeEntry
      : hoveredRace
        ? anchorMap.get(hoveredRace.id) ?? null
        : currentFocusAnchor;
  const focusLevel = selectedRace
    ? "selected"
    : hoveredTargetId || hoveredRace
      ? "hovered"
      : currentFocusAnchor
        ? "current"
      : null;

  useEffect(() => {
    onSceneReady();
  }, [onSceneReady]);
  const interactiveTargets = useMemo<InteractiveTarget[]>(() => {
    if (viewMode === "global") {
      return [
        ...stationAnchors
          .filter((anchor) => anchor.race.region !== EUROPE_REGION)
          .map((anchor) => ({
            id: anchor.race.id,
            kind: "station" as const,
            normal: anchor.normal,
            position: anchor.position,
          })),
        europeEntry,
      ];
    }
    if (isEuropeContext) {
      return europeAnchors.map((anchor) => ({
        id: anchor.race.id,
        kind: "station" as const,
        normal: anchor.normal,
        position: anchor.position,
      }));
    }
    return stationAnchors
      .filter((anchor) => anchor.race.region !== EUROPE_REGION)
      .map((anchor) => ({
        id: anchor.race.id,
        kind: "station" as const,
        normal: anchor.normal,
        position: anchor.position,
      }));
  }, [
    europeAnchors,
    europeEntry,
    isEuropeContext,
    stationAnchors,
    viewMode,
  ]);

  return (
    <>
      <color attach="background" args={["#01040a"]} />
      <fog attach="fog" args={["#01040a", 15, 39]} />
      <ViewportSync compact={compact} />
      <ambientLight intensity={0.14} />
      <directionalLight position={[4, 3, 2]} intensity={0.28} color="#a9ccf4" />
      <StarField compact={compact} reducedMotion={reducedMotion} />
      <EarthSystem
        focusNormal={activeFocusAnchor?.normal ?? null}
        focusLevel={focusLevel === "selected" ? 0.58 : focusLevel ? 0.32 : 0}
        reducedMotion={reducedMotion}
      />
      <EuropePlate active={isEuropeContext} reducedMotion={reducedMotion} />
      {stationAnchors.map((anchor) => {
        const { race } = anchor;
        const hovered = hoveredTargetId === race.id;
        const selected = selectedRace?.id === race.id;
        const current = currentRace.id === race.id;
        const visibility =
          viewMode === "global"
            ? race.region === EUROPE_REGION
              ? 0
              : 1
            : isEuropeContext
              ? race.region === EUROPE_REGION
                ? 1
                : 0
              : selected
                ? 1
                : race.region === EUROPE_REGION
                  ? 0
                  : 0.16;
        const nodeState: NodeState = selected
          ? "selected"
          : hovered
            ? "hovered"
            : current && visibility > 0.5
              ? "current"
              : "idle";
        const showLabel = visibility > 0 && (hovered || selected);
        const labelSelectable = showLabel && visibility > 0.2;

        return (
          <RaceNode
            key={race.id}
            anchor={anchor}
            state={nodeState}
            visibility={visibility}
            showLabel={showLabel}
            labelSelectable={labelSelectable}
            revealDelay={
              viewMode === "europe-focus" && race.region === EUROPE_REGION
                ? 0.34 + (race.round % 3) * 0.04
                : 0
            }
            revealVersion={navigationVersion}
            reducedMotion={reducedMotion}
            onSelect={onSelectTarget}
          />
        );
      })}
      <EuropeEntryNode
        normal={europeEntry.normal}
        position={europeEntry.position}
        hovered={hoveredTargetId === EUROPE_ENTRY_ID}
        current={currentRace.region === EUROPE_REGION}
        visible={viewMode === "global"}
        onSelect={onSelectTarget}
      />
      <FocusParticles
        focusPosition={activeFocusAnchor?.position ?? null}
        level={focusLevel}
        reducedMotion={reducedMotion}
      />
      <RaycastMagnet
        targets={interactiveTargets}
        resetKey={`${viewMode}:${navigationVersion}`}
        onHoverTarget={onHoverTarget}
        onSelectTarget={onSelectTarget}
      />
      <AtlasControls
        viewMode={viewMode}
        navigationVersion={navigationVersion}
        hoveredTargetId={hoveredTargetId}
        selectedRace={selectedRace}
        autoFocusRace={autoFocusRace}
        autoFocusVersion={autoFocusVersion}
        europeNormal={europeNormal}
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
