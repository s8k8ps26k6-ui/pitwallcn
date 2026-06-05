"use client";

import { useEffect, useRef, useState } from "react";

const INTRO_SESSION_KEY = "griddelta-cn-home-intro-last-played";
const INTRO_COOLDOWN_MS = 10 * 60 * 1000;
const EXIT_AFTER_MS = 5000;
const REMOVE_AFTER_MS = 5600;
const SAFETY_REMOVE_AFTER_MS = 7000;
const REDUCED_EXIT_AFTER_MS = 560;
const REDUCED_REMOVE_AFTER_MS = 900;
const SKIP_REMOVE_AFTER_MS = 260;

let inMemoryLastPlayed = 0;

function canUseReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isForcedPreview() {
  return new URLSearchParams(window.location.search).get("intro") === "1";
}

function markIntroPlayed(now = Date.now()) {
  inMemoryLastPlayed = now;

  try {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, String(now));
  } catch {
    // Storage can be blocked in private or restricted contexts. The intro must
    // never prevent the homepage from becoming available.
  }
}

function getLastPlayed() {
  try {
    const storedValue = window.sessionStorage.getItem(INTRO_SESSION_KEY);
    const parsedValue = storedValue ? Number(storedValue) : 0;

    return Number.isFinite(parsedValue) ? parsedValue : inMemoryLastPlayed;
  } catch {
    return inMemoryLastPlayed;
  }
}

function shouldPlayIntro() {
  if (isForcedPreview()) {
    return true;
  }

  const lastPlayed = getLastPlayed();

  return !lastPlayed || Date.now() - lastPlayed > INTRO_COOLDOWN_MS;
}

export function HomeIntroSequence() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!shouldPlayIntro()) {
      return;
    }

    const prefersReducedMotion = canUseReducedMotion();

    setIsReducedMotion(prefersReducedMotion);
    markIntroPlayed();
    setShouldRender(true);

    timersRef.current = prefersReducedMotion
      ? [
          window.setTimeout(() => setIsExiting(true), REDUCED_EXIT_AFTER_MS),
          window.setTimeout(() => setShouldRender(false), REDUCED_REMOVE_AFTER_MS),
          window.setTimeout(() => setShouldRender(false), SAFETY_REMOVE_AFTER_MS),
        ]
      : [
          window.setTimeout(() => setIsExiting(true), EXIT_AFTER_MS),
          window.setTimeout(() => setShouldRender(false), REMOVE_AFTER_MS),
          window.setTimeout(() => setShouldRender(false), SAFETY_REMOVE_AFTER_MS),
        ];

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  function handleSkip() {
    markIntroPlayed();
    setIsExiting(true);
    window.setTimeout(() => setShouldRender(false), SKIP_REMOVE_AFTER_MS);
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center overflow-hidden bg-black text-white transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [height:100dvh] [min-height:100dvh] supports-[height:100svh]:[height:100svh] supports-[min-height:100svh]:[min-height:100svh] ${
        isExiting ? "pointer-events-none opacity-0" : "opacity-100"
      } ${isReducedMotion ? "intro-reduced" : ""}`}
      role="dialog"
      aria-label="GridDelta CN homepage intro"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,46,46,0.12),transparent_30%),radial-gradient(circle_at_50%_0%,rgba(113,113,122,0.11),transparent_42%),linear-gradient(135deg,rgba(9,9,11,1),rgba(0,0,0,1)_58%,rgba(24,24,27,0.94))]" />
      <div
        className="intro-grid absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:42px_42px]"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-zinc-900/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent" />
      <div className="intro-red-halo absolute left-1/2 top-1/2 h-56 w-[min(86vw,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neonRed/20 blur-3xl" />
      <div className="intro-energy-line absolute left-1/2 top-1/2 h-px w-[min(82vw,50rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-neonRed to-transparent shadow-[0_0_22px_rgba(255,46,46,0.36)]" />

      <button
        type="button"
        onClick={handleSkip}
        className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-300 backdrop-blur transition duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-neonRed/60 sm:px-4 sm:py-2"
      >
        Skip / 跳过
      </button>

      <div
        className="intro-logo-stage relative mx-5 flex w-[min(88vw,58rem)] flex-col items-center justify-center gap-5 sm:gap-6"
        aria-label="GridDelta CN logo reveal"
      >
        <div className="absolute -inset-x-8 -inset-y-10 rounded-[3rem] border border-white/[0.035] bg-black/20 shadow-2xl shadow-black/70 backdrop-blur-[1px]" />
        <div className="intro-scan-line pointer-events-none absolute inset-y-[-20%] left-1/2 z-[4] w-16 -translate-x-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/28 to-transparent blur-[1px]" />

        <div className="relative z-[2] flex w-full justify-center">
          <svg
            className="intro-mark h-auto w-[min(46vw,19rem)] overflow-visible drop-shadow-[0_20px_48px_rgba(0,0,0,0.72)]"
            viewBox="0 0 360 210"
            role="img"
            aria-label="GridDelta icon and speed marks"
          >
            <defs>
              <linearGradient id="gdWhite" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="48%" stopColor="#f4f4f5" />
                <stop offset="100%" stopColor="#a1a1aa" />
              </linearGradient>
              <linearGradient id="gdRed" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#7f1d1d" />
                <stop offset="48%" stopColor="#ff2e2e" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <filter id="gdSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              className="intro-delta"
              d="M198 20 L324 184 H128 L154 144 H254 L186 59 L144 125 H101 L198 20Z"
              fill="none"
              stroke="url(#gdWhite)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="18"
            />
            <g className="intro-speed-marks" fill="url(#gdWhite)">
              <path d="M42 131h93l-13 16H31z" />
              <path d="M78 104h116l-15 16H66z" />
              <path d="M116 157h34l-11 16h-34z" />
              <path d="M51 157h43l-11 16H39z" />
              <path d="M164 157h45l-12 16h-44z" />
            </g>
            <g className="intro-red-marks" filter="url(#gdSoftGlow)" fill="url(#gdRed)">
              <path d="M96 74h151l-12 17H84z" />
              <circle cx="256" cy="82" r="4" />
              <circle cx="271" cy="82" r="4" />
              <circle cx="286" cy="82" r="4" />
              <circle cx="304" cy="82" r="8" />
            </g>
          </svg>
        </div>

        <div className="relative z-[2] flex items-end justify-center gap-3 text-center font-semibold leading-none tracking-[-0.075em] sm:gap-5">
          <span className="intro-wordmark text-[clamp(3.1rem,11vw,7.8rem)] text-zinc-100 drop-shadow-[0_16px_42px_rgba(0,0,0,0.8)]">
            GridDelta
          </span>
          <span className="intro-cn text-[clamp(3.1rem,11vw,7.8rem)] text-neonRed drop-shadow-[0_0_18px_rgba(255,46,46,0.20)]">
            CN
          </span>
        </div>
      </div>

      <style jsx>{`
        .intro-grid {
          animation: gridBreathe 5.6s ease-in-out both;
        }

        .intro-red-halo {
          opacity: 0;
          animation: redHalo 5.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .intro-energy-line {
          opacity: 0;
          transform-origin: center;
          animation: energyLine 5.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .intro-logo-stage {
          opacity: 0;
          transform: scale(1.035);
          filter: blur(14px);
          animation: logoStage 5.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .intro-scan-line {
          opacity: 0;
          animation: scanSweep 5.6s cubic-bezier(0.65, 0, 0.35, 1) both;
        }

        .intro-delta {
          stroke-dasharray: 720;
          stroke-dashoffset: 720;
          animation: deltaTrace 5.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .intro-speed-marks {
          opacity: 0;
          transform: translateX(-18px);
          animation: speedMarks 5.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .intro-red-marks {
          opacity: 0;
          transform: translateX(-10px);
          animation: redMarks 5.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .intro-wordmark {
          display: inline-block;
          opacity: 0;
          clip-path: inset(0 100% 0 0);
          transform: translateY(10px);
          animation: wordmarkReveal 5.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .intro-cn {
          display: inline-block;
          opacity: 0;
          clip-path: inset(0 0 0 100%);
          transform: translateX(12px);
          animation: cnReveal 5.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes gridBreathe {
          0%, 14% { opacity: 0.02; }
          46%, 76% { opacity: 0.07; }
          100% { opacity: 0; }
        }

        @keyframes redHalo {
          0%, 10% { opacity: 0; transform: translate(-50%, -50%) scale(0.82); }
          22% { opacity: 0.24; transform: translate(-50%, -50%) scale(1); }
          52% { opacity: 0.34; transform: translate(-50%, -50%) scale(1.08); }
          68% { opacity: 0.22; transform: translate(-50%, -50%) scale(1.02); }
          86%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }

        @keyframes energyLine {
          0% { opacity: 0; transform: translateX(-50%) scaleX(0.05); }
          14% { opacity: 1; transform: translateX(-50%) scaleX(1); }
          60% { opacity: 0.42; transform: translateX(-50%) scaleX(0.96); }
          82%, 100% { opacity: 0; transform: translateX(-50%) scaleX(0.66); }
        }

        @keyframes logoStage {
          0%, 14% { opacity: 0; transform: scale(1.035); filter: blur(14px); }
          24% { opacity: 1; transform: scale(1); filter: blur(0); }
          66% { opacity: 1; transform: scale(1); filter: blur(0); }
          82% { opacity: 1; transform: scale(0.992); filter: blur(0); }
          98%, 100% { opacity: 0; transform: scale(0.982); filter: blur(6px); }
        }

        @keyframes scanSweep {
          0%, 14% { opacity: 0; transform: translateX(-150%) rotate(12deg); }
          18% { opacity: 0.42; }
          46% { opacity: 0.22; transform: translateX(150%) rotate(12deg); }
          50% { opacity: 0; }
          67% { opacity: 0; transform: translateX(-140%) rotate(12deg); }
          78% { opacity: 0.3; transform: translateX(130%) rotate(12deg); }
          84%, 100% { opacity: 0; transform: translateX(150%) rotate(12deg); }
        }

        @keyframes deltaTrace {
          0%, 16% { opacity: 0; stroke-dashoffset: 720; filter: brightness(0.7); }
          26% { opacity: 1; stroke-dashoffset: 270; filter: brightness(0.92); }
          43%, 100% { opacity: 1; stroke-dashoffset: 0; filter: brightness(1.04); }
        }

        @keyframes speedMarks {
          0%, 16% { opacity: 0; transform: translateX(-18px); filter: brightness(0.7); }
          30% { opacity: 1; transform: translateX(0); filter: brightness(1.04); }
          100% { opacity: 1; transform: translateX(0); filter: brightness(1.04); }
        }

        @keyframes redMarks {
          0%, 22% { opacity: 0; transform: translateX(-10px); filter: brightness(0.9); }
          38% { opacity: 1; transform: translateX(0); filter: brightness(1.35); }
          55% { opacity: 0.88; filter: brightness(1.08); }
          100% { opacity: 0.82; transform: translateX(0); filter: brightness(1.05); }
        }

        @keyframes wordmarkReveal {
          0%, 30% { opacity: 0; clip-path: inset(0 100% 0 0); transform: translateY(10px); filter: brightness(0.82); }
          48% { opacity: 1; clip-path: inset(0 0 0 0); transform: translateY(0); filter: brightness(1); }
          100% { opacity: 1; clip-path: inset(0 0 0 0); transform: translateY(0); filter: brightness(1); }
        }

        @keyframes cnReveal {
          0%, 42% { opacity: 0; clip-path: inset(0 0 0 100%); transform: translateX(12px); filter: brightness(1); }
          54% { opacity: 1; clip-path: inset(0 0 0 0); transform: translateX(0); filter: brightness(1.45); }
          65% { opacity: 1; filter: brightness(1.12); }
          100% { opacity: 1; clip-path: inset(0 0 0 0); transform: translateX(0); filter: brightness(1.08); }
        }

        .intro-reduced .intro-grid,
        .intro-reduced .intro-red-halo,
        .intro-reduced .intro-energy-line,
        .intro-reduced .intro-logo-stage,
        .intro-reduced .intro-scan-line,
        .intro-reduced .intro-delta,
        .intro-reduced .intro-speed-marks,
        .intro-reduced .intro-red-marks,
        .intro-reduced .intro-wordmark,
        .intro-reduced .intro-cn {
          animation-duration: 700ms;
          animation-timing-function: ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .intro-grid,
          .intro-red-halo,
          .intro-energy-line,
          .intro-scan-line {
            animation: none;
            opacity: 0;
          }

          .intro-logo-stage,
          .intro-delta,
          .intro-speed-marks,
          .intro-red-marks,
          .intro-wordmark,
          .intro-cn {
            animation: none;
            opacity: 1;
            clip-path: none;
            transform: none;
            filter: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
