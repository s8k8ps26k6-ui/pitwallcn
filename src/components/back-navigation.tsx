"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { readNavigationSource } from "./navigation-memory";

type BackNavigationProps = {
  fallbackHref: Route;
  fallbackLabel: string;
  className?: string;
};

/** A semantic back control: history first, contextual fallback only for deep links. */
export function BackNavigation({
  fallbackHref,
  fallbackLabel,
  className,
}: BackNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = `${pathname}${searchParams.size ? `?${searchParams}` : ""}`;
  const [hasSource, setHasSource] = useState(false);

  useEffect(() => {
    setHasSource(Boolean(readNavigationSource(current)));
  }, [current]);

  const handleBack = () => {
    const source = readNavigationSource(current);
    if (source && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  return (
    <button type="button" className={className} onClick={handleBack}>
      <span aria-hidden="true">←</span> {hasSource ? "返回上页" : fallbackLabel}
    </button>
  );
}
