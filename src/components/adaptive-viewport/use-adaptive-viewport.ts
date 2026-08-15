"use client";

import { useEffect, useState } from "react";

export type AdaptiveLayout = "compact" | "wide" | "desktop";

export type AdaptiveViewportMetrics = {
  viewportWidth: number;
  viewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  dpr: number;
  aspectRatio: number;
  orientation: "portrait" | "landscape";
  layout: AdaptiveLayout;
  trackScale: number;
};

const DEFAULT_METRICS: AdaptiveViewportMetrics = {
  viewportWidth: 0,
  viewportHeight: 0,
  screenWidth: 0,
  screenHeight: 0,
  dpr: 1,
  aspectRatio: 1,
  orientation: "portrait",
  layout: "compact",
  trackScale: 1,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readViewport(): AdaptiveViewportMetrics {
  const visualViewport = window.visualViewport;
  const viewportWidth = Math.round(visualViewport?.width ?? window.innerWidth);
  const viewportHeight = Math.round(visualViewport?.height ?? window.innerHeight);
  const screenWidth = Math.round(window.screen.width);
  const screenHeight = Math.round(window.screen.height);
  const dpr = Number(window.devicePixelRatio.toFixed(2));
  const aspectRatio = viewportHeight > 0 ? viewportWidth / viewportHeight : 1;
  const orientation = viewportWidth >= viewportHeight ? "landscape" : "portrait";

  const layout: AdaptiveLayout =
    viewportWidth < 720 ? "compact" : viewportWidth < 1120 ? "wide" : "desktop";

  // Scale only the visual scene. Layout itself remains CSS/container-query driven.
  // 430x844 is a neutral phone reference, not a device template.
  const widthFactor = viewportWidth / 430;
  const heightFactor = viewportHeight / 844;
  const trackScale = clamp(Math.min(widthFactor, heightFactor), 0.78, 1.08);

  return {
    viewportWidth,
    viewportHeight,
    screenWidth,
    screenHeight,
    dpr,
    aspectRatio,
    orientation,
    layout,
    trackScale,
  };
}

export function useAdaptiveViewport() {
  const [metrics, setMetrics] = useState<AdaptiveViewportMetrics>(DEFAULT_METRICS);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setMetrics(readViewport()));
    };

    update();

    const visualViewport = window.visualViewport;
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update, { passive: true });
    visualViewport?.addEventListener("resize", update, { passive: true });
    visualViewport?.addEventListener("scroll", update, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      visualViewport?.removeEventListener("resize", update);
      visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  return metrics;
}
