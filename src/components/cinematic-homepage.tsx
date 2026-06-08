"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { RaceCountdown } from "@/components/race-countdown";
import type { RaceWeekend } from "@/lib/types";

type CinematicHomepageProps = {
  nextRace: RaceWeekend;
  sourceLabel: string;
  dateRange: string;
};

const telemetryNodes = [
  { x: 7, y: 74, size: "h-2 w-2", delay: "0ms" },
  { x: 14, y: 38, size: "h-3 w-3", delay: "180ms" },
  { x: 23, y: 58, size: "h-2 w-2", delay: "320ms" },
  { x: 31, y: 24, size: "h-2.5 w-2.5", delay: "520ms" },
  { x: 43, y: 69, size: "h-3 w-3", delay: "720ms" },
  { x: 52, y: 42, size: "h-2 w-2", delay: "920ms" },
  { x: 61, y: 18, size: "h-2.5 w-2.5", delay: "1080ms" },
  { x: 70, y: 56, size: "h-3 w-3", delay: "1240ms" },
  { x: 82, y: 31, size: "h-2 w-2", delay: "1440ms" },
  { x: 91, y: 68, size: "h-2.5 w-2.5", delay: "1640ms" },
] as const;

const commandModules = [
  {
    label: "单站复盘",
    href: "/race-weekend",
    meta: "Race Weekend",
    description: "把结果、赛控、圈速与天气整合为同一个周末作战视图。",
  },
  {
    label: "比赛结果",
    href: "/results",
    meta: "Results",
    description: "快速回看完赛顺序、关键成绩与比赛落点。",
  },
  {
    label: "赛会控制",
    href: "/race-control",
    meta: "Race Control",
    description: "捕捉旗语、事件记录与赛段状态的关键上下文。",
  },
  {
    label: "圈速分析",
    href: "/lap-analysis",
    meta: "Lap Analysis",
    description: "用圈速节奏拆解长距离表现、轮胎窗口与追赶态势。",
  },
  {
    label: "赛道天气",
    href: "/weather",
    meta: "Track Weather",
    description: "把温度、风向和赛道条件纳入策略判断。",
  },
] as const;

const seasonLinks = [
  {
    label: "赛程",
    href: "/schedule",
    value: "Calendar",
    copy: "下一站与完整周末时间安排",
  },
  {
    label: "积分榜",
    href: "/standings",
    value: "Standings",
    copy: "车手与车队赛季积分秩序",
  },
  {
    label: "车手",
    href: "/drivers",
    value: "Drivers",
    copy: "车手索引与个人数据入口",
  },
] as const;

const heroMetrics = [
  ["OPENF1", "LINK READY"],
  ["CN", "DATA PITWALL"],
  ["2026", "SEASON CONTEXT"],
] as const;

export function CinematicHomepage({
  nextRace,
  sourceLabel,
  dateRange,
}: CinematicHomepageProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    let animationFrame = 0;
    let context: { revert: () => void } | undefined;
    let isAlive = true;

    const syncViewportWidth = () => {
      root.style.setProperty("--viewport-w", `${document.documentElement.clientWidth}px`);
    };

    const setDepth = (event: PointerEvent) => {
      if (!finePointer.matches || reduceMotion.matches) return;

      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const rect = root.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        root.style.setProperty("--tilt-x", `${y * -7}deg`);
        root.style.setProperty("--tilt-y", `${x * 9}deg`);
        root.style.setProperty("--parallax-x", `${x * 38}px`);
        root.style.setProperty("--parallax-y", `${y * 28}px`);
        root.style.setProperty("--beam-skew", `${x * 5}deg`);
      });
    };

    const resetDepth = () => {
      root.style.setProperty("--tilt-x", "0deg");
      root.style.setProperty("--tilt-y", "0deg");
      root.style.setProperty("--parallax-x", "0px");
      root.style.setProperty("--parallax-y", "0px");
      root.style.setProperty("--beam-skew", "0deg");
    };

    syncViewportWidth();
    window.addEventListener("resize", syncViewportWidth);
    root.addEventListener("pointermove", setDepth);
    root.addEventListener("pointerleave", resetDepth);

    if (!reduceMotion.matches) {
      Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
        ([gsapModule, scrollTriggerModule]) => {
          if (!isAlive || !rootRef.current) return;

          const gsap = gsapModule.gsap;
          const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
          gsap.registerPlugin(ScrollTrigger);

          context = gsap.context(() => {
            gsap.from(".scene-copy", {
              autoAlpha: 0,
              y: 46,
              rotateX: 10,
              duration: 1.1,
              ease: "power3.out",
              stagger: 0.12,
            });

            gsap.to(".hero-track", {
              yPercent: 18,
              scale: 1.06,
              ease: "none",
              scrollTrigger: {
                trigger: ".hero-scene",
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            });

            gsap.to(".race-signal", {
              xPercent: 18,
              rotate: 0.8,
              ease: "none",
              scrollTrigger: {
                trigger: ".hero-scene",
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            });

            gsap.utils.toArray<HTMLElement>(".cinema-panel").forEach((panel) => {
              gsap.from(panel, {
                autoAlpha: 0,
                y: 70,
                rotateX: 18,
                rotateY: panel.dataset.side === "right" ? -10 : 10,
                transformOrigin: "center top",
                duration: 0.9,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: panel,
                  start: "top 84%",
                  end: "top 52%",
                  scrub: 0.55,
                },
              });
            });

            gsap.to(".telemetry-map", {
              rotateX: 7,
              rotateZ: -1.4,
              scale: 1.045,
              ease: "none",
              scrollTrigger: {
                trigger: ".telemetry-scene",
                start: "top 72%",
                end: "bottom 36%",
                scrub: true,
              },
            });

            gsap.to(".module-rail", {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                trigger: ".modules-scene",
                start: "top 76%",
                end: "bottom 44%",
                scrub: true,
              },
            });
          }, rootRef);
        },
      );
    }

    return () => {
      isAlive = false;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", syncViewportWidth);
      root.removeEventListener("pointermove", setDepth);
      root.removeEventListener("pointerleave", resetDepth);
      context?.revert();
    };
  }, []);

  const cssVars = {
    "--tilt-x": "0deg",
    "--tilt-y": "0deg",
    "--parallax-x": "0px",
    "--parallax-y": "0px",
    "--beam-skew": "0deg",
    "--viewport-w": "100vw",
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className="cinematic-homepage relative overflow-hidden pb-8 text-white sm:pb-12"
      style={cssVars}
    >
      <div className="fixed-ambient" aria-hidden="true" />

      <section className="hero-scene scene-shell relative isolate min-h-[calc(100svh-9rem)] overflow-hidden border-y border-white/10 bg-[#020203] sm:min-h-[calc(100svh-8rem)]">
        <div
          className="hero-track absolute inset-0 bg-cover bg-[center_42%] opacity-[0.54]"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,46,46,0.22),transparent_30%),linear-gradient(100deg,rgba(0,0,0,0.96)_0%,rgba(4,4,6,0.86)_36%,rgba(0,0,0,0.26)_100%)]" aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:52px_52px]" aria-hidden="true" />
        <div className="race-signal absolute left-[-18vw] top-[42%] h-1 w-[138vw] origin-center bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_42px_rgba(255,46,46,0.72)]" aria-hidden="true" />
        <div className="absolute left-[-12vw] top-[49%] h-px w-[125vw] -rotate-6 bg-gradient-to-r from-transparent via-white/30 to-transparent" aria-hidden="true" />

        <div className="relative mx-auto flex min-h-[calc(100svh-9rem)] max-w-[1280px] flex-col justify-between px-4 py-12 sm:min-h-[calc(100svh-8rem)] sm:px-6 sm:py-16 lg:px-10">
          <div className="tilt-stage max-w-5xl pt-4 sm:pt-8">
            <div className="scene-copy mb-6 inline-grid grid-cols-[auto_1fr] items-center gap-3 border border-red-400/30 bg-black/[0.45] px-3 py-2 font-mono text-[0.66rem] font-bold uppercase text-red-100/80 backdrop-blur sm:text-xs">
              <span className="h-2 w-2 bg-neonRed shadow-[0_0_18px_rgba(255,46,46,0.9)]" aria-hidden="true" />
              Race Signal Online / Shanghai calibrated
            </div>
            <div className="scene-copy">
              <p className="eyebrow text-red-200/80">Futuristic F1 Data Command Center</p>
              <h1 className="mt-4 max-w-6xl text-[clamp(3.4rem,13vw,10.8rem)] font-black leading-[0.86] tracking-normal text-white">
                GridDelta CN
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-200 sm:text-2xl sm:leading-10">
                面向中文车迷的非官方 F1 数据中枢，将实时计时、单站复盘与赛季上下文压进同一个数字 pitwall。
              </p>
            </div>
            <div className="scene-copy mt-8 flex flex-col gap-3 text-sm font-bold sm:flex-row">
              <Link className="signal-button bg-neonRed text-white shadow-[0_0_38px_rgba(255,46,46,0.32)]" href="/live">
                查看实时计时
              </Link>
              <Link className="signal-button border border-white/[0.18] bg-white/[0.06] text-zinc-100 backdrop-blur" href="/race-weekend">
                进入单站复盘
              </Link>
            </div>
          </div>

          <div className="scene-copy grid gap-3 pt-10 sm:grid-cols-3">
            {heroMetrics.map(([label, value]) => (
              <div key={label} className="metric-strip">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="telemetry-scene scene-shell relative isolate overflow-hidden bg-[#030304] py-16 sm:py-24 lg:py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_20%_82%,rgba(255,46,46,0.16),transparent_30%)]" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-[1280px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-10">
          <div className="cinema-panel scene-copy max-w-xl">
            <p className="eyebrow text-red-200/80">Telemetry Core</p>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-white sm:text-6xl">
              数据场不是卡片，是整块赛道神经网络。
            </h2>
            <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">
              红色扫描线穿过节点、路径与会话面板，模拟实时计时入口的信号装配过程。核心链接仍然指向 live timing。
            </p>
            <Link className="mt-8 inline-flex h-12 items-center border border-red-400/50 bg-red-500/[0.12] px-5 text-sm font-black text-red-100 transition hover:bg-red-500/20" href="/live">
              进入实时计时 /live
            </Link>
          </div>

          <Link
            href="/live"
            className="telemetry-map cinema-panel tilt-stage group relative block min-h-[560px] overflow-hidden border border-white/[0.12] bg-black/70 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.58)] sm:min-h-[680px] sm:p-6"
            data-side="right"
            aria-label="打开实时计时"
          >
            <div className="absolute inset-0 opacity-[0.32] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:34px_34px]" aria-hidden="true" />
            <div className="radar-sweep absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-red-400/30 to-transparent" aria-hidden="true" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 760" role="img" aria-label="遥测信号路径">
              <defs>
                <linearGradient id="signalPath" x1="0" x2="1">
                  <stop offset="0%" stopColor="rgba(255,46,46,0.05)" />
                  <stop offset="48%" stopColor="rgba(255,46,46,0.85)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
                </linearGradient>
              </defs>
              <path className="path-draw" d="M64 560 C 180 420, 240 510, 338 330 S 540 176, 690 250 S 842 520, 932 368" fill="none" stroke="url(#signalPath)" strokeWidth="3" />
              <path className="path-draw path-draw-alt" d="M96 300 C 210 260, 240 136, 392 188 S 580 466, 746 420 S 846 240, 940 220" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
              <circle cx="500" cy="380" r="168" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
              <circle cx="500" cy="380" r="250" fill="none" stroke="rgba(255,46,46,0.16)" strokeWidth="1" />
              <line x1="500" y1="72" x2="500" y2="690" stroke="rgba(255,255,255,0.08)" />
              <line x1="102" y1="380" x2="910" y2="380" stroke="rgba(255,255,255,0.08)" />
            </svg>

            {telemetryNodes.map((node) => (
              <span
                key={`${node.x}-${node.y}`}
                className={`telemetry-node absolute ${node.size}`}
                style={{ left: `${node.x}%`, top: `${node.y}%`, animationDelay: node.delay }}
                aria-hidden="true"
              />
            ))}

            <div className="relative grid h-full min-h-[528px] grid-rows-[auto_1fr_auto] sm:min-h-[632px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-[0.64rem] font-bold uppercase tracking-normal text-zinc-500">
                <span>Telemetry Core / Live Timing</span>
                <span className="text-red-200/80">Signal Locked</span>
              </div>
              <div className="grid place-items-center">
                <div className="core-orbit relative grid h-64 w-64 place-items-center sm:h-80 sm:w-80">
                <span className="absolute inset-0 border border-red-400/[0.28]" aria-hidden="true" />
                  <span className="absolute inset-8 border border-white/[0.12]" aria-hidden="true" />
                  <span className="absolute h-2 w-full bg-gradient-to-r from-transparent via-red-400 to-transparent shadow-[0_0_30px_rgba(255,46,46,0.55)]" aria-hidden="true" />
                  <div className="text-center">
                    <p className="font-mono text-xs font-bold uppercase tracking-normal text-red-200/80">Live Timing</p>
                    <p className="mt-3 text-5xl font-black tracking-normal text-white sm:text-7xl">+0.000</p>
                    <p className="mt-3 text-sm font-semibold text-zinc-500">Delta / Gap / Stint</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
                {["Interval Matrix", "Pit State", "Session Feed"].map((label) => (
                  <div key={label} className="border border-white/10 bg-white/[0.035] p-3">
                    <div className="mb-3 h-1 w-12 bg-gradient-to-r from-neonRed to-transparent" />
                    <p className="font-mono text-[0.62rem] font-bold uppercase tracking-normal text-zinc-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="modules-scene scene-shell relative isolate overflow-hidden bg-[#060607] py-16 sm:py-24 lg:py-32">
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(120deg,rgba(255,46,46,0.22)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:130px_130px,42px_42px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          <div className="scene-copy flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow text-red-200/80">Command Modules</p>
              <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-white sm:text-6xl">
                比赛周末模块像控制面板一样展开。
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-zinc-400 sm:text-base">
              入口之间由信号轨道连接，滚动时逐步装配，桌面端带轻微 3D 倾斜。
            </p>
          </div>

          <div className="relative mt-12">
            <span className="module-rail absolute left-0 top-1/2 hidden h-px w-full origin-left scale-x-0 bg-gradient-to-r from-red-500/0 via-red-400/70 to-red-500/0 md:block" aria-hidden="true" />
            <div className="grid gap-4 md:grid-cols-5">
              {commandModules.map((module, index) => (
                <Link
                  key={module.href}
                  href={module.href}
                  className="cinema-panel command-panel tilt-stage group relative min-h-[300px] overflow-hidden border border-white/[0.12] bg-black/[0.68] p-4 transition hover:border-red-300/50 sm:p-5 md:min-h-[430px]"
                  data-side={index % 2 === 0 ? "left" : "right"}
                >
                  <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-red-400/80 to-transparent" aria-hidden="true" />
                  <span className="absolute -right-10 top-8 h-24 w-24 border border-red-300/[0.18]" aria-hidden="true" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <p className="font-mono text-[0.62rem] font-bold uppercase tracking-normal text-zinc-500">{module.meta}</p>
                      <h3 className="mt-5 text-2xl font-black tracking-normal text-white md:text-3xl">{module.label}</h3>
                      <p className="mt-5 text-sm leading-7 text-zinc-400">{module.description}</p>
                    </div>
                    <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-4 text-sm font-bold text-zinc-300">
                      <span>打开模块</span>
                      <span className="text-neonRed transition group-hover:translate-x-1" aria-hidden="true">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="season-scene scene-shell relative isolate overflow-hidden bg-[#020203] py-16 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(255,46,46,0.18),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.12),transparent_32%)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1280px] gap-5 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <div className="cinema-panel border border-white/[0.12] bg-white/[0.035] p-5 sm:p-7">
            <p className="eyebrow text-red-200/80">Season Context</p>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-white sm:text-6xl">
              下一站、赛程与积分秩序保持在同一视野。
            </h2>
            <div className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3">
              <div className="bg-black/70 p-4">
                <p className="font-mono text-[0.64rem] font-bold uppercase tracking-normal text-zinc-500">下一站</p>
                <p className="mt-4 text-2xl font-black text-white">{nextRace.raceName}</p>
              </div>
              <div className="bg-black/70 p-4">
                <p className="font-mono text-[0.64rem] font-bold uppercase tracking-normal text-zinc-500">地点</p>
                <p className="mt-4 text-lg font-bold text-zinc-100">{nextRace.country} · {nextRace.location}</p>
                <p className="mt-2 text-sm text-zinc-500">{nextRace.circuitName}</p>
              </div>
              <div className="bg-black/70 p-4">
                <p className="font-mono text-[0.64rem] font-bold uppercase tracking-normal text-zinc-500">日期</p>
                <p className="mt-4 text-lg font-bold text-zinc-100">{dateRange}</p>
                <p className="mt-2 text-xs text-zinc-500">{sourceLabel}</p>
              </div>
            </div>
            <div className="mt-5">
              <RaceCountdown targetIso={nextRace.countdownTarget} />
            </div>
          </div>

          <div className="grid gap-4">
            {seasonLinks.map((item) => (
              <Link key={item.href} href={item.href} className="cinema-panel group border border-white/[0.12] bg-black/[0.62] p-5 transition hover:border-red-300/50 sm:p-6" data-side="right">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.64rem] font-bold uppercase tracking-normal text-red-200/70">{item.value}</p>
                    <h3 className="mt-4 text-3xl font-black tracking-normal text-white">{item.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{item.copy}</p>
                  </div>
                  <span className="text-xl text-neonRed transition group-hover:translate-x-1" aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
            <footer className="cinema-panel border border-zinc-900 bg-black/[0.45] p-5 text-sm text-zinc-500">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-zinc-300">GridDelta CN</p>
                <p>非官方项目 · 本地官方赛历 + OpenF1 辅助 · For Chinese F1 fans</p>
              </div>
            </footer>
          </div>
        </div>
      </section>

      <style jsx>{`
        .cinematic-homepage {
          --panel-radius: 8px;
          background: #020203;
          margin-left: calc((100% - var(--viewport-w)) / 2);
          width: var(--viewport-w);
        }

        .fixed-ambient {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(255, 46, 46, 0.09), transparent 18%, transparent 78%, rgba(255, 46, 46, 0.07)),
            radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08), transparent 28%);
          opacity: 0.8;
        }

        .scene-shell {
          min-width: 0;
        }

        .cinematic-homepage :global(.eyebrow) {
          letter-spacing: 0;
        }

        :global(.tilt-stage) {
          transform:
            perspective(1200px)
            rotateX(var(--tilt-x))
            rotateY(var(--tilt-y))
            translate3d(var(--parallax-x), var(--parallax-y), 0);
          transform-style: preserve-3d;
          transition: transform 140ms ease-out;
          will-change: transform;
        }

        .race-signal {
          transform: rotate(calc(-8deg + var(--beam-skew)));
          animation: signalPulse 5.2s ease-in-out infinite;
        }

        :global(.signal-button) {
          align-items: center;
          display: inline-flex;
          height: 3.25rem;
          justify-content: center;
          min-width: 11.5rem;
          padding: 0 1.25rem;
          text-align: center;
          transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
        }

        :global(.signal-button:hover) {
          transform: translateY(-2px);
        }

        .metric-strip {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.42);
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          min-height: 4.5rem;
          padding: 1rem;
        }

        .metric-strip span,
        .metric-strip strong {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.68rem;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .metric-strip span {
          color: rgba(212, 212, 216, 0.5);
        }

        .metric-strip strong {
          color: rgba(255, 255, 255, 0.88);
        }

        :global(.telemetry-map),
        :global(.command-panel),
        .season-scene :global(a),
        .season-scene footer,
        .season-scene > div > div:first-child {
          border-radius: var(--panel-radius);
        }

        .radar-sweep {
          animation: radarSweep 4.8s cubic-bezier(0.7, 0, 0.2, 1) infinite;
          mix-blend-mode: screen;
        }

        .path-draw {
          animation: pathDraw 5.4s ease-in-out infinite;
          stroke-dasharray: 860;
          stroke-dashoffset: 860;
        }

        .path-draw-alt {
          animation-delay: 900ms;
        }

        .telemetry-node {
          background: #ff2e2e;
          border: 1px solid rgba(255, 255, 255, 0.58);
          box-shadow: 0 0 22px rgba(255, 46, 46, 0.76);
          animation: nodePulse 2.8s ease-in-out infinite;
        }

        .core-orbit {
          animation: orbitFloat 6s ease-in-out infinite;
        }

        .core-orbit > span:first-child {
          animation: orbitTurn 11s linear infinite;
        }

        .core-orbit > span:nth-child(2) {
          animation: orbitTurn 8s linear infinite reverse;
        }

        :global(.module-rail) {
          will-change: transform;
        }

        :global(.command-panel::after) {
          content: "";
          position: absolute;
          inset: auto 0 0 0;
          height: 36%;
          background: linear-gradient(0deg, rgba(255, 46, 46, 0.12), transparent);
          opacity: 0;
          transition: opacity 220ms ease;
        }

        :global(.command-panel:hover::after) {
          opacity: 1;
        }

        @keyframes signalPulse {
          0%,
          100% {
            opacity: 0.46;
            filter: blur(0px);
          }
          50% {
            opacity: 1;
            filter: blur(1px);
          }
        }

        @keyframes radarSweep {
          0% {
            opacity: 0;
            transform: translateX(-130%) skewX(-12deg);
          }
          42% {
            opacity: 0.78;
          }
          74%,
          100% {
            opacity: 0;
            transform: translateX(820%) skewX(-12deg);
          }
        }

        @keyframes pathDraw {
          0% {
            opacity: 0.18;
            stroke-dashoffset: 860;
          }
          50% {
            opacity: 0.95;
            stroke-dashoffset: 0;
          }
          100% {
            opacity: 0.18;
            stroke-dashoffset: -860;
          }
        }

        @keyframes nodePulse {
          0%,
          100% {
            opacity: 0.42;
            transform: scale(0.82);
          }
          50% {
            opacity: 1;
            transform: scale(1.26);
          }
        }

        @keyframes orbitFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes orbitTurn {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 767px) {
          :global(.tilt-stage) {
            transform: none;
          }

          .metric-strip {
            min-height: 3.8rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          :global(.tilt-stage),
          .race-signal,
          .radar-sweep,
          .path-draw,
          .telemetry-node,
          .core-orbit,
          .core-orbit > span {
            animation: none;
            transform: none;
            transition: none;
          }

          .path-draw {
            stroke-dashoffset: 0;
          }

          :global(.module-rail) {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}
