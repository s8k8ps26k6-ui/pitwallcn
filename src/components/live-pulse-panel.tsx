"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const signalLabels = ["LIVE TIMING", "RACE WEEKEND", "SESSION DATA", "OPENF1"];
const telemetryBlocks = ["Timing", "Calendar", "Race Control"];
const pulseDots = Array.from({ length: 5 }, (_, index) => index);

export function LivePulsePanel() {
  const panelRef = useRef<HTMLAnchorElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const blockRefs = useRef<Array<HTMLDivElement | null>>([]);
  const accentRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;

    const ctx = gsap.context(() => {
      gsap.set([sweepRef.current, lineRef.current], { willChange: "transform" });
      gsap.set(dotRefs.current, { willChange: "transform, opacity" });
      gsap.set(blockRefs.current, { willChange: "transform, opacity" });

      if (motionQuery.matches) {
        gsap.set(sweepRef.current, { xPercent: 8, opacity: 0.24 });
        gsap.set(lineRef.current, { scaleX: 0.72, transformOrigin: "left center" });
        gsap.set(dotRefs.current, { opacity: 0.62 });
        gsap.set(blockRefs.current, { opacity: 0.78 });
        return;
      }

      const timeline = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });

      timeline
        .fromTo(
          sweepRef.current,
          { xPercent: -120, opacity: 0.08 },
          { xPercent: 128, opacity: 0.42, duration: 4.2, ease: "power1.inOut" },
          0,
        )
        .fromTo(
          lineRef.current,
          { scaleX: 0.28, xPercent: -4 },
          { scaleX: 1, xPercent: 5, duration: 2.1, yoyo: true, repeat: 1 },
          0.2,
        )
        .to(
          dotRefs.current,
          {
            x: 16,
            opacity: 1,
            duration: 1.25,
            stagger: 0.16,
            yoyo: true,
            repeat: 3,
          },
          0.35,
        )
        .to(
          blockRefs.current,
          {
            y: -6,
            opacity: 1,
            duration: 1.4,
            stagger: 0.22,
            yoyo: true,
            repeat: 2,
          },
          0.65,
        )
        .to(
          accentRef.current,
          { opacity: 1, scaleX: 1, duration: 1.6, yoyo: true, repeat: 1 },
          0.9,
        );

      timelineRef.current = timeline;
    }, panel);

    const updateMotionPreference = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      timelineRef.current?.timeScale(event.matches ? 0 : 1);
    };

    motionQuery.addEventListener("change", updateMotionPreference);

    return () => {
      motionQuery.removeEventListener("change", updateMotionPreference);
      timelineRef.current = null;
      ctx.revert();
    };
  }, []);

  const intensify = () => {
    if (reducedMotionRef.current) {
      return;
    }

    timelineRef.current?.timeScale(1.55);
    gsap.to(panelRef.current, {
      borderColor: "rgba(239, 68, 68, 0.48)",
      boxShadow: "0 20px 70px rgba(127, 29, 29, 0.18)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const settle = () => {
    if (reducedMotionRef.current) {
      return;
    }

    timelineRef.current?.timeScale(1);
    gsap.to(panelRef.current, {
      borderColor: "rgba(39, 39, 42, 0.9)",
      boxShadow: "0 16px 50px rgba(0, 0, 0, 0.18)",
      duration: 0.45,
      ease: "power2.out",
    });
  };

  return (
    <section className="motion-fade-up motion-delay-1" aria-labelledby="live-pulse-title">
      <Link
        ref={panelRef}
        href="/live"
        aria-label="打开实时计时模块，查看可用的 F1 数据入口"
        className="group relative block overflow-hidden rounded-[1.75rem] border border-zinc-800/90 bg-[#070708] p-4 shadow-xl shadow-black/20 transition-colors hover:border-red-500/40 sm:rounded-[2rem] sm:p-5 lg:p-6"
        onPointerEnter={intensify}
        onPointerLeave={settle}
        onPointerDown={intensify}
        onPointerUp={settle}
        onPointerCancel={settle}
        onFocus={intensify}
        onBlur={settle}
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(220,38,38,0.14),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_38%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]"
          aria-hidden="true"
        />
        <div
          ref={sweepRef}
          className="absolute inset-y-0 left-1/2 w-24 -skew-x-12 bg-gradient-to-r from-transparent via-red-400/18 to-transparent opacity-20"
          aria-hidden="true"
        />
        <span
          ref={accentRef}
          className="absolute left-5 right-5 top-0 h-px origin-left scale-x-50 bg-gradient-to-r from-neonRed via-red-300/50 to-transparent opacity-70"
          aria-hidden="true"
        />

        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-zinc-500 sm:text-[0.68rem]">
              {signalLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="max-w-3xl">
              <p className="eyebrow text-red-300/80">Pitwall Live Pulse</p>
              <h2
                id="live-pulse-title"
                className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl"
              >
                数据引擎保持在线，入口随时就绪。
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7">
                以克制的遥测节奏呈现数据流、信号扫描与模块可用状态；这是视觉化系统脉冲，不展示或模拟实时比赛指标。
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-neonRed/35" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neonRed" />
              </span>
              DATA LINK ACTIVE
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between text-[0.64rem] font-bold uppercase tracking-[0.22em] text-zinc-500">
              <span>Telemetry Rhythm</span>
              <span className="text-red-300/70">Visual Only</span>
            </div>

            <div className="relative h-28 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-5">
              <div className="absolute inset-x-4 top-1/2 h-px bg-zinc-800" aria-hidden="true" />
              <div
                ref={lineRef}
                className="absolute left-4 right-4 top-1/2 h-px origin-left bg-gradient-to-r from-neonRed via-red-200/80 to-transparent"
                aria-hidden="true"
              />
              <div className="relative flex h-full items-center justify-between">
                {pulseDots.map((dot) => (
                  <span
                    key={dot}
                    ref={(node) => {
                      dotRefs.current[dot] = node;
                    }}
                    className="h-2 w-2 rounded-full border border-red-200/50 bg-neonRed/70 shadow-[0_0_18px_rgba(220,38,38,0.35)]"
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {telemetryBlocks.map((label, index) => (
                <div
                  key={label}
                  ref={(node) => {
                    blockRefs.current[index] = node;
                  }}
                  className="rounded-2xl border border-zinc-800/85 bg-white/[0.035] px-3 py-3"
                >
                  <div className="mb-2 h-1 w-10 rounded-full bg-gradient-to-r from-neonRed/80 to-transparent" />
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm font-semibold text-zinc-300">
          <span>打开实时计时模块</span>
          <span className="translate-x-0 text-neonRed opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true">
            →
          </span>
        </div>
      </Link>
    </section>
  );
}
