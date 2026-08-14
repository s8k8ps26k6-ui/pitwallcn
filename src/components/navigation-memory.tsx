"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type NavigationSnapshot = {
  href: string;
  scrollY: number;
  savedAt: number;
};

const sourceKey = (href: string) => `gd:navigation-source:${href}`;
const scrollKey = (href: string) => `gd:navigation-scroll:${href}`;

function currentHref() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function safeWrite(key: string, value: NavigationSnapshot) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing or a disabled storage policy should not break navigation.
  }
}

/**
 * Stores only in-session navigation context. It deliberately does not own
 * browser history; normal back/forward stays authoritative whenever available.
 */
export function NavigationMemory() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const restoreHref = `${pathname}${searchParams.size ? `?${searchParams}` : ""}`;
    let frameOne = 0;
    let frameTwo = 0;

    try {
      const raw = window.sessionStorage.getItem(scrollKey(restoreHref));
      if (!raw) return;
      const snapshot = JSON.parse(raw) as NavigationSnapshot;
      window.sessionStorage.removeItem(scrollKey(restoreHref));
      frameOne = window.requestAnimationFrame(() => {
        frameTwo = window.requestAnimationFrame(() => {
          window.scrollTo({ top: snapshot.scrollY, behavior: "instant" });
        });
      });
    } catch {
      // Scroll restoration is a progressive enhancement.
    }

    return () => {
      window.cancelAnimationFrame(frameOne);
      window.cancelAnimationFrame(frameTwo);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    const captureNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[href]")
        : null;
      if (!target || target.target || target.hasAttribute("download")) return;

      const destination = new URL(target.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const from = currentHref();
      const to = `${destination.pathname}${destination.search}${destination.hash}`;
      if (from === to) return;

      const snapshot: NavigationSnapshot = {
        href: from,
        scrollY: window.scrollY,
        savedAt: Date.now(),
      };
      safeWrite(sourceKey(to), snapshot);
      safeWrite(scrollKey(from), snapshot);
    };

    window.addEventListener("click", captureNavigation, true);
    return () => window.removeEventListener("click", captureNavigation, true);
  }, []);

  return null;
}

export function readNavigationSource(href: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(sourceKey(href));
    if (!raw) return null;
    const snapshot = JSON.parse(raw) as NavigationSnapshot;
    return snapshot.href.startsWith("/") ? snapshot : null;
  } catch {
    return null;
  }
}
