"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const INTRO_SESSION_KEY = "griddelta-cn-home-intro-last-played";
const INTRO_COOLDOWN_MS = 10 * 60 * 1000;
const SAFETY_REMOVE_AFTER_MS = 8000;
const SKIP_REMOVE_AFTER_MS = 260;

type IntroState = "checking" | "playing" | "exiting" | "hidden";

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
  const [introState, setIntroState] = useState<IntroState>("checking");
  const [timelineReady, setTimelineReady] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null);
  const exitTweenRef = useRef<ReturnType<typeof gsap.to> | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const prefersReducedMotion = canUseReducedMotion();

    setIsReducedMotion(prefersReducedMotion);

    if (!shouldPlayIntro()) {
      setIntroState("hidden");
      return;
    }

    markIntroPlayed();
    setIntroState("playing");
    setTimelineReady(true);
  }, []);

  useEffect(() => {
    if (!timelineReady || !overlayRef.current) {
      return;
    }

    const overlay = overlayRef.current;
    const context = gsap.context(() => {
      const q = gsap.utils.selector(overlay);
      const grid = q(".intro-grid");
      const halo = q(".intro-red-halo");
      const energyLine = q(".intro-energy-line");
      const logoStage = q(".intro-logo-stage");
      const scanLine = q(".intro-scan-line");
      const delta = q(".intro-delta");
      const speedMarks = q(".intro-speed-marks path");
      const redMarks = q(".intro-red-marks path, .intro-red-marks circle");
      const wordmark = q(".intro-wordmark");
      const cn = q(".intro-cn");
      const skip = q(".intro-skip");

      gsap.set(overlay, { opacity: 1 });
      gsap.set(skip, { autoAlpha: 0, y: -4 });
      gsap.set(grid, { opacity: 0.02 });
      gsap.set(halo, { autoAlpha: 0, scale: 0.86 });
      gsap.set(energyLine, { autoAlpha: 0, scaleX: 0.08, transformOrigin: "50% 50%" });
      gsap.set(logoStage, { autoAlpha: 0, filter: "blur(14px)", scale: 1.035 });
      gsap.set(scanLine, { autoAlpha: 0, xPercent: -170 });
      gsap.set(delta, { autoAlpha: 0, strokeDasharray: 720, strokeDashoffset: 720 });
      gsap.set(speedMarks, { autoAlpha: 0, x: -22 });
      gsap.set(redMarks, { autoAlpha: 0, x: -12 });
      gsap.set(wordmark, {
        autoAlpha: 0,
        clipPath: "inset(0% 100% 0% 0%)",
        filter: "brightness(0.82)",
        y: 10,
      });
      gsap.set(cn, {
        autoAlpha: 0,
        clipPath: "inset(0% 0% 0% 100%)",
        filter: "brightness(1)",
        x: 12,
      });

      if (isReducedMotion) {
        timelineRef.current = gsap
          .timeline({
            onComplete: () => {
              setIntroState("hidden");
              setTimelineReady(false);
            },
          })
          .set([logoStage, delta, speedMarks, redMarks, wordmark, cn], {
            autoAlpha: 1,
            clearProps: "clipPath,filter,strokeDashoffset,transform",
          })
          .to(skip, { autoAlpha: 1, y: 0, duration: 0.16, ease: "power2.out" }, 0)
          .to({}, { duration: 0.62 })
          .add(() => setIntroState("exiting"))
          .to(overlay, { opacity: 0, duration: 0.22, ease: "power2.inOut" });

        return;
      }

      timelineRef.current = gsap
        .timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            setIntroState("hidden");
            setTimelineReady(false);
          },
        })
        .to(skip, { autoAlpha: 1, y: 0, duration: 0.42, ease: "power2.out" }, 0.2)
        .to(grid, { opacity: 0.075, duration: 1.2, ease: "sine.inOut" }, 0)
        .to(halo, { autoAlpha: 0.26, scale: 1, duration: 0.72, ease: "expo.out" }, 0.08)
        .to(
          energyLine,
          { autoAlpha: 1, scaleX: 1, duration: 0.72, ease: "expo.out" },
          0.12,
        )
        .to(
          logoStage,
          { autoAlpha: 1, filter: "blur(0px)", scale: 1, duration: 0.82, ease: "expo.out" },
          0.28,
        )
        .to(
          delta,
          { autoAlpha: 1, strokeDashoffset: 0, duration: 1.36, ease: "power2.inOut" },
          0.42,
        )
        .to(
          speedMarks,
          { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.045, ease: "expo.out" },
          0.92,
        )
        .to(
          redMarks,
          { autoAlpha: 1, filter: "brightness(1.35)", x: 0, duration: 0.64, stagger: 0.025 },
          1.16,
        )
        .to(
          wordmark,
          {
            autoAlpha: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            filter: "brightness(1)",
            y: 0,
            duration: 0.84,
            ease: "expo.out",
          },
          1.42,
        )
        .to(
          cn,
          {
            autoAlpha: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            filter: "brightness(1.42)",
            x: 0,
            duration: 0.58,
            ease: "expo.out",
          },
          1.84,
        )
        .to(scanLine, { autoAlpha: 0.34, xPercent: 145, duration: 0.78, ease: "power2.inOut" }, 0.9)
        .to(scanLine, { autoAlpha: 0, duration: 0.18, ease: "power1.out" }, 1.68)
        .to(scanLine, { autoAlpha: 0.28, xPercent: 132, duration: 0.56, ease: "power2.inOut" }, 2.78)
        .to(scanLine, { autoAlpha: 0, duration: 0.18, ease: "power1.out" }, 3.34)
        .to(halo, { autoAlpha: 0.34, scale: 1.08, duration: 1.5, ease: "sine.inOut" }, 1.3)
        .to(energyLine, { autoAlpha: 0.38, duration: 2.2, ease: "sine.inOut" }, 0.9)
        .to(redMarks, { filter: "brightness(1.08)", duration: 1.2, ease: "sine.inOut" }, 2.3)
        .to(logoStage, { scale: 0.995, duration: 1.6, ease: "sine.inOut" }, 2.72)
        .to(grid, { opacity: 0, duration: 0.7, ease: "sine.inOut" }, 4.1)
        .to(halo, { autoAlpha: 0, scale: 0.92, duration: 0.62, ease: "power2.inOut" }, 4.18)
        .to(energyLine, { autoAlpha: 0, scaleX: 0.68, duration: 0.52, ease: "power2.inOut" }, 4.2)
        .add(() => setIntroState("exiting"), 4.45)
        .to(overlay, { opacity: 0, duration: 0.58, ease: "power2.inOut" }, 4.45);
    }, overlay);

    timersRef.current = [
      window.setTimeout(() => {
        setIntroState("hidden");
        setTimelineReady(false);
      }, SAFETY_REMOVE_AFTER_MS),
    ];

    return () => {
      context.revert();
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, [timelineReady, isReducedMotion]);

  useEffect(() => {
    return () => {
      timelineRef.current?.kill();
      exitTweenRef.current?.kill();
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  function handleSkip() {
    markIntroPlayed();
    timelineRef.current?.kill();
    exitTweenRef.current?.kill();
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];

    setIntroState("exiting");

    if (!overlayRef.current) {
      setIntroState("hidden");
      return;
    }

    exitTweenRef.current = gsap.to(overlayRef.current, {
      opacity: 0,
      duration: isReducedMotion ? 0.12 : 0.22,
      ease: "power2.inOut",
      onComplete: () => {
        setIntroState("hidden");
        setTimelineReady(false);
      },
    });

    timersRef.current = [
      window.setTimeout(() => {
        setIntroState("hidden");
        setTimelineReady(false);
      }, SKIP_REMOVE_AFTER_MS),
    ];
  }

  if (introState === "hidden") {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex h-[100dvh] min-h-[100vh] min-h-[100dvh] w-screen w-[100vw] touch-none items-center justify-center overflow-hidden bg-black text-white [box-sizing:border-box] [padding-bottom:env(safe-area-inset-bottom)] [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)] [padding-top:env(safe-area-inset-top)]"
      data-intro-state={introState}
      role="dialog"
      aria-label="GridDelta CN homepage intro"
      aria-modal="true"
      aria-busy={introState === "checking"}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,46,46,0.12),transparent_30%),radial-gradient(circle_at_50%_0%,rgba(113,113,122,0.11),transparent_42%),linear-gradient(135deg,rgba(9,9,11,1),rgba(0,0,0,1)_58%,rgba(24,24,27,0.94))]" />
      <div
        className="intro-grid absolute inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:42px_42px]"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-zinc-900/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent" />
      <div className="intro-red-halo absolute left-1/2 top-1/2 h-56 w-[min(86vw,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neonRed/20 opacity-0 blur-3xl" />
      <div className="intro-energy-line absolute left-1/2 top-1/2 h-px w-[min(82vw,50rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-neonRed to-transparent opacity-0 shadow-[0_0_22px_rgba(255,46,46,0.36)]" />

      <button
        type="button"
        onClick={handleSkip}
        className="intro-skip absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-300 opacity-0 backdrop-blur transition duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-neonRed/60 sm:px-4 sm:py-2"
      >
        Skip / 跳过
      </button>

      <div
        className="intro-logo-stage relative mx-5 flex w-[min(88vw,58rem)] scale-[1.035] flex-col items-center justify-center gap-5 opacity-0 blur-[14px] sm:gap-6"
        aria-label="GridDelta CN logo reveal"
      >
        <div className="absolute -inset-x-8 -inset-y-10 rounded-[3rem] border border-white/[0.035] bg-black/20 shadow-2xl shadow-black/70 backdrop-blur-[1px]" />
        <div className="intro-scan-line pointer-events-none absolute inset-y-[-20%] left-1/2 z-[4] w-16 -translate-x-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/28 to-transparent opacity-0 blur-[1px]" />

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

        <div className="relative z-[2] flex items-end justify-center gap-2 text-center font-semibold leading-none tracking-[-0.075em] sm:gap-5">
          <span className="intro-wordmark inline-block text-[clamp(2.25rem,11vw,7.8rem)] text-zinc-100 opacity-0 drop-shadow-[0_16px_42px_rgba(0,0,0,0.8)]">
            GridDelta
          </span>
          <span className="intro-cn inline-block text-[clamp(2.25rem,11vw,7.8rem)] text-neonRed opacity-0 drop-shadow-[0_0_18px_rgba(255,46,46,0.20)]">
            CN
          </span>
        </div>
      </div>

      <style jsx>{`
        .intro-speed-marks path,
        .intro-red-marks path,
        .intro-red-marks circle {
          transform-box: fill-box;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}
