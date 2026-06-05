"use client";

import { useEffect, useRef, useState } from "react";

const INTRO_SESSION_KEY = "griddelta-cn-home-intro-seen";
const EXIT_AFTER_MS = 1450;
const REMOVE_AFTER_MS = 1780;
const SAFETY_REMOVE_AFTER_MS = 2300;

const terminalLines = [
  "INITIALIZING F1 DATA PITWALL",
  "SYNCING RACE WEEKEND DATA",
  "LIGHTS OUT",
] as const;

function canUseReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function markIntroSeen() {
  try {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, "true");
  } catch {
    // Storage can be blocked in private or restricted contexts. The intro must
    // never prevent the homepage from becoming available.
  }
}

function hasSeenIntro() {
  try {
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function HomeIntroSequence() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (canUseReducedMotion() || hasSeenIntro()) {
      markIntroSeen();
      return;
    }

    markIntroSeen();
    setShouldRender(true);

    timersRef.current = [
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
    markIntroSeen();
    setIsExiting(true);
    window.setTimeout(() => setShouldRender(false), 220);
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-hidden bg-black text-white transition-opacity duration-300 ease-out ${
        isExiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-label="GridDelta CN homepage intro"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,46,46,0.10),transparent_34%),linear-gradient(135deg,rgba(24,24,27,0.82),rgba(0,0,0,0.96)_58%,rgba(24,24,27,0.78))]" />
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-neonRed/70 to-transparent" />
      <div className="absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-zinc-700/35 to-transparent" />
      <div className="absolute bottom-8 left-8 hidden text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-zinc-700 sm:block">
        Race weekend data system
      </div>

      <button
        type="button"
        onClick={handleSkip}
        className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-300 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white sm:right-6 sm:top-6"
      >
        跳过
      </button>

      <div className="relative mx-4 w-full max-w-3xl rounded-[1.75rem] border border-zinc-800/90 bg-zinc-950/88 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8">
        <div
          className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-neonRed/80 via-white/20 to-transparent"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <p className="text-[0.64rem] font-bold uppercase tracking-[0.28em] text-zinc-500">
              GridDelta CN
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Data Pitwall Online
            </h2>
          </div>
          <div className="hidden rounded-full border border-zinc-800 bg-black/35 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-zinc-500 sm:block">
            Pre-race
          </div>
        </div>

        <div className="py-7 sm:py-9">
          <div
            className="mx-auto grid max-w-xl grid-cols-5 gap-2.5 sm:gap-4"
            aria-label="Five F1 starting lights illuminating"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-zinc-800 bg-black/45 p-2.5 sm:p-3"
              >
                <span
                  className="intro-light block aspect-square rounded-full border border-red-500/20 bg-zinc-900"
                  style={{ animationDelay: `${220 + index * 170}ms` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2 border-t border-zinc-800/80 pt-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-zinc-500 sm:text-xs">
          {terminalLines.map((line, index) => (
            <p
              key={line}
              className="intro-copy flex items-center gap-2"
              style={{ animationDelay: `${260 + index * 320}ms` }}
            >
              <span className="h-1 w-1 rounded-full bg-neonRed/80" />
              <span>{line}</span>
            </p>
          ))}
        </div>
      </div>

      <style jsx>{`
        .intro-light {
          animation: lightSequence 1.05s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .intro-copy {
          animation: copySequence 0.46s ease-out both;
        }

        @keyframes lightSequence {
          0%,
          34% {
            background: rgb(24 24 27);
            box-shadow: none;
            opacity: 0.58;
          }
          45%,
          78% {
            background: #ff2e2e;
            box-shadow: 0 0 18px rgba(255, 46, 46, 0.22);
            opacity: 1;
          }
          100% {
            background: rgb(24 24 27);
            box-shadow: none;
            opacity: 0.35;
          }
        }

        @keyframes copySequence {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
