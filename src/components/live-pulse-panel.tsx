"use client";

import Link from "next/link";

const signalLabels = ["LIVE TIMING", "RACE WEEKEND", "SESSION DATA", "OPENF1"];
const telemetryBlocks = ["Timing", "Calendar", "Race Control"];
const pulseDots = Array.from({ length: 5 }, (_, index) => index);

export function LivePulsePanel() {
  return (
    <section className="motion-fade-up motion-delay-1" aria-labelledby="live-pulse-title">
      <Link
        href="/live"
        aria-label="打开实时计时模块，查看可用的 F1 数据入口"
        className="group relative block overflow-hidden rounded-[1.75rem] border border-zinc-800/90 bg-[#070708] p-4 shadow-xl shadow-black/20 transition-[border-color,box-shadow] duration-300 hover:border-red-500/40 hover:shadow-red-950/20 sm:rounded-[2rem] sm:p-5 lg:p-6"
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
          className="live-pulse-sweep absolute inset-y-0 left-1/2 w-24 -skew-x-12 bg-gradient-to-r from-transparent via-red-400/18 to-transparent opacity-20"
          aria-hidden="true"
        />
        <span
          className="live-pulse-accent absolute left-5 right-5 top-0 h-px origin-left scale-x-50 bg-gradient-to-r from-neonRed via-red-300/50 to-transparent opacity-70"
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
                className="live-pulse-line absolute left-4 right-4 top-1/2 h-px origin-left bg-gradient-to-r from-neonRed via-red-200/80 to-transparent"
                aria-hidden="true"
              />
              <div className="relative flex h-full items-center justify-between">
                {pulseDots.map((dot) => (
                  <span
                    key={dot}
                    className="live-pulse-dot h-2 w-2 rounded-full border border-red-200/50 bg-neonRed/70 shadow-[0_0_18px_rgba(220,38,38,0.35)]"
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {telemetryBlocks.map((label) => (
                <div
                  key={label}
                  className="live-pulse-block rounded-2xl border border-zinc-800/85 bg-white/[0.035] px-3 py-3"
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
          <span
            className="translate-x-0 text-neonRed opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100"
            aria-hidden="true"
          >
            →
          </span>
        </div>
      </Link>

      <style jsx>{`
        .live-pulse-sweep {
          animation: liveSweep 4.2s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .live-pulse-accent {
          animation: liveAccent 4.2s ease-in-out infinite;
        }

        .live-pulse-line {
          animation: liveLine 4.2s ease-in-out infinite;
          will-change: transform;
        }

        .live-pulse-dot {
          animation: liveDot 4.2s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .live-pulse-dot:nth-child(2) {
          animation-delay: 160ms;
        }

        .live-pulse-dot:nth-child(3) {
          animation-delay: 320ms;
        }

        .live-pulse-dot:nth-child(4) {
          animation-delay: 480ms;
        }

        .live-pulse-dot:nth-child(5) {
          animation-delay: 640ms;
        }

        .live-pulse-block {
          animation: liveBlock 4.2s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .live-pulse-block:nth-child(2) {
          animation-delay: 220ms;
        }

        .live-pulse-block:nth-child(3) {
          animation-delay: 440ms;
        }

        @keyframes liveSweep {
          0% {
            opacity: 0.08;
            transform: translateX(-120%) skewX(-12deg);
          }
          52% {
            opacity: 0.42;
            transform: translateX(128%) skewX(-12deg);
          }
          100% {
            opacity: 0.08;
            transform: translateX(128%) skewX(-12deg);
          }
        }

        @keyframes liveAccent {
          0%,
          100% {
            opacity: 0.42;
            transform: scaleX(0.5);
          }
          50% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes liveLine {
          0%,
          100% {
            transform: scaleX(0.28) translateX(-4%);
          }
          50% {
            transform: scaleX(1) translateX(5%);
          }
        }

        @keyframes liveDot {
          0%,
          100% {
            opacity: 0.62;
            transform: translateX(0);
          }
          50% {
            opacity: 1;
            transform: translateX(16px);
          }
        }

        @keyframes liveBlock {
          0%,
          100% {
            opacity: 0.78;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-6px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .live-pulse-sweep,
          .live-pulse-accent,
          .live-pulse-line,
          .live-pulse-dot,
          .live-pulse-block {
            animation: none;
          }

          .live-pulse-sweep {
            opacity: 0.24;
            transform: translateX(8%) skewX(-12deg);
          }

          .live-pulse-accent {
            opacity: 0.7;
            transform: scaleX(0.72);
          }

          .live-pulse-line {
            transform: scaleX(0.72);
            transform-origin: left center;
          }

          .live-pulse-dot {
            opacity: 0.62;
          }

          .live-pulse-block {
            opacity: 0.78;
          }
        }
      `}</style>
    </section>
  );
}
