"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function HomeSmoothScroll() {
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");

    if (reducedMotionQuery.matches || coarsePointerQuery.matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.86,
    });

    let frameId = 0;
    let isVisible = document.visibilityState === "visible";
    let isDisposed = false;
    let updateScrollTrigger = () => undefined;

    void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (!isDisposed) {
        updateScrollTrigger = () => {
          ScrollTrigger.update();
        };
      }
    });

    const handleLenisScroll = () => {
      updateScrollTrigger();
    };

    const tick = (time: number) => {
      if (isDisposed) return;
      if (isVisible) {
        lenis.raf(time);
      }
      frameId = window.requestAnimationFrame(tick);
    };

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
    };

    lenis.on("scroll", handleLenisScroll);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    frameId = window.requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      lenis.off("scroll", handleLenisScroll);
      lenis.destroy();
    };
  }, []);

  return null;
}
