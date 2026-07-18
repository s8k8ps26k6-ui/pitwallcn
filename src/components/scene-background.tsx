"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

export type SceneMotionState = {
  targetProgress: number;
  progress: number;
  targetVelocity: number;
  velocity: number;
  pointerX: number;
  pointerY: number;
  reducedMotion: boolean;
};

export type SceneBackgroundProps = {
  stateRef: React.MutableRefObject<SceneMotionState>;
};

type VectorFrame = {
  at: number;
  value: readonly [number, number, number];
};

type ParticleSet = {
  geometry: THREE.BufferGeometry;
  positions: Float32Array;
  seeds: Float32Array;
};

const GD_GOLD = new THREE.Color("#D4A843");
const GD_CYAN = new THREE.Color("#5FBFCA");
const GD_TEXT = new THREE.Color("#EDE9E0");
const GD_HOT = new THREE.Color("#E05C2A");

const CAMERA_FRAMES: VectorFrame[] = [
  { at: 0, value: [0, 0.02, 8.2] },
  { at: 0.22, value: [0.24, 0.14, 6.4] },
  { at: 0.42, value: [-1.45, 0.58, 4.6] },
  { at: 0.58, value: [-2.1, 0.72, 3.35] },
  { at: 0.72, value: [0.85, 0.4, 2.85] },
  { at: 0.84, value: [1.2, 0.85, 4.55] },
  { at: 1, value: [0, 0.28, 8.8] },
];

const LOOK_FRAMES: VectorFrame[] = [
  { at: 0, value: [0, -0.12, 0] },
  { at: 0.22, value: [0.08, -0.12, -1.2] },
  { at: 0.48, value: [-0.15, 0.08, -2.7] },
  { at: 0.64, value: [0.18, 0.04, -1.1] },
  { at: 0.84, value: [0, 0, -2.2] },
  { at: 1, value: [0, 0.02, -0.4] },
];

function clamp01(value: number) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function inverseLerp(start: number, end: number, value: number) {
  if (start === end) return 0;
  return clamp01((value - start) / (end - start));
}

function phasePeak(progress: number, center: number, width: number) {
  const distance = Math.abs(progress - center);
  return clamp01(1 - distance / width);
}

function smoothBand(progress: number, start: number, end: number) {
  return THREE.MathUtils.smoothstep(progress, start, end);
}

function sampleVectorFrames(frames: VectorFrame[], progress: number, target: THREE.Vector3) {
  let left = frames[0];
  let right = frames[frames.length - 1];

  for (let index = 0; index < frames.length - 1; index += 1) {
    const current = frames[index];
    const next = frames[index + 1];
    if (progress >= current.at && progress <= next.at) {
      left = current;
      right = next;
      break;
    }
  }

  const amount = THREE.MathUtils.smoothstep(inverseLerp(left.at, right.at, progress), 0, 1);
  target.set(
    THREE.MathUtils.lerp(left.value[0], right.value[0], amount),
    THREE.MathUtils.lerp(left.value[1], right.value[1], amount),
    THREE.MathUtils.lerp(left.value[2], right.value[2], amount),
  );
}

function createTrackCurve() {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-2.6, -0.78, 2.1),
      new THREE.Vector3(-1.44, -0.48, 0.55),
      new THREE.Vector3(0.36, -0.58, -0.65),
      new THREE.Vector3(1.46, -0.2, -2.42),
      new THREE.Vector3(0.64, 0.34, -3.85),
      new THREE.Vector3(-1.05, 0.18, -3.34),
      new THREE.Vector3(-1.72, -0.22, -1.85),
      new THREE.Vector3(-0.72, 0.02, -0.68),
      new THREE.Vector3(1.72, 0.42, -1.12),
      new THREE.Vector3(2.72, 0.16, -3.22),
      new THREE.Vector3(1.36, -0.38, -5.42),
      new THREE.Vector3(-0.9, -0.22, -6.9),
      new THREE.Vector3(-2.18, 0.36, -8.6),
    ],
    false,
    "catmullrom",
    0.52,
  );
}

function createParticleSet(count: number): ParticleSet {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const depth = Math.pow(Math.random(), 1.85);
    const z = THREE.MathUtils.lerp(9.5, -34, depth);
    const spread = THREE.MathUtils.lerp(2.2, 8.4, depth);
    const laneBias = Math.sin(index * 0.77) * 0.9;
    const x = (Math.random() - 0.5) * spread + laneBias;
    const y = (Math.random() - 0.5) * THREE.MathUtils.lerp(1.8, 5.6, depth);
    const seed = Math.random();
    const color = index % 4 === 0 ? GD_CYAN : GD_GOLD;

    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;
    seeds[index] = seed;

    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return { geometry, positions, seeds };
}

function createStreakGeometry(count: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 2 * 3);
  const seeds = new Float32Array(count * 4);

  for (let index = 0; index < count; index += 1) {
    const depth = Math.pow(Math.random(), 1.6);
    const spread = THREE.MathUtils.lerp(2.8, 9.2, depth);
    seeds[index * 4] = (Math.random() - 0.5) * spread;
    seeds[index * 4 + 1] = (Math.random() - 0.5) * THREE.MathUtils.lerp(2.2, 5.8, depth);
    seeds[index * 4 + 2] = THREE.MathUtils.lerp(8, -32, depth);
    seeds[index * 4 + 3] = 0.16 + Math.random() * 0.86;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return { geometry, positions, seeds };
}

function SceneFallback() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_48%,rgba(212,168,67,0.14),transparent_24%),radial-gradient(circle_at_62%_36%,rgba(95,191,202,0.09),transparent_28%)]" />
      <div className="absolute left-[-18vw] top-[58%] h-px w-[138vw] -rotate-6 bg-gradient-to-r from-transparent via-gdGold/70 to-transparent" />
      <div className="absolute left-[18vw] top-[47%] h-px w-[72vw] rotate-12 bg-gradient-to-r from-transparent via-gdCyan/35 to-transparent" />
      <div className="absolute bottom-[14%] left-[12%] h-24 w-[76%] border-t border-gdGold/20 opacity-70 [clip-path:polygon(6%_72%,32%_38%,62%_56%,90%_18%,96%_24%,64%_78%,31%_58%,9%_92%)]" />
    </div>
  );
}

function useWebGLState() {
  const [state, setState] = useState<"checking" | "ready" | "blocked">("checking");

  useEffect(() => {
    const canvas = document.createElement("canvas");
    let isReady = false;

    try {
      isReady = Boolean(
        canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ??
          canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }),
      );
    } catch {
      isReady = false;
    }

    setState(isReady ? "ready" : "blocked");
  }, []);

  return state;
}

function useSceneQuality() {
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    const syncMobile = () => {
      setIsMobile(mobileQuery.matches);
    };

    const syncVisibility = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    syncMobile();
    syncVisibility();
    mobileQuery.addEventListener("change", syncMobile);
    document.addEventListener("visibilitychange", syncVisibility);

    return () => {
      mobileQuery.removeEventListener("change", syncMobile);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  return { isMobile, isVisible };
}

function CameraRig({ stateRef }: SceneBackgroundProps) {
  const camera = useThree((state) => state.camera);
  const cameraTarget = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const motion = stateRef.current;
    const targetProgress = motion.reducedMotion ? 0.64 : motion.targetProgress;
    const damping = motion.reducedMotion ? 24 : 4.2;

    motion.progress = THREE.MathUtils.damp(motion.progress, targetProgress, damping, delta);
    motion.velocity = THREE.MathUtils.damp(motion.velocity, motion.targetVelocity, 7, delta);

    sampleVectorFrames(CAMERA_FRAMES, motion.progress, cameraTarget.current);
    sampleVectorFrames(LOOK_FRAMES, motion.progress, lookTarget.current);

    if (!motion.reducedMotion) {
      cameraTarget.current.x += motion.pointerX * 0.16;
      cameraTarget.current.y += motion.pointerY * -0.1;
      lookTarget.current.x += motion.pointerX * 0.06;
      lookTarget.current.y += motion.pointerY * -0.04;
    }

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      cameraTarget.current.x,
      4.8,
      delta,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      cameraTarget.current.y,
      4.8,
      delta,
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      cameraTarget.current.z,
      4.8,
      delta,
    );
    camera.lookAt(lookTarget.current);
  }, -100);

  return null;
}

function TrackRibbon({
  isMobile,
  stateRef,
}: {
  isMobile: boolean;
  stateRef: React.MutableRefObject<SceneMotionState>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const goldMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const cyanMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const curve = useMemo(createTrackCurve, []);
  const goldGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, isMobile ? 104 : 184, isMobile ? 0.017 : 0.022, isMobile ? 5 : 8, false),
    [curve, isMobile],
  );
  const cyanGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, isMobile ? 72 : 148, isMobile ? 0.006 : 0.008, 4, false),
    [curve, isMobile],
  );
  const haloGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, isMobile ? 64 : 126, isMobile ? 0.04 : 0.052, 5, false),
    [curve, isMobile],
  );

  useEffect(() => {
    return () => {
      goldGeometry.dispose();
      cyanGeometry.dispose();
      haloGeometry.dispose();
    };
  }, [cyanGeometry, goldGeometry, haloGeometry]);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const motion = stateRef.current;
    const progress = motion.progress;
    const pulse = 0.72 + Math.sin(clock.elapsedTime * 2.8 + progress * 9) * 0.2;
    const acceleration = smoothBand(progress, 0.22, 0.58);
    const release = smoothBand(progress, 0.84, 1);

    group.position.x = THREE.MathUtils.damp(group.position.x, THREE.MathUtils.lerp(0, -0.45, acceleration) + release * 0.36, 3.4, delta);
    group.position.y = THREE.MathUtils.damp(group.position.y, THREE.MathUtils.lerp(-0.22, -0.05, progress), 3.2, delta);
    group.position.z = THREE.MathUtils.damp(group.position.z, THREE.MathUtils.lerp(0.4, 1.7, release), 3.2, delta);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, -0.16 + progress * 0.38, 3.2, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, -0.52 + progress * 1.26, 3.2, delta);
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, -0.08 + Math.sin(progress * Math.PI) * 0.18, 3.2, delta);

    if (goldMaterialRef.current) {
      goldMaterialRef.current.opacity = motion.reducedMotion ? 0.68 : 0.36 + pulse * 0.34;
    }
    if (cyanMaterialRef.current) {
      cyanMaterialRef.current.opacity = 0.12 + phasePeak(progress, 0.46, 0.28) * 0.22;
    }
    if (haloMaterialRef.current) {
      haloMaterialRef.current.opacity = 0.035 + Math.abs(motion.velocity) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={haloGeometry}>
        <meshBasicMaterial
          ref={haloMaterialRef}
          color={GD_GOLD}
          depthWrite={false}
          transparent
          opacity={0.045}
        />
      </mesh>
      <mesh geometry={goldGeometry}>
        <meshBasicMaterial
          ref={goldMaterialRef}
          color={GD_GOLD}
          depthWrite={false}
          transparent
          opacity={0.58}
        />
      </mesh>
      <mesh geometry={cyanGeometry} position={[0.06, 0.035, -0.04]}>
        <meshBasicMaterial
          ref={cyanMaterialRef}
          color={GD_CYAN}
          depthWrite={false}
          transparent
          opacity={0.16}
        />
      </mesh>
      <EnergyNodes curve={curve} isMobile={isMobile} stateRef={stateRef} />
    </group>
  );
}

function EnergyNodes({
  curve,
  isMobile,
  stateRef,
}: {
  curve: THREE.CatmullRomCurve3;
  isMobile: boolean;
  stateRef: React.MutableRefObject<SceneMotionState>;
}) {
  const nodeRefs = useRef<Array<THREE.Mesh | null>>([]);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const temp = useRef(new THREE.Vector3());
  const count = isMobile ? 6 : 10;

  useFrame(({ clock }) => {
    const progress = stateRef.current.progress;
    const speed = stateRef.current.reducedMotion ? 0 : clock.elapsedTime * 0.035;

    for (let index = 0; index < count; index += 1) {
      const node = nodeRefs.current[index];
      if (!node) continue;

      const t = (index / count + speed + progress * 0.34) % 1;
      curve.getPointAt(t, temp.current);
      node.position.copy(temp.current);
      node.scale.setScalar(0.55 + phasePeak(t, 0.52, 0.2) * 0.65);
    }

    if (materialRef.current) {
      materialRef.current.opacity = 0.36 + phasePeak(progress, 0.54, 0.34) * 0.34;
    }
  });

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            nodeRefs.current[index] = node;
          }}
        >
          <sphereGeometry args={[isMobile ? 0.026 : 0.034, 8, 8]} />
          <meshBasicMaterial
            ref={index === 0 ? materialRef : undefined}
            color={index % 3 === 0 ? GD_CYAN : GD_GOLD}
            depthWrite={false}
            transparent
            opacity={0.46}
          />
        </mesh>
      ))}
    </>
  );
}

function VelocityParticles({
  isMobile,
  stateRef,
}: {
  isMobile: boolean;
  stateRef: React.MutableRefObject<SceneMotionState>;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const count = isMobile ? 720 : 1900;
  const particleSet = useMemo(() => createParticleSet(count), [count]);

  useEffect(() => {
    return () => {
      particleSet.geometry.dispose();
    };
  }, [particleSet]);

  useFrame((_, delta) => {
    const motion = stateRef.current;
    const positions = particleSet.positions;
    const speed = motion.reducedMotion
      ? 0
      : (0.018 + smoothBand(motion.progress, 0.18, 0.62) * 0.08 + Math.abs(motion.velocity) * 0.06) * delta * 60;

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      positions[offset + 2] += speed * (0.46 + particleSet.seeds[index] * 1.9);

      if (positions[offset + 2] > 10.5) {
        const depth = Math.pow(Math.random(), 1.7);
        const spread = THREE.MathUtils.lerp(2.2, 8.6, depth);
        positions[offset] = (Math.random() - 0.5) * spread;
        positions[offset + 1] = (Math.random() - 0.5) * THREE.MathUtils.lerp(1.8, 5.6, depth);
        positions[offset + 2] = -34 - Math.random() * 4;
      }
    }

    const positionAttribute = particleSet.geometry.getAttribute("position") as THREE.BufferAttribute;
    positionAttribute.needsUpdate = true;

    if (pointsRef.current) {
      pointsRef.current.rotation.y = -0.05 + motion.progress * 0.16;
      pointsRef.current.rotation.x = motion.pointerY * 0.035;
    }

    if (materialRef.current) {
      materialRef.current.size = isMobile
        ? 0.018 + Math.abs(motion.velocity) * 0.006
        : 0.026 + Math.abs(motion.velocity) * 0.01;
      materialRef.current.opacity = motion.reducedMotion ? 0.32 : 0.34 + smoothBand(motion.progress, 0.12, 0.64) * 0.24;
    }
  });

  return (
    <points ref={pointsRef} geometry={particleSet.geometry}>
      <pointsMaterial
        ref={materialRef}
        size={isMobile ? 0.018 : 0.026}
        vertexColors
        depthWrite={false}
        transparent
        opacity={0.4}
      />
    </points>
  );
}

function VelocityStreaks({
  isMobile,
  stateRef,
}: {
  isMobile: boolean;
  stateRef: React.MutableRefObject<SceneMotionState>;
}) {
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const count = isMobile ? 64 : 148;
  const streaks = useMemo(() => createStreakGeometry(count), [count]);

  useEffect(() => {
    return () => {
      streaks.geometry.dispose();
    };
  }, [streaks]);

  useFrame((_, delta) => {
    const motion = stateRef.current;
    const velocity = motion.reducedMotion ? 0 : Math.min(1, Math.abs(motion.velocity) * 0.8 + smoothBand(motion.progress, 0.22, 0.58) * 0.7);
    const positions = streaks.positions;

    for (let index = 0; index < count; index += 1) {
      const seedOffset = index * 4;
      const positionOffset = index * 6;
      const length = (0.28 + streaks.seeds[seedOffset + 3] * 0.72) * velocity;
      const z = streaks.seeds[seedOffset + 2] + motion.progress * 7 + delta * 0.02;
      const wrappedZ = z > 9 ? -28 + (z % 8) : z;

      positions[positionOffset] = streaks.seeds[seedOffset];
      positions[positionOffset + 1] = streaks.seeds[seedOffset + 1];
      positions[positionOffset + 2] = wrappedZ;
      positions[positionOffset + 3] = streaks.seeds[seedOffset] * (1 + velocity * 0.012);
      positions[positionOffset + 4] = streaks.seeds[seedOffset + 1];
      positions[positionOffset + 5] = wrappedZ - length;
    }

    const positionAttribute = streaks.geometry.getAttribute("position") as THREE.BufferAttribute;
    positionAttribute.needsUpdate = true;

    if (materialRef.current) {
      materialRef.current.opacity = 0.02 + velocity * 0.16;
    }
  });

  return (
    <lineSegments geometry={streaks.geometry}>
      <lineBasicMaterial
        ref={materialRef}
        color={GD_GOLD}
        depthWrite={false}
        transparent
        opacity={0.08}
      />
    </lineSegments>
  );
}

function SignalLines({
  isMobile,
  stateRef,
}: {
  isMobile: boolean;
  stateRef: React.MutableRefObject<SceneMotionState>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const cyanRef = useRef<THREE.LineBasicMaterial>(null);
  const hotRef = useRef<THREE.LineBasicMaterial>(null);
  const geometry = useMemo(() => {
    const points = [
      -2.8, 0.92, -2.4, -1.18, 1.18, -3.1,
      -1.18, 1.18, -3.1, 0.24, 0.88, -2.2,
      0.24, 0.88, -2.2, 1.92, 1.22, -3.85,
      -2.1, -1.16, -0.7, -0.56, -0.8, -2.1,
      -0.56, -0.8, -2.1, 1.18, -0.98, -2.82,
      1.18, -0.98, -2.82, 2.54, -0.42, -4.2,
    ];
    const signalGeometry = new THREE.BufferGeometry();
    signalGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return signalGeometry;
  }, []);
  const hotGeometry = useMemo(() => {
    const points = [
      0.82, 0.44, -1.35, 1.18, 0.56, -1.82,
      1.18, 0.56, -1.82, 1.42, 0.18, -2.25,
    ];
    const signalGeometry = new THREE.BufferGeometry();
    signalGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return signalGeometry;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      hotGeometry.dispose();
    };
  }, [geometry, hotGeometry]);

  useFrame(({ clock }, delta) => {
    const motion = stateRef.current;
    const progress = motion.progress;
    const group = groupRef.current;

    if (group) {
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, -0.18 + progress * 0.48, 3, delta);
      group.position.z = THREE.MathUtils.damp(group.position.z, -0.4 + progress * 0.75, 3, delta);
      group.scale.setScalar(isMobile ? 0.82 : 1);
    }

    if (cyanRef.current) {
      const signalPulse = 0.5 + Math.sin(clock.elapsedTime * 3.4 + progress * 18) * 0.5;
      cyanRef.current.opacity = 0.045 + phasePeak(progress, 0.42, 0.22) * 0.18 + signalPulse * 0.03;
    }

    if (hotRef.current) {
      hotRef.current.opacity = phasePeak(progress, 0.74, 0.08) * 0.28;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial
          ref={cyanRef}
          color={GD_CYAN}
          depthWrite={false}
          transparent
          opacity={0.08}
        />
      </lineSegments>
      <lineSegments geometry={hotGeometry}>
        <lineBasicMaterial
          ref={hotRef}
          color={GD_HOT}
          depthWrite={false}
          transparent
          opacity={0}
        />
      </lineSegments>
      <mesh position={[1.18, 0.56, -1.82]}>
        <ringGeometry args={[0.055, 0.07, 24]} />
        <meshBasicMaterial color={GD_HOT} depthWrite={false} transparent opacity={0.42} />
      </mesh>
      <mesh position={[-1.18, 1.18, -3.1]}>
        <ringGeometry args={[0.04, 0.052, 24]} />
        <meshBasicMaterial color={GD_CYAN} depthWrite={false} transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

function DeltaCore({
  isMobile,
  stateRef,
}: {
  isMobile: boolean;
  stateRef: React.MutableRefObject<SceneMotionState>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRefs = useRef<Array<THREE.Mesh | null>>([]);
  const materialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const nodePositions = useMemo(() => {
    return Array.from({ length: isMobile ? 18 : 32 }, (_, index) => {
      const angle = (index / (isMobile ? 18 : 32)) * Math.PI * 2;
      const radius = 0.34 + (index % 3) * 0.16;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.7) * 0.18,
        Math.sin(angle) * radius * 0.42,
      );
    });
  }, [isMobile]);

  useFrame(({ clock }, delta) => {
    const motion = stateRef.current;
    const progress = motion.progress;
    const group = groupRef.current;
    const approach = smoothBand(progress, 0.38, 0.64);
    const release = smoothBand(progress, 0.78, 1);
    const split = motion.reducedMotion ? 0.28 : phasePeak(progress, 0.73, 0.16);

    if (group) {
      group.position.x = THREE.MathUtils.damp(group.position.x, THREE.MathUtils.lerp(0.84, 0.08, approach) + release * -0.2, 4.1, delta);
      group.position.y = THREE.MathUtils.damp(group.position.y, THREE.MathUtils.lerp(0.08, 0.16, approach), 4.1, delta);
      group.position.z = THREE.MathUtils.damp(group.position.z, THREE.MathUtils.lerp(-6.6, -1.18, approach) - release * 1.1, 4.1, delta);
      const scale = THREE.MathUtils.lerp(0.36, isMobile ? 0.88 : 1.12, approach) + split * 0.24 - release * 0.16;
      group.scale.setScalar(scale);
      group.rotation.x += delta * (0.12 + progress * 0.36);
      group.rotation.y += delta * (0.18 + split * 0.52);
    }

    ringRefs.current.forEach((ring, index) => {
      if (!ring) return;
      const direction = index % 2 === 0 ? 1 : -1;
      ring.rotation.x = clock.elapsedTime * 0.16 * direction + index * 0.62;
      ring.rotation.y = clock.elapsedTime * 0.22 * -direction + progress * 1.4;
      ring.position.x = Math.cos(index * 1.7) * split * 0.18;
      ring.position.y = Math.sin(index * 1.1) * split * 0.16;
      ring.position.z = (index - 1) * 0.05 + split * direction * 0.18;
    });

    materialRefs.current.forEach((material, index) => {
      if (!material) return;
      material.opacity = 0.16 + approach * 0.32 + split * 0.14 - release * 0.08 + (index % 2) * 0.05;
    });
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          ref={(node) => {
            ringRefs.current[index] = node;
          }}
          scale={[1 + index * 0.28, 1 + index * 0.1, 1]}
        >
          <torusGeometry args={[0.58 + index * 0.12, 0.006 + index * 0.002, 6, 86]} />
          <meshBasicMaterial
            ref={(material) => {
              materialRefs.current[index] = material;
            }}
            color={index === 1 ? GD_CYAN : GD_GOLD}
            depthWrite={false}
            transparent
            opacity={0.24}
            wireframe={index === 2}
          />
        </mesh>
      ))}
      {nodePositions.map((position, index) => (
        <mesh key={index} position={position}>
          <boxGeometry args={[0.026, 0.026, 0.026]} />
          <meshBasicMaterial
            color={index % 5 === 0 ? GD_CYAN : GD_TEXT}
            depthWrite={false}
            transparent
            opacity={index % 5 === 0 ? 0.36 : 0.22}
          />
        </mesh>
      ))}
    </group>
  );
}

function SceneWorld({
  isMobile,
  stateRef,
}: {
  isMobile: boolean;
  stateRef: React.MutableRefObject<SceneMotionState>;
}) {
  return (
    <>
      <CameraRig stateRef={stateRef} />
      <VelocityParticles isMobile={isMobile} stateRef={stateRef} />
      <VelocityStreaks isMobile={isMobile} stateRef={stateRef} />
      <TrackRibbon isMobile={isMobile} stateRef={stateRef} />
      <SignalLines isMobile={isMobile} stateRef={stateRef} />
      <DeltaCore isMobile={isMobile} stateRef={stateRef} />
    </>
  );
}

export function SceneBackground({ stateRef }: SceneBackgroundProps) {
  const webglState = useWebGLState();
  const { isMobile, isVisible } = useSceneQuality();

  if (webglState !== "ready") {
    return <SceneFallback />;
  }

  return (
      <Canvas
        className="!pointer-events-none absolute inset-0 z-0 h-full w-full"
      camera={{ fov: isMobile ? 66 : 64, near: 0.1, far: 80, position: [0, 0, 8.2] }}
      dpr={isMobile ? [1, 1.25] : [1, 1.4]}
      fallback={<SceneFallback />}
      frameloop={isVisible ? "always" : "never"}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <SceneWorld isMobile={isMobile} stateRef={stateRef} />
    </Canvas>
  );
}
