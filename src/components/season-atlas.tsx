"use client";

import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Line, MeshDistortMaterial, OrbitControls, Sparkles, Stars } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

type RegionId = "europe" | "americas" | "middle-east" | "asia-pacific";

type Region = {
  id: RegionId;
  zh: string;
  en: string;
  round: string;
  location: string;
  circuit: string;
  date: string;
  color: string;
  position: [number, number, number];
  path: [number, number, number][];
  circuits: string[];
};

const regions: Region[] = [
  {
    id: "europe",
    zh: "欧洲赛段",
    en: "EUROPE / SECTOR 02",
    round: "ROUND 10",
    location: "比利时 · 斯帕-弗朗科尔尚",
    circuit: "斯帕-弗朗科尔尚赛道",
    date: "JUL 17 — JUL 19",
    color: "#b7f4ff",
    position: [-3.2, 1.75, 0.2],
    path: [[-0.2, 0.1, 0], [-1.1, 0.75, 0.18], [-2.08, 1.12, 0.16], [-3.2, 1.75, 0.2]],
    circuits: ["SIL", "SPA", "BUD", "ZAN", "MNZ"],
  },
  {
    id: "americas",
    zh: "美洲赛段",
    en: "AMERICAS / SECTOR 03",
    round: "NORTH & SOUTH",
    location: "迈阿密 · 蒙特利尔 · 奥斯汀",
    circuit: "全球赛程投影",
    date: "SEASON VECTOR",
    color: "#ffc08a",
    position: [-3.55, -1.65, -0.2],
    path: [[-0.2, -0.02, 0], [-1.05, -0.86, 0.16], [-2.3, -1.12, 0.08], [-3.55, -1.65, -0.2]],
    circuits: ["MIA", "YUL", "AUS", "MEX", "SAO"],
  },
  {
    id: "middle-east",
    zh: "中东赛段",
    en: "MIDDLE EAST / SECTOR 01",
    round: "OPENING VECTOR",
    location: "巴林 · 吉达 · 卢赛尔 · 阿布扎比",
    circuit: "全球赛程投影",
    date: "SEASON VECTOR",
    color: "#d0b1ff",
    position: [3.45, 1.58, -0.1],
    path: [[0.18, 0.12, 0], [1.22, 0.8, -0.04], [2.35, 1.12, 0.06], [3.45, 1.58, -0.1]],
    circuits: ["BAH", "JED", "LOS", "AUH"],
  },
  {
    id: "asia-pacific",
    zh: "亚太赛段",
    en: "ASIA PACIFIC / SECTOR 04",
    round: "EASTERN VECTOR",
    location: "墨尔本 · 上海 · 铃鹿 · 新加坡",
    circuit: "全球赛程投影",
    date: "SEASON VECTOR",
    color: "#82e6c0",
    position: [3.6, -1.52, 0.15],
    path: [[0.16, -0.03, 0], [1.14, -0.64, 0.12], [2.56, -0.98, 0.05], [3.6, -1.52, 0.15]],
    circuits: ["MEL", "SHA", "SUZ", "SIN"],
  },
];

function CameraRig({ active }: { active: Region }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const offsetX = active.id === "europe" ? -0.32 : active.id === "middle-east" ? 0.32 : active.id === "americas" ? -0.15 : 0.15;
    const position = new THREE.Vector3(offsetX, 0.08, 9.2);
    camera.position.lerp(position, 1 - Math.exp(-delta * 1.45));
    target.set(offsetX * 0.45, 0, 0);
    camera.lookAt(target);
  });

  return null;
}

function ParticleCloud() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(1450 * 3);
    for (let index = 0; index < 1450; index += 1) {
      const radius = 1.9 + Math.random() * 2.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      data[index * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      data[index * 3 + 1] = Math.cos(phi) * radius * 0.58;
      data[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius * 0.42;
    }
    return data;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.025;
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.14) * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#79c7ff" size={0.018} transparent opacity={0.54} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function EnergyCore() {
  const core = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!core.current) return;
    const t = clock.getElapsedTime();
    core.current.rotation.y = t * 0.18;
    core.current.rotation.z = Math.sin(t * 0.25) * 0.1;
    core.current.position.y = Math.sin(t * 0.9) * 0.1;
  });

  return (
    <group ref={core}>
      <mesh rotation={[0.16, 0.45, 0]}>
        <icosahedronGeometry args={[1.04, 4]} />
        <MeshDistortMaterial color="#091b3d" emissive="#168bff" emissiveIntensity={0.7} roughness={0.12} metalness={0.78} distort={0.27} speed={1.5} transparent opacity={0.94} />
      </mesh>
      <mesh rotation={[Math.PI / 2.35, 0.15, 0.5]}>
        <torusGeometry args={[1.34, 0.012, 12, 160]} />
        <meshBasicMaterial color="#64c9ff" transparent opacity={0.64} />
      </mesh>
      <mesh rotation={[Math.PI / 1.8, 0.8, -0.28]}>
        <torusGeometry args={[1.64, 0.008, 12, 160]} />
        <meshBasicMaterial color="#d1f5ff" transparent opacity={0.36} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshBasicMaterial color="#dcfbff" />
      </mesh>
      <Sparkles count={260} scale={[3.5, 2.65, 2.1]} size={2.1} speed={0.28} opacity={0.8} color="#a7efff" noise={2.2} />
    </group>
  );
}

function RegionFlow({ region, active, onSelect }: { region: Region; active: boolean; onSelect: (id: RegionId) => void }) {
  const node = useRef<THREE.Group>(null);
  const points = useMemo(() => region.path.map(([x, y, z]) => new THREE.Vector3(x, y, z)), [region.path]);

  useFrame(({ clock }) => {
    if (!node.current) return;
    const target = active ? 1 : 0.72;
    node.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
    node.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.45 + region.position[0]) * 0.045;
  });

  return (
    <group ref={node}>
      <Line points={points} color={region.color} transparent opacity={active ? 0.95 : 0.26} lineWidth={active ? 1.5 : 0.75} dashed dashSize={0.085} gapSize={0.12} dashScale={28} />
      <Sparkles position={region.position} count={active ? 250 : 70} scale={[1.1, 0.75, 0.48]} size={active ? 2.6 : 1.25} speed={active ? 0.9 : 0.25} opacity={active ? 0.95 : 0.32} color={region.color} noise={2.8} />
      <Float speed={active ? 2.1 : 0.8} rotationIntensity={0.2} floatIntensity={active ? 0.32 : 0.12}>
        <group position={region.position} onClick={(event) => { event.stopPropagation(); onSelect(region.id); }}>
          <mesh>
            <sphereGeometry args={[active ? 0.23 : 0.15, 32, 32]} />
            <meshBasicMaterial color={region.color} transparent opacity={active ? 1 : 0.58} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[active ? 0.31 : 0.21, active ? 0.325 : 0.225, 64]} />
            <meshBasicMaterial color={region.color} transparent opacity={active ? 0.92 : 0.3} side={THREE.DoubleSide} />
          </mesh>
          {active && <pointLight color={region.color} intensity={5} distance={3.4} />}
        </group>
      </Float>
    </group>
  );
}

function AtlasScene({ active, onSelect }: { active: Region; onSelect: (id: RegionId) => void }) {
  return (
    <Canvas dpr={[1, 1.55]} gl={{ antialias: false, powerPreference: "high-performance" }} camera={{ position: [0, 0, 9.2], fov: 37 }}>
      <color attach="background" args={["#01040b"]} />
      <fog attach="fog" args={["#01040b", 7.5, 17]} />
      <ambientLight intensity={0.32} />
      <pointLight position={[0, 0, 3.4]} intensity={19} color="#1f8dff" distance={8} />
      <pointLight position={[-4, 2, 1]} intensity={2.4} color="#9ce6ff" distance={7} />
      <CameraRig active={active} />
      <Stars radius={80} depth={50} count={1300} factor={1.8} saturation={0} fade speed={0.18} />
      <ParticleCloud />
      <EnergyCore />
      {regions.map((region) => <RegionFlow key={region.id} region={region} active={region.id === active.id} onSelect={onSelect} />)}
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.8} maxPolarAngle={Math.PI / 1.65} rotateSpeed={0.22} />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.12} mipmapBlur intensity={1.45} radius={0.62} />
        <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.14} />
        <Vignette eskil={false} offset={0.18} darkness={0.86} />
      </EffectComposer>
    </Canvas>
  );
}

export function SeasonAtlas() {
  const [activeId, setActiveId] = useState<RegionId>("europe");
  const active = regions.find((region) => region.id === activeId) ?? regions[0];

  return (
    <main className="atlas-page">
      <section className="atlas-webgl" aria-label="GridDelta 全球赛季空间导航概念">
        <AtlasScene active={active} onSelect={setActiveId} />
        <div className="atlas-noise" aria-hidden="true" />
        <header className="atlas-header">
          <div>
            <p className="atlas-brand">GRIDDELTA <span>CN</span></p>
            <p className="atlas-caption">SEASONAL SIGNAL / 2026</p>
          </div>
          <div className="atlas-live"><i /> GLOBAL RACE NETWORK</div>
        </header>

        <section className="atlas-statement">
          <p>赛季不该是一张列表。</p>
          <h1>跟随一束信号，<br />抵达每一个周末。</h1>
          <p className="atlas-description">中心不是装饰地球，而是一套赛季坐标系统。每一条粒子流，都是一段真实的 F1 征程。</p>
        </section>

        <nav className="atlas-sector-nav" aria-label="选择赛区">
          {regions.map((region, index) => (
            <button key={region.id} type="button" onClick={() => setActiveId(region.id)} className={region.id === activeId ? "is-active" : ""}>
              <span>0{index + 1}</span>
              <strong>{region.zh}</strong>
              <em>{region.en}</em>
            </button>
          ))}
        </nav>

        <aside className="atlas-projection">
          <p className="atlas-mono">{active.en}</p>
          <div className="atlas-map" style={{ "--glow": active.color } as React.CSSProperties}>
            <svg viewBox="0 0 540 250" aria-hidden="true">
              <path d="M42 178 86 125l78-7 38-50 61 11 50-34 79 29 70 4 39 52-22 43-70 7-39 34-68-9-53 31-73-15-66 30Z" />
              <path d="M20 205 C97 160 155 232 237 184 S390 219 520 128" className="map-flow" />
              <path d="M36 78 C119 116 189 64 278 111 S421 98 520 71" className="map-flow map-flow--soft" />
            </svg>
            <div className="atlas-map-points">
              {active.circuits.map((circuit, index) => <span key={circuit} style={{ left: `${18 + index * 17}%`, top: `${48 + ((index * 29) % 32)}%` }}>{circuit}</span>)}
            </div>
          </div>
          <p className="atlas-map-note">选中赛区后，粒子场收束为局部赛历地图。</p>
        </aside>

        <aside className="atlas-race-info">
          <p className="atlas-mono">{active.round} / LIVE VECTOR</p>
          <p className="atlas-place">{active.location}</p>
          <h2>{active.id === "europe" ? "比利时大奖赛" : active.zh}</h2>
          <div className="atlas-info-line"><span>{active.circuit}</span><span>{active.date}</span></div>
          <Link href="/race-weekend" className="atlas-cta">进入比赛周 <b>↗</b></Link>
        </aside>

        <p className="atlas-footnote">DRAG THE FIELD / SELECT A VECTOR / ENTER RACE WEEK</p>
      </section>

      <style jsx>{`
        .atlas-page { background: #01040b; color: #f1f7ff; }
        .atlas-webgl { position: relative; min-height: calc(100svh - 4rem); overflow: hidden; background: #01040b; }
        .atlas-webgl :global(canvas) { position: absolute !important; inset: 0; width: 100% !important; height: 100% !important; }
        .atlas-noise { position: absolute; z-index: 1; inset: 0; pointer-events: none; opacity: 0.28; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E"); mix-blend-mode: soft-light; }
        .atlas-header, .atlas-statement, .atlas-sector-nav, .atlas-projection, .atlas-race-info, .atlas-footnote { position: absolute; z-index: 4; }
        .atlas-header { top: clamp(1.2rem, 3vw, 3rem); left: clamp(1.25rem, 4.5vw, 5rem); right: clamp(1.25rem, 4.5vw, 5rem); display: flex; justify-content: space-between; align-items: flex-start; }
        .atlas-brand { margin: 0; font-size: 1rem; font-weight: 680; letter-spacing: -0.055em; } .atlas-brand span { color: #79c5ff; }
        .atlas-caption, .atlas-mono, .atlas-live, .atlas-footnote { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .57rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
        .atlas-caption { margin: .5rem 0 0; color: rgba(163, 194, 230, .48); }
        .atlas-live { display: flex; gap: .55rem; align-items: center; color: rgba(205, 232, 255, .67); } .atlas-live i { width: .38rem; height: .38rem; border-radius: 50%; background: #8df0ff; box-shadow: 0 0 14px #6fcfff; animation: pulse 1.6s ease-in-out infinite; }
        .atlas-statement { top: clamp(7rem, 16vh, 10rem); left: clamp(1.25rem, 7.8vw, 9rem); width: min(28rem, 31vw); }
        .atlas-statement > p:first-child { margin: 0; color: rgba(174, 211, 255, .65); font-size: .78rem; letter-spacing: .1em; }
        .atlas-statement h1 { margin: 1rem 0 0; font-size: clamp(2.35rem, 4.65vw, 5.25rem); font-weight: 530; line-height: .93; letter-spacing: -.078em; text-wrap: balance; }
        .atlas-description { max-width: 19rem; margin: 1.35rem 0 0; color: rgba(183, 205, 236, .58); font-size: .78rem; line-height: 1.85; }
        .atlas-sector-nav { top: 50%; left: clamp(1.25rem, 4vw, 5rem); display: grid; width: min(10.5rem, 18vw); gap: .35rem; transform: translateY(-2%); }
        .atlas-sector-nav button { display: grid; width: 100%; grid-template-columns: 1.5rem 1fr; padding: .54rem .55rem; border: 0; border-left: 1px solid rgba(151, 190, 255, .2); background: linear-gradient(90deg, rgba(7, 17, 34, .55), transparent); color: rgba(191, 219, 255, .58); text-align: left; cursor: pointer; transition: .32s ease; }
        .atlas-sector-nav button:hover, .atlas-sector-nav button.is-active { border-color: #baf1ff; background: linear-gradient(90deg, rgba(22, 67, 103, .44), transparent); color: #effcff; transform: translateX(.25rem); }
        .atlas-sector-nav span { grid-row: span 2; color: #86caff; font: 700 .54rem ui-monospace, SFMono-Regular, Menlo, monospace; } .atlas-sector-nav strong { font-size: .75rem; font-weight: 560; letter-spacing: -.03em; } .atlas-sector-nav em { margin-top: .18rem; color: rgba(163, 199, 244, .44); font: 700 .47rem ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .11em; font-style: normal; }
        .atlas-projection { top: clamp(7rem, 14vh, 9rem); right: clamp(1.25rem, 5vw, 5.5rem); width: min(29vw, 26rem); padding-top: .72rem; border-top: 1px solid rgba(164, 207, 255, .32); }
        .atlas-mono { margin: 0; color: rgba(189, 217, 255, .66); }
        .atlas-map { position: relative; margin-top: .95rem; aspect-ratio: 2.16; overflow: hidden; border-bottom: 1px solid color-mix(in srgb, var(--glow), transparent 64%); background: radial-gradient(circle at 42% 50%, color-mix(in srgb, var(--glow), transparent 87%), transparent 38%), linear-gradient(140deg, rgba(17, 42, 79, .43), rgba(2, 7, 15, .08)); }
        .atlas-map::before { position: absolute; inset: 0; background-image: linear-gradient(rgba(169, 209, 255, .06) 1px, transparent 1px), linear-gradient(90deg, rgba(169, 209, 255, .06) 1px, transparent 1px); background-size: 18% 25%; content: ""; }
        .atlas-map svg { position: absolute; inset: 0; width: 100%; height: 100%; } .atlas-map path:first-child { fill: color-mix(in srgb, var(--glow), transparent 87%); stroke: color-mix(in srgb, var(--glow), transparent 35%); stroke-width: 1.35; } .map-flow { fill: none; stroke: var(--glow); stroke-width: 1; stroke-dasharray: 3 7; opacity: .55; } .map-flow--soft { opacity: .22; }
        .atlas-map-points span { position: absolute; z-index: 2; color: rgba(232, 249, 255, .78); font: 700 .46rem ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .1em; transform: translate(-50%, -50%); } .atlas-map-points span::before { display: block; width: .32rem; height: .32rem; margin: 0 auto .2rem; border-radius: 50%; background: var(--glow); box-shadow: 0 0 13px var(--glow); content: ""; }
        .atlas-map-note { margin: .7rem 0 0; color: rgba(165, 193, 230, .43); font-size: .67rem; line-height: 1.6; }
        .atlas-race-info { right: clamp(1.25rem, 5vw, 5.5rem); bottom: clamp(2.8rem, 9vh, 5.6rem); width: min(30rem, 32vw); }
        .atlas-place { margin: .9rem 0 0; color: #b8efff; font: 700 .58rem ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .13em; }
        .atlas-race-info h2 { margin: .45rem 0 0; font-size: clamp(2.15rem, 3.6vw, 4.5rem); font-weight: 520; line-height: .96; letter-spacing: -.07em; }
        .atlas-info-line { display: flex; gap: 1rem; margin-top: 1rem; padding-top: .75rem; border-top: 1px solid rgba(162, 202, 255, .2); color: rgba(197, 217, 245, .58); font-size: .7rem; line-height: 1.5; } .atlas-info-line span { flex: 1; }
        .atlas-cta { display: inline-flex; align-items: center; gap: 1rem; margin-top: 1.35rem; padding-bottom: .42rem; border-bottom: 1px solid #a9efff; color: #f4fbff; font-size: .88rem; font-weight: 600; text-decoration: none; } .atlas-cta b { color: #97eaff; font-size: 1.2rem; transition: transform .2s; } .atlas-cta:hover b { transform: translate(.15rem, -.15rem); }
        .atlas-footnote { left: clamp(1.25rem, 4.5vw, 5rem); bottom: 1.25rem; color: rgba(145, 176, 218, .31); font-size: .49rem; }
        @keyframes pulse { 50% { opacity: .35; transform: scale(.7); } }
        @media (max-width: 920px) { .atlas-statement { width: min(25rem, 47vw); left: 1.6rem; } .atlas-sector-nav { left: 1.5rem; width: 9.4rem; } .atlas-projection { right: 1.5rem; width: 33vw; } .atlas-race-info { right: 1.5rem; width: 42vw; } }
        @media (max-width: 640px) { .atlas-webgl { min-height: max(54rem, calc(100svh - 4rem)); } .atlas-header { top: 1.2rem; left: 1.15rem; right: 1.15rem; } .atlas-live { font-size: .45rem; letter-spacing: .11em; } .atlas-statement { top: 5.6rem; left: 1.15rem; width: calc(100% - 2.3rem); } .atlas-statement h1 { margin-top: .75rem; font-size: clamp(2.4rem, 11vw, 3.55rem); } .atlas-description { margin-top: .85rem; font-size: .71rem; line-height: 1.65; } .atlas-sector-nav { top: 49%; left: 1rem; width: 7.8rem; gap: .2rem; } .atlas-sector-nav button { padding: .36rem .3rem; } .atlas-sector-nav strong { font-size: .63rem; } .atlas-sector-nav em { display: none; } .atlas-projection { top: auto; right: 1.15rem; bottom: 14.3rem; width: calc(100% - 2.3rem); } .atlas-map { margin-top: .55rem; } .atlas-map-note { display: none; } .atlas-race-info { right: 1.15rem; bottom: 2.25rem; width: calc(100% - 2.3rem); } .atlas-race-info h2 { font-size: 2.15rem; } .atlas-info-line { margin-top: .7rem; font-size: .63rem; } .atlas-cta { margin-top: .85rem; } .atlas-footnote { display: none; } }
      `}</style>
    </main>
  );
}
