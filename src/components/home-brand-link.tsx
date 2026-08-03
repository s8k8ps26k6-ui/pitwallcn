"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function HomeBrandLink({ children, className, ariaLabel }: { children: ReactNode; className?: string; ariaLabel?: string }) {
  const pathname = usePathname();
  return <Link href="/" className={className} aria-label={ariaLabel} onClick={(event) => {
    if (pathname === "/") {
      event.preventDefault();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    }
  }}>{children}</Link>;
}
