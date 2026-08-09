"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HomeSmoothScroll } from "@/components/home-smooth-scroll";
import type {
  SceneBackgroundProps,
  SceneMotionState,
} from "@/components/scene-background";
import type { RaceWeekend } from "@/lib/types";

type ImmersiveHomepageProps = {
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

type CountdownDisplay = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  status: string;
};

type CountdownKey = Exclude<keyof CountdownValues, "isStarted">;

type GsapMatchMediaContext = {
  conditions?: Record<string, boolean>;
};

type GsapMatchMedia = {
  add(
    queries: Record<string, string>,
    callback: (context: GsapMatchMediaContext) => void | (() => void) | undefined,
  ): void;
  revert(): void;
};

const SceneBackground = dynamic<SceneBackgroundProps>(
  () => import("@/components/scene-background").then((module) => module.SceneBackground),
  {
    ssr: false,
    loading: () => <SceneLoadingLayer />,
  },
);

const commandModules = [
  {
    label: "单站复盘",
    href: "/race-weekend",
    meta: "Race Weekend",
    index: "01",
    description: "结果、赛控、圈速与天气在同一条比赛周末时间线上汇合。",
  },
  {
    label: "比赛结果",
    href: "/results",
    meta: "Results",
    index: "02",
    description: "完赛顺序和关键落点从速度轨迹里浮现，而不是被锁进表格。",
  },
  {
    label: "赛会控制",
    href: "/race-control",
    meta: "Race Control",
    index: "03",
    description: "旗语、事件和安全车信号被压缩成可以追踪的赛道脉冲。",
  },
  {
    label: "圈速分析",
    href: "/lap-analysis",
    meta: "Lap Analysis",
    index: "04",
    description: "每一圈的差值都是镜头中的一段速度变化。",
  },
  {
    label: "赛道天气",
    href: "/weather",
    meta: "Track Weather",
    index: "05",
    description: "温度、风向和赛道状态变成策略判断前的空气颗粒。",
  },
] as const;

const releaseLinks = [
  { label: "赛程", href: "/schedule", meta: "Calendar" },
  { label: "积分", href: "/standings", meta: "Standings" },
  { label: "车手", href: "/drivers", meta: "Drivers" },
] as const;

const countdownKeys: CountdownKey[] = ["days", "hours", "minutes", "seconds"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

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

function formatCountdownDisplay(values: CountdownValues): CountdownDisplay {
  return {
    days: formatCountdownValue(values.days),
    hours: formatCountdownValue(values.hours),
    minutes: formatCountdownValue(values.minutes),
    seconds: formatCountdownValue(values.seconds),
    status: values.isStarted ? "RACE WEEKEND LIVE" : "NEXT RACE SIGNAL",
  };
}

function getStageLabel(progress: number) {
  if (progress < 0.22) return "IGNITION";
  if (progress < 0.58) return "ACCELERATION";
  if (progress < 0.84) return "RACE SIGNAL";
  return "RELEASE";
}

function getFeatureIndex(progress: number) {
  if (progress < 0.22 || progress > 0.62) return null;
  return clamp(Math.floor(((progress - 0.22) / 0.36) * commandModules.length), 0, commandModules.length - 1);
}

function SceneLoadingLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_44%,rgba(212,168,67,0.13),transparent_24%),radial-gradient(circle_at_68%_58%,rgba(95,191,202,0.08),transparent_30%)]" />
      <div className="absolute left-[-16vw] top-[57%] h-px w-[132vw] -rotate-6 bg-gradient-to-r from-transparent via-gdGold/70 to-transparent" />
      <div className="absolute left-[16vw] top-[48%] h-px w-[72vw] rotate-12 bg-gradient-to-r from-transparent via-gdCyan/35 to-transparent" />
    </div>
  );
}

export function ImmersiveHomepage({
  nextRace,
  sourceLabel,
  dateRange,
}: ImmersiveHomepageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeFeatureRef = useRef<number | null>(null);
  const activeStageRef = useRef("IGNITION");
  const countdownFrameRef = useRef(0);
  const countdownRollingRef = useRef(false);
  const countdownRolledRef = useRef(false);
  const rollCountdownRef = useRef<() => void>(() => undefined);
  const sceneStateRef = useRef<SceneMotionState>({
    targetProgress: 0,
    progress: 0,
    targetVelocity: 0,
    velocity: 0,
    pointerX: 0,
    pointerY: 0,
    reducedMotion: false,
  });
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number | null>(null);
  const [stageLabel, setStageLabel] = useState("IGNITION");
  const [countdown, setCountdown] = useState<CountdownDisplay>({
    days: "--",
    hours: "--",
    minutes: "--",
    seconds: "--",
    status: "SYNCING RACE CLOCK",
  });

  useEffect(() => {
    const syncCountdown = () => {
      if (countdownRollingRef.current) return;
      setCountdown(formatCountdownDisplay(getCountdownValues(nextRace.countdownTarget)));
    };

    syncCountdown();
    const intervalId = window.setInterval(syncCountdown, 1000);

    rollCountdownRef.current = () => {
      if (countdownRolledRef.current || countdownRollingRef.current) return;

      countdownRolledRef.current = true;
      countdownRollingRef.current = true;
      const startedAt = performance.now();
      const duration = 720;

      const tick = (time: number) => {
        const elapsed = time - startedAt;
        const realValues = getCountdownValues(nextRace.countdownTarget);

        if (elapsed >= duration) {
          countdownRollingRef.current = false;
          setCountdown(formatCountdownDisplay(realValues));
          return;
        }

        const easeOut = 1 - Math.pow(1 - elapsed / duration, 3);
        setCountdown({
          days: formatCountdownValue(realValues.days + Math.round((1 - easeOut) * (42 + Math.random() * 140))),
          hours: formatCountdownValue(realValues.hours + Math.round((1 - easeOut) * (12 + Math.random() * 70))),
          minutes: formatCountdownValue(realValues.minutes + Math.round((1 - easeOut) * (20 + Math.random() * 120))),
          seconds: formatCountdownValue(realValues.seconds + Math.round((1 - easeOut) * (30 + Math.random() * 180))),
          status: realValues.isStarted ? "RACE WEEKEND LIVE" : "NEXT RACE SIGNAL",
        });

        countdownFrameRef.current = window.requestAnimationFrame(tick);
      };

      countdownFrameRef.current = window.requestAnimationFrame(tick);
    };

    return () => {
      window.clearInterval(intervalId);
      window.cancelAnimationFrame(countdownFrameRef.current);
      countdownRollingRef.current = false;
    };
  }, [nextRace.countdownTarget]);

  useEffect(() => {
    const root = rootRef.current;
    const scrollContainer = scrollRef.current;
    if (!root || !scrollContainer) return;

    let isDisposed = false;
    let context: { revert: () => void } | undefined;
    let mediaMatcher: GsapMatchMedia | undefined;
    let viewportCleanup: (() => void) | undefined;
    let refreshCleanup: (() => void) | undefined;
    let resizeFrame = 0;

    const setFeatureIndex = (nextIndex: number | null) => {
      if (activeFeatureRef.current === nextIndex) return;
      activeFeatureRef.current = nextIndex;
      setActiveFeatureIndex(nextIndex);
    };

    const setStage = (progress: number) => {
      const nextStage = getStageLabel(progress);
      if (activeStageRef.current === nextStage) return;
      activeStageRef.current = nextStage;
      setStageLabel(nextStage);
    };

    const syncSceneProgress = (progress: number, velocity: number) => {
      const motion = sceneStateRef.current;
      motion.targetProgress = progress;
      motion.targetVelocity = clamp(velocity / 1800, -1.2, 1.2);
      setStage(progress);
      setFeatureIndex(getFeatureIndex(progress));

      if (progress >= 0.58) {
        rollCountdownRef.current();
      }
    };

    void (async () => {
      const [{ gsap }, scrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (isDisposed) return;

      const { ScrollTrigger } = scrollTriggerModule;
      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        mediaMatcher = gsap.matchMedia() as unknown as GsapMatchMedia;
        mediaMatcher.add(
          {
            desktop: "(min-width: 768px)",
            mobile: "(max-width: 767px)",
            finePointer: "(pointer: fine)",
            reduce: "(prefers-reduced-motion: reduce)",
          },
          (matchContext) => {
            const conditions = matchContext.conditions ?? {};
            const isMobile = Boolean(conditions.mobile);
            const isFinePointer = Boolean(conditions.finePointer);
            const isReducedMotion = Boolean(conditions.reduce);
            const select = gsap.utils.selector(root);
            const hero = select("[data-hero]");
            const featureLabel = select("[data-feature-label]");
            const featureItems = select("[data-feature-item]");
            const raceSignal = select("[data-race-signal]");
            const release = select("[data-release]");
            const stageLine = select("[data-stage-line]");

            sceneStateRef.current.reducedMotion = isReducedMotion;

            if (isReducedMotion) {
              sceneStateRef.current.targetProgress = 0.64;
              sceneStateRef.current.progress = 0.64;
              sceneStateRef.current.targetVelocity = 0;
              sceneStateRef.current.velocity = 0;
              gsap.set([hero, featureLabel, featureItems, raceSignal, release], {
                autoAlpha: 1,
                clearProps: "transform,filter,pointerEvents",
              });
              gsap.set(stageLine, { scaleX: 1, transformOrigin: "left center" });
              setFeatureIndex(0);
              setStage(0.64);
              rollCountdownRef.current();
              ScrollTrigger.refresh();
              ScrollTrigger.update();
              return undefined;
            }

            gsap.set(hero, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)" });
            gsap.set(featureLabel, { autoAlpha: 0, y: isMobile ? 6 : 10 });
            gsap.set(featureItems, {
              autoAlpha: 0,
              y: isMobile ? 46 : 84,
              x: isMobile ? 0 : 120,
              scale: 0.88,
              filter: "blur(10px)",
            });
            gsap.set(raceSignal, {
              autoAlpha: 0,
              y: isMobile ? 36 : 64,
              scale: 0.94,
              filter: "blur(8px)",
            });
            gsap.set(release, {
              autoAlpha: 0,
              y: isMobile ? 34 : 58,
              scale: 0.96,
              filter: "blur(6px)",
            });
            gsap.set(stageLine, { scaleX: 0, transformOrigin: "left center" });

            const timeline = gsap.timeline({
              paused: true,
              defaults: { ease: "power2.out" },
            });

            timeline
              .to(stageLine, { scaleX: 1, duration: 0.2, ease: "power1.out" }, 0.02)
              .fromTo(
                featureLabel,
                { autoAlpha: 0, y: isMobile ? 6 : 10 },
                { autoAlpha: 1, y: 0, duration: 0.03, ease: "power2.out" },
                0.205,
              )
              .to(
                featureLabel,
                { autoAlpha: 0, y: isMobile ? -5 : -8, duration: 0.025, ease: "power2.in" },
                0.56,
              )
              .to(
                hero,
                {
                  autoAlpha: 0,
                  y: isMobile ? -42 : -82,
                  scale: isMobile ? 0.84 : 0.72,
                  filter: "blur(6px)",
                  duration: 0.1,
                  ease: "power2.inOut",
                },
                0.16,
              );

            commandModules.forEach((_, index) => {
              const start = 0.235 + index * 0.066;
              const hold = start + 0.032;
              const exit = start + 0.062;
              const xDirection = index % 2 === 0 ? 1 : -1;
              const feature = featureItems[index];

              timeline
                .fromTo(
                  feature,
                  {
                    autoAlpha: 0,
                    x: isMobile ? 0 : 150 * xDirection,
                    y: isMobile ? 54 : 94,
                    scale: 0.88,
                    filter: "blur(12px)",
                  },
                  {
                    autoAlpha: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 0.028,
                    ease: "power3.out",
                  },
                  start,
                )
                .to(feature, { autoAlpha: 1, duration: 0.02, ease: "none" }, hold)
                .to(
                  feature,
                  {
                    autoAlpha: 0,
                    x: isMobile ? 0 : -120 * xDirection,
                    y: isMobile ? -42 : -74,
                    scale: 0.9,
                    filter: "blur(10px)",
                    duration: 0.032,
                    ease: "power2.in",
                  },
                  exit,
                );
            });

            timeline
              .fromTo(
                raceSignal,
                {
                  autoAlpha: 0,
                  y: isMobile ? 42 : 68,
                  scale: 0.94,
                  filter: "blur(10px)",
                },
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  duration: 0.07,
                  ease: "power3.out",
                },
                0.58,
              )
              .to(raceSignal, { autoAlpha: 1, duration: 0.17, ease: "none" }, 0.66)
              .to(
                raceSignal,
                {
                  autoAlpha: 0,
                  y: isMobile ? -38 : -58,
                  scale: 0.95,
                  filter: "blur(8px)",
                  duration: 0.045,
                  ease: "power2.in",
                },
                0.82,
              )
              .fromTo(
                release,
                {
                  autoAlpha: 0,
                  y: isMobile ? 38 : 62,
                  scale: 0.96,
                  filter: "blur(8px)",
                },
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  duration: 0.075,
                  ease: "power3.out",
                },
                0.845,
              );

            const timelineEnd = { value: 0 };
            timeline.to(timelineEnd, { value: 1, duration: 0.001, ease: "none" }, 0.999);

            const trigger = ScrollTrigger.create({
              trigger: scrollContainer,
              start: "top top",
              end: "bottom bottom",
              scrub: isMobile ? 0.18 : 0.55,
              invalidateOnRefresh: true,
              onRefresh: (self) => {
                timeline.progress(self.progress);
                syncSceneProgress(self.progress, self.getVelocity());
              },
              onUpdate: (self) => {
                timeline.progress(self.progress);
                syncSceneProgress(self.progress, self.getVelocity());
              },
            });

            let pointerCleanup: (() => void) | undefined;

            if (isFinePointer && !isMobile) {
              const handlePointerMove = (event: PointerEvent) => {
                const width = Math.max(window.innerWidth, 1);
                const height = Math.max(window.innerHeight, 1);
                sceneStateRef.current.pointerX = clamp(event.clientX / width - 0.5, -0.5, 0.5);
                sceneStateRef.current.pointerY = clamp(event.clientY / height - 0.5, -0.5, 0.5);
              };

              const handlePointerLeave = () => {
                sceneStateRef.current.pointerX = 0;
                sceneStateRef.current.pointerY = 0;
              };

              window.addEventListener("pointermove", handlePointerMove, { passive: true });
              document.documentElement.addEventListener("pointerleave", handlePointerLeave);

              pointerCleanup = () => {
                window.removeEventListener("pointermove", handlePointerMove);
                document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
              };
            }

            timeline.progress(trigger.progress);
            syncSceneProgress(trigger.progress, trigger.getVelocity());
            ScrollTrigger.refresh();
            ScrollTrigger.update();

            return () => {
              pointerCleanup?.();
              trigger.kill();
              timeline.kill();
              sceneStateRef.current.pointerX = 0;
              sceneStateRef.current.pointerY = 0;
            };
          },
        );

        const refreshOnViewportChange = () => {
          window.cancelAnimationFrame(resizeFrame);
          resizeFrame = window.requestAnimationFrame(() => {
            ScrollTrigger.refresh();
            ScrollTrigger.update();
          });
        };
        const handleScrollTriggerRefresh = () => {
          ScrollTrigger.update();
        };

        window.addEventListener("resize", refreshOnViewportChange, { passive: true });
        window.addEventListener("orientationchange", refreshOnViewportChange);
        ScrollTrigger.addEventListener("refresh", handleScrollTriggerRefresh);
        viewportCleanup = () => {
          window.removeEventListener("resize", refreshOnViewportChange);
          window.removeEventListener("orientationchange", refreshOnViewportChange);
        };
        refreshCleanup = () => {
          ScrollTrigger.removeEventListener("refresh", handleScrollTriggerRefresh);
        };
        ScrollTrigger.refresh();
      }, root);
    })();

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(resizeFrame);
      viewportCleanup?.();
      refreshCleanup?.();
      mediaMatcher?.revert();
      context?.revert();
    };
  }, [nextRace.countdownTarget]);

  return (
    <div
      ref={rootRef}
      className="gd-home relative min-h-screen w-full bg-gdBg text-gdText"
    >
      <HomeSmoothScroll />
      <div
        ref={scrollRef}
        className="gd-home-scroll relative min-h-[360svh] md:min-h-[480svh]"
      >
        <div className="gd-home-stage sticky top-0 h-[100svh] overflow-hidden bg-gdBg supports-[height:100dvh]:h-[100dvh]">
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_52%_48%,rgba(212,168,67,0.08),transparent_25%),radial-gradient(circle_at_70%_40%,rgba(95,191,202,0.065),transparent_32%)]" />
          <SceneBackground stateRef={sceneStateRef} />

          <header className="fixed inset-x-0 top-0 z-40 px-5 pt-[calc(env(safe-area-inset-top)+1rem)] sm:px-8 lg:px-10">
            <div className="flex items-start justify-between gap-6 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-gdText/70">
              <Link
                href="/"
                className="min-h-11 py-2 transition hover:text-gdGold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gdCyan"
                aria-label="LAPMETRY 首页"
              >
                <span className="sm:hidden">LM</span>
                <span className="hidden sm:inline">LAPMETRY</span>
              </Link>
              <nav className="flex min-h-11 items-start gap-4 py-2 sm:gap-5" aria-label="首页导航">
                <a
                  href="#menu"
                  className="transition hover:text-gdGold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gdCyan"
                >
                  Menu
                </a>
                <span className="text-gdLine" aria-hidden="true">
                  |
                </span>
                <Link
                  href="/live"
                  className="text-gdGold transition hover:text-gdText focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gdCyan"
                >
                  Live
                </Link>
              </nav>
            </div>
          </header>

          <div className="pointer-events-none absolute inset-x-5 top-[calc(env(safe-area-inset-top)+4.7rem)] z-20 flex items-center justify-between gap-4 font-mono text-[0.62rem] uppercase tracking-[0.35em] text-gdCyan/80 sm:inset-x-8 lg:inset-x-10">
            <span>{stageLabel}</span>
            <span className="hidden text-gdText/30 sm:inline">{nextRace.location}</span>
            <span>{countdown.status}</span>
          </div>
          <div
            data-stage-line
            className="pointer-events-none absolute left-5 right-5 top-[calc(env(safe-area-inset-top)+6.2rem)] z-20 h-px origin-left bg-gdLine sm:left-8 sm:right-8 lg:left-10 lg:right-10"
            aria-hidden="true"
          />

          <section
            data-hero
            className="gd-scene-panel absolute inset-0 z-10 flex flex-col justify-end px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-28 sm:px-8 sm:pb-[calc(env(safe-area-inset-bottom)+3rem)] lg:px-10"
          >
            <div className="max-w-[88rem]">
              <p className="gd-label">Velocity at Dawn</p>
              <h1
                className="mt-5 flex max-w-[84rem] flex-wrap gap-x-[0.14em] text-[clamp(2.75rem,13.6vw,10.8rem)] font-black uppercase leading-[0.88] tracking-[0.08em] text-gdText"
                aria-label="LAPMETRY"
              >
                <span>LAPMETRY</span>
              </h1>
              <p className="mt-6 font-mono text-[clamp(0.78rem,1.4vw,1rem)] uppercase tracking-[0.35em] text-gdCyan">
                F1 DATA IN MOTION
              </p>
              <p className="mt-6 max-w-2xl text-[clamp(0.95rem,1.65vw,1.18rem)] leading-8 text-[rgba(237,233,224,0.48)]">
                中文 F1 数据在同一段可滚动镜头中被点亮：赛道、信号、倒计时和比赛周末入口共享同一个速度场。
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-4 font-mono text-xs uppercase tracking-[0.28em]">
                <Link
                  href="/live"
                  className="group inline-flex min-h-11 items-center gap-3 py-2 text-gdGold transition hover:text-gdText focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gdCyan"
                >
                  进入实时计时
                  <span className="transition group-hover:translate-x-1" aria-hidden="true">
                    →
                  </span>
                </Link>
                <span className="h-6 w-px bg-gdLine" aria-hidden="true" />
                <Link
                  href="/race-weekend"
                  className="group inline-flex min-h-11 items-center gap-3 py-2 text-gdText/70 transition hover:text-gdGold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gdCyan"
                >
                  查看下一站
                  <span className="transition group-hover:translate-x-1" aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </section>

          <section
            data-feature-stack
            className="pointer-events-none absolute inset-0 z-10 flex items-center px-5 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-32 sm:px-8 lg:px-10"
            aria-label="比赛周末功能入口"
          >
            <div className="relative h-[58dvh] min-h-[24rem] w-full">
              <p data-feature-label className="gd-label absolute left-0 top-0">
                Telemetry routes
              </p>
              {commandModules.map((module, index) => {
                const isActive = activeFeatureIndex === index;

                return (
                  <Link
                    key={module.href}
                    data-feature-item
                    href={module.href}
                    className={`absolute left-0 top-1/2 flex min-h-44 w-full -translate-y-1/2 flex-col justify-center py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gdCyan ${
                      isActive ? "pointer-events-auto" : "pointer-events-none"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span className="font-mono text-xs uppercase tracking-[0.35em] text-gdCyan">
                      {module.index} {module.meta}
                    </span>
                    <span className="mt-4 block max-w-[13ch] text-[clamp(3.15rem,11.5vw,9.2rem)] font-black uppercase leading-[0.92] tracking-[0.08em] text-gdText">
                      {module.label}
                    </span>
                    <span className="mt-5 block max-w-xl text-[clamp(0.92rem,1.6vw,1.12rem)] leading-7 text-[rgba(237,233,224,0.48)]">
                      {module.description}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section
            data-race-signal
            className="gd-scene-panel pointer-events-none absolute inset-0 z-10 flex items-center px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-32 sm:px-8 lg:px-10"
          >
            <div className="w-full max-w-[82rem]">
              <p className="gd-label">Race Signal</p>
              <h2 className="mt-5 max-w-[12ch] text-[clamp(3.35rem,12vw,10rem)] font-black uppercase leading-[0.88] tracking-[0.08em] text-gdText">
                {nextRace.location}
              </h2>
              <p className="mt-4 max-w-4xl font-mono text-[clamp(1rem,2.3vw,1.8rem)] uppercase tracking-[0.16em] text-gdGold">
                {nextRace.circuitName}
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.35em] text-gdCyan/80">
                <span>{dateRange}</span>
                <span>{sourceLabel}</span>
              </div>

              <div className="mt-9" aria-label="下一站倒计时">
                <div className="flex max-w-6xl flex-wrap items-baseline gap-x-[clamp(0.35rem,2vw,1.4rem)] gap-y-2 font-mono text-[clamp(2.7rem,10vw,7.8rem)] font-black leading-none tracking-[0.05em] text-gdGold">
                  <span>{countdown.days}</span>
                  <span className="text-gdCyan/45">:</span>
                  <span>{countdown.hours}</span>
                  <span className="text-gdCyan/45">:</span>
                  <span>{countdown.minutes}</span>
                  <span className="text-gdCyan/45">:</span>
                  <span>{countdown.seconds}</span>
                </div>
                <div className="mt-3 grid max-w-[42rem] grid-cols-4 gap-2 font-mono text-[0.62rem] uppercase tracking-[0.35em] text-[rgba(237,233,224,0.48)]">
                  {countdownKeys.map((key) => (
                    <span key={key}>{key === "days" ? "DAY" : key === "hours" ? "HOUR" : key === "minutes" ? "MIN" : "SEC"}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="menu"
            data-release
            className="gd-scene-panel absolute inset-0 z-10 flex items-end px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-32 sm:px-8 sm:pb-[calc(env(safe-area-inset-bottom)+3rem)] lg:px-10"
          >
            <div className="w-full">
              <p className="gd-label">Release</p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-8">
                {releaseLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group inline-flex min-h-14 items-baseline gap-3 py-2 text-[clamp(2.6rem,8vw,6.8rem)] font-black uppercase leading-none tracking-[0.08em] text-gdText transition hover:text-gdGold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gdCyan"
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-xs tracking-[0.35em] text-gdCyan transition group-hover:text-gdGold">
                      {item.meta}
                    </span>
                  </Link>
                ))}
              </div>
              <footer className="mt-12 flex flex-col gap-2 font-mono uppercase tracking-[0.28em] sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gdText">LAPMETRY</p>
                <p className="max-w-xl text-[0.62rem] leading-5 text-[rgba(237,233,224,0.48)]">
                  BUILT FOR THE RACE BETWEEN THE NUMBERS
                </p>
              </footer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
