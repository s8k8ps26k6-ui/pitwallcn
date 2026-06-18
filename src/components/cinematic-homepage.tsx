"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { HudGridCanvas } from "@/components/hud-grid-canvas";
import type { RaceWeekend } from "@/lib/types";

type CinematicHomepageProps = {
  nextRace: RaceWeekend;
  sourceLabel: string;
  dateRange: string;
};

type CountdownValues = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isStarted: boolean;
};

type CountdownKey = Exclude<keyof CountdownValues, "isStarted">;

const titleCharacters = Array.from("GridDelta CN");

const commandModules = [
  {
    label: "单站复盘",
    href: "/race-weekend",
    meta: "Race Weekend",
    index: "01",
    description: "把结果、赛控、圈速与天气整合成同一个比赛周末作战视图。",
  },
  {
    label: "比赛结果",
    href: "/results",
    meta: "Results",
    index: "02",
    description: "快速回看完赛顺序、关键成绩与比赛最终落点。",
  },
  {
    label: "赛会控制",
    href: "/race-control",
    meta: "Race Control",
    index: "03",
    description: "捕捉旗语、安全车、事件记录与赛段状态的关键上下文。",
  },
  {
    label: "圈速分析",
    href: "/lap-analysis",
    meta: "Lap Analysis",
    index: "04",
    description: "用圈速节奏拆解长距离表现、轮胎窗口与追赶态势。",
  },
  {
    label: "赛道天气",
    href: "/weather",
    meta: "Track Weather",
    index: "05",
    description: "把温度、风向和赛道条件纳入实时策略判断。",
  },
] as const;

const seasonLinks = [
  { label: "完整赛程", href: "/schedule", meta: "Calendar" },
  { label: "赛季积分", href: "/standings", meta: "Standings" },
  { label: "车手索引", href: "/drivers", meta: "Drivers" },
] as const;

const countdownItems: Array<{ key: CountdownKey; label: string }> = [
  { key: "days", label: "天" },
  { key: "hours", label: "小时" },
  { key: "minutes", label: "分钟" },
  { key: "seconds", label: "秒" },
];

function getCountdownValues(targetIso: string): CountdownValues {
  const targetTime = new Date(targetIso).getTime();
  const rawDifference = targetTime - Date.now();
  const difference = Number.isFinite(rawDifference) ? Math.max(rawDifference, 0) : 0;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isStarted: difference <= 0,
  };
}

function formatCountdownValue(value: number) {
  return String(Math.max(0, Math.floor(value))).padStart(2, "0");
}

export function CinematicHomepage({
  nextRace,
  sourceLabel,
  dateRange,
}: CinematicHomepageProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let isDisposed = false;
    let context: { revert: () => void } | undefined;
    let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger | undefined;
    let countdownIntervalId = 0;
    const eventCleanups: Array<() => void> = [];

    void (async () => {
      const [{ gsap }, scrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (isDisposed) return;

      ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const siteHeader = document.querySelector<HTMLElement>("[data-site-header]");
      const countdownNodes = Array.from(
        root.querySelectorAll<HTMLElement>("[data-countdown-key]"),
      );
      const countdownStatus = root.querySelector<HTMLElement>("[data-countdown-status]");

      const syncCountdown = () => {
        const values = getCountdownValues(nextRace.countdownTarget);

        countdownNodes.forEach((node) => {
          const key = node.dataset.countdownKey as CountdownKey | undefined;
          if (!key) return;
          node.textContent = formatCountdownValue(values[key]);
        });

        if (countdownStatus) {
          countdownStatus.textContent = values.isStarted
            ? "比赛周末进行中"
            : "距离下一场比赛信号上线";
        }
      };

      const startCountdownTicker = () => {
        if (countdownIntervalId) return;
        syncCountdown();
        countdownIntervalId = window.setInterval(syncCountdown, 1000);
      };

      context = gsap.context(() => {
        if (prefersReducedMotion) {
          gsap.set(root, { autoAlpha: 1 });
          gsap.set(siteHeader, { autoAlpha: 1, y: 0 });
          gsap.set(
            "[data-hero-signal], [data-hero-char], [data-hero-cta], [data-hero-metric], [data-module-card]",
            { autoAlpha: 1, x: 0, y: 0, scale: 1, rotationX: 0, rotationY: 0 },
          );
          syncCountdown();
          startCountdownTicker();
          return;
        }

        const heroTimeline = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        heroTimeline
          .to(root, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 0)
          .fromTo(
            siteHeader,
            { autoAlpha: 0, y: -20 },
            { autoAlpha: 1, y: 0, duration: 0.4 },
            0.08,
          )
          .fromTo(
            "[data-hero-signal]",
            { autoAlpha: 0, letterSpacing: "0.52em", y: 8 },
            {
              autoAlpha: 1,
              letterSpacing: "0.24em",
              y: 0,
              duration: 0.46,
              ease: "power2.out",
            },
            0.28,
          )
          .fromTo(
            "[data-hero-char]",
            { autoAlpha: 0, y: 40, rotationX: 24 },
            {
              autoAlpha: 1,
              y: 0,
              rotationX: 0,
              duration: 0.52,
              stagger: 0.04,
              ease: "power4.out",
            },
            0.48,
          )
          .fromTo(
            "[data-hero-copy]",
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.42 },
            0.92,
          )
          .fromTo(
            "[data-hero-cta]",
            { autoAlpha: 0, scale: 0.9, y: 10 },
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              duration: 0.42,
              stagger: 0.08,
              ease: "back.out(1.2)",
            },
            1.14,
          )
          .fromTo(
            "[data-hero-metric]",
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.06 },
            1.42,
          );

        const moduleSection = root.querySelector<HTMLElement>("[data-module-section]");
        const moduleCards = Array.from(
          root.querySelectorAll<HTMLElement>("[data-module-card]"),
        );

        if (moduleSection && moduleCards.length) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: moduleSection,
                start: "top top+=24",
                end: "+=1100",
                scrub: 0.7,
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
              },
            })
            .fromTo(
              "[data-module-heading]",
              { autoAlpha: 0, y: 28 },
              { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
            )
            .fromTo(
              moduleCards,
              { autoAlpha: 0, x: -60 },
              {
                autoAlpha: 1,
                x: 0,
                duration: 0.78,
                stagger: 0.12,
                ease: "power3.out",
              },
              0.12,
            );
        }

        moduleCards.forEach((card) => {
          gsap.set(card, {
            transformPerspective: 900,
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
          });

          const rotateX = gsap.quickTo(card, "rotationX", {
            duration: 0.24,
            ease: "power2.out",
          });
          const rotateY = gsap.quickTo(card, "rotationY", {
            duration: 0.24,
            ease: "power2.out",
          });

          const handlePointerMove = (event: PointerEvent) => {
            const bounds = card.getBoundingClientRect();
            const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
            const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;

            rotateX(relativeY * -12);
            rotateY(relativeX * 12);
          };

          const handlePointerEnter = () => {
            gsap.to(card, {
              borderColor: "rgba(255,46,46,0.78)",
              boxShadow: "0 30px 80px rgba(255,46,46,0.12)",
              duration: 0.24,
              overwrite: "auto",
            });
          };

          const handlePointerLeave = () => {
            rotateX(0);
            rotateY(0);
            gsap.to(card, {
              borderColor: "rgba(255,255,255,0.12)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.38)",
              duration: 0.32,
              overwrite: "auto",
            });
          };

          card.addEventListener("pointermove", handlePointerMove);
          card.addEventListener("pointerenter", handlePointerEnter);
          card.addEventListener("pointerleave", handlePointerLeave);

          eventCleanups.push(() => {
            card.removeEventListener("pointermove", handlePointerMove);
            card.removeEventListener("pointerenter", handlePointerEnter);
            card.removeEventListener("pointerleave", handlePointerLeave);
            gsap.killTweensOf(card);
          });
        });

        const seasonSection = root.querySelector<HTMLElement>("[data-season-section]");

        if (seasonSection && countdownNodes.length) {
          ScrollTrigger?.create({
            trigger: seasonSection,
            start: "top 72%",
            once: true,
            onEnter: () => {
              const values = getCountdownValues(nextRace.countdownTarget);
              let completedTweens = 0;

              countdownNodes.forEach((node, index) => {
                const key = node.dataset.countdownKey as CountdownKey | undefined;
                if (!key) return;

                const realValue = values[key];
                const proxy = {
                  val: realValue + 40 + Math.floor(Math.random() * 180),
                };

                node.textContent = formatCountdownValue(proxy.val);

                gsap.to(proxy, {
                  val: realValue,
                  duration: 1.2,
                  delay: index * 0.05,
                  ease: "power2.out",
                  onUpdate: () => {
                    node.textContent = formatCountdownValue(proxy.val);
                  },
                  onComplete: () => {
                    completedTweens += 1;
                    if (completedTweens === countdownNodes.length) {
                      startCountdownTicker();
                    }
                  },
                });
              });

              if (countdownStatus) {
                countdownStatus.textContent = values.isStarted
                  ? "比赛周末进行中"
                  : "距离下一场比赛信号上线";
              }
            },
          });
        }

        gsap.fromTo(
          "[data-season-panel]",
          { autoAlpha: 0, y: 54 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: seasonSection,
              start: "top 78%",
            },
          },
        );

        ScrollTrigger.refresh();
      }, root);
    })();

    return () => {
      isDisposed = true;
      if (countdownIntervalId) window.clearInterval(countdownIntervalId);
      eventCleanups.forEach((cleanup) => cleanup());
      ScrollTrigger?.getAll().forEach((trigger) => trigger.kill());
      context?.revert();
    };
  }, [nextRace.countdownTarget]);

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-black text-white"
      style={{ opacity: 0 }}
    >
      <section className="relative isolate min-h-[calc(100svh-7rem)] overflow-hidden border-y border-white/10 bg-black">
        <HudGridCanvas />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_28%,rgba(255,46,46,0.18),transparent_24%),radial-gradient(circle_at_28%_82%,rgba(127,29,29,0.12),transparent_28%),linear-gradient(115deg,rgba(0,0,0,0.98)_12%,rgba(6,6,8,0.84)_54%,rgba(0,0,0,0.96)_100%)]" aria-hidden="true" />
        <div className="absolute left-[-10vw] top-[54%] h-px w-[120vw] -rotate-3 bg-gradient-to-r from-transparent via-red-500/90 to-transparent shadow-[0_0_32px_rgba(255,46,46,0.72)]" aria-hidden="true" />
        <div className="absolute left-[68%] top-0 h-full w-px bg-gradient-to-b from-transparent via-red-400/25 to-transparent" aria-hidden="true" />

        <div className="relative mx-auto flex min-h-[calc(100svh-7rem)] max-w-[1440px] flex-col justify-between px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <div className="max-w-6xl pt-2 sm:pt-8">
            <div
              data-hero-signal
              className="inline-flex items-center gap-3 border border-red-400/30 bg-black/55 px-3 py-2 font-mono text-[0.62rem] font-bold uppercase text-red-100/80 backdrop-blur sm:text-xs"
            >
              <span className="h-2 w-2 rounded-full bg-neonRed shadow-[0_0_20px_rgba(255,46,46,0.95)]" aria-hidden="true" />
              Race Signal Online
            </div>

            <h1
              className="mt-7 flex max-w-7xl flex-wrap overflow-hidden text-[clamp(3.7rem,12vw,10.5rem)] font-black leading-[0.84] tracking-[-0.075em]"
              aria-label="GridDelta CN"
            >
              {titleCharacters.map((character, index) => (
                <span
                  key={`${character}-${index}`}
                  data-hero-char
                  className="inline-block origin-bottom will-change-transform"
                  aria-hidden="true"
                >
                  {character === " " ? "\u00A0" : character}
                </span>
              ))}
            </h1>

            <p
              data-hero-copy
              className="mt-7 max-w-2xl text-base leading-8 text-zinc-300 sm:text-xl sm:leading-9"
            >
              面向中文车迷的 F1 数据指挥台。把实时计时、比赛复盘和赛季上下文压进同一块数字 pitwall。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                data-hero-cta
                href="/live"
                className="inline-flex h-12 items-center justify-center bg-neonRed px-6 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_0_42px_rgba(255,46,46,0.3)]"
              >
                查看实时计时
              </Link>
              <Link
                data-hero-cta
                href="/race-weekend"
                className="inline-flex h-12 items-center justify-center border border-white/20 bg-white/[0.045] px-6 text-sm font-black uppercase tracking-[0.12em] text-zinc-100 backdrop-blur"
              >
                进入单站复盘
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
            {[
              ["OPENF1", "LINK READY"],
              ["CN", "DATA PITWALL"],
              ["2026", "SEASON CONTEXT"],
            ].map(([label, value]) => (
              <div key={label} data-hero-metric className="bg-black/70 px-4 py-4 backdrop-blur">
                <p className="font-mono text-[0.6rem] font-bold tracking-[0.2em] text-red-300/70">{label}</p>
                <p className="mt-2 text-xs font-semibold tracking-[0.16em] text-zinc-300">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        data-module-section
        className="relative isolate flex min-h-screen items-center overflow-hidden border-b border-white/10 bg-[#050506] py-16 sm:py-20"
      >
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,46,46,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,46,46,0.05)_1px,transparent_1px)] [background-size:72px_72px]" aria-hidden="true" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-red-500/45 to-transparent" aria-hidden="true" />

        <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div data-module-heading className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-red-300/70">Command Modules</p>
              <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                五个模块，组成比赛周末控制台。
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-zinc-400 sm:text-base">
              滚动进入时整段锁定，模块按信号顺序装配。鼠标掠过卡片时，视角会根据指针位置发生轻微偏转。
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {commandModules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                data-module-card
                className="group relative min-h-[300px] overflow-hidden border border-white/[0.12] bg-black/70 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] will-change-transform xl:min-h-[390px]"
              >
                <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-red-400/90 to-transparent" aria-hidden="true" />
                <span className="absolute right-4 top-4 font-mono text-[0.62rem] font-bold tracking-[0.2em] text-red-300/60">{module.index}</span>
                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-zinc-500">{module.meta}</p>
                    <h3 className="mt-7 text-3xl font-black tracking-[-0.035em] text-white">{module.label}</h3>
                    <p className="mt-5 text-sm leading-7 text-zinc-400">{module.description}</p>
                  </div>
                  <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-4 text-sm font-bold text-zinc-300">
                    <span>打开模块</span>
                    <span className="text-xl text-neonRed" aria-hidden="true">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        data-season-section
        className="relative isolate overflow-hidden bg-black py-20 sm:py-28 lg:py-36"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,46,46,0.16),transparent_26%),radial-gradient(circle_at_82%_78%,rgba(127,29,29,0.1),transparent_30%)]" aria-hidden="true" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(115deg,rgba(255,46,46,0.12)_1px,transparent_1px)] [background-size:120px_120px]" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-[1440px] gap-5 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-12">
          <div data-season-panel className="border border-white/[0.12] bg-white/[0.035] p-5 backdrop-blur sm:p-8">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-red-300/70">Season Context</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-black leading-tight tracking-[-0.045em] sm:text-6xl">
              下一站信息与赛季秩序，保持在同一视野。
            </h2>

            <div className="mt-9 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
              <div className="bg-black/75 p-4">
                <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-zinc-500">下一站</p>
                <p className="mt-4 text-2xl font-black text-white">{nextRace.raceName}</p>
              </div>
              <div className="bg-black/75 p-4">
                <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-zinc-500">地点</p>
                <p className="mt-4 text-lg font-bold text-zinc-100">{nextRace.country} · {nextRace.location}</p>
                <p className="mt-2 text-sm text-zinc-500">{nextRace.circuitName}</p>
              </div>
              <div className="bg-black/75 p-4">
                <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-zinc-500">日期</p>
                <p className="mt-4 text-lg font-bold text-zinc-100">{dateRange}</p>
                <p className="mt-2 text-xs text-zinc-500">{sourceLabel}</p>
              </div>
            </div>

            <div className="mt-5 border border-white/10 bg-black/70 p-4 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p data-countdown-status className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-red-300/70">
                  等待计时信号
                </p>
                <p className="text-xs text-zinc-600">Live countdown / Asia Shanghai</p>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                {countdownItems.map((item) => (
                  <div key={item.key} className="border-l border-white/10 first:border-l-0">
                    <p
                      data-countdown-key={item.key}
                      className="font-mono text-3xl font-black tabular-nums text-white sm:text-5xl"
                    >
                      --
                    </p>
                    <p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-zinc-600">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {seasonLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-season-panel
                className="group border border-white/[0.12] bg-black/70 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-red-300/70">{item.meta}</p>
                    <h3 className="mt-4 text-3xl font-black tracking-[-0.035em] text-white">{item.label}</h3>
                  </div>
                  <span className="text-2xl text-neonRed" aria-hidden="true">→</span>
                </div>
              </Link>
            ))}

            <footer data-season-panel className="border border-zinc-900 bg-black/55 p-5 text-sm text-zinc-500">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-zinc-300">GridDelta CN</p>
                <p>非官方项目 · OpenF1 数据辅助 · For Chinese F1 fans</p>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </div>
  );
}
