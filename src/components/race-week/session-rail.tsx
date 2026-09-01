"use client";

import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type SessionRailProps = {
  children: ReactNode;
  focusIndex: number;
};

export function SessionRail({ children, focusIndex }: SessionRailProps) {
  const railRef = useRef<HTMLOListElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    const rail = railRef.current;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

    if (!rail) return;

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      rail.scrollTo({
        left: event.key === "Home" ? 0 : rail.scrollWidth,
        behavior,
      });
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      rail.scrollBy({
        left: event.key === "ArrowLeft" ? -rail.clientWidth / 2 : rail.clientWidth / 2,
        behavior,
      });
    }
  };

  useEffect(() => {
    const rail = railRef.current;
    const target = rail?.children.item(focusIndex) as HTMLElement | null;

    if (!rail || !target || rail.scrollWidth <= rail.clientWidth) return;

    const centeredLeft =
      target.offsetLeft - (rail.clientWidth - target.offsetWidth) / 2;

    rail.scrollTo({
      left: Math.max(0, centeredLeft),
      behavior: "auto",
    });
  }, [focusIndex]);

  return (
    <ol
      ref={railRef}
      tabIndex={0}
      aria-label="Race weekend session timeline"
      onKeyDown={handleKeyDown}
    >
      {children}
    </ol>
  );
}
