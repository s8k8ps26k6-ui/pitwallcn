"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { MobileRaceDock } from "@/components/mobile-race-dock";
import { NavigationMemory } from "@/components/navigation-memory";
import { HomeBrandLink } from "@/components/home-brand-link";

const navItems = [
  { label: "首页", href: "/" },
  { label: "赛程", href: "/schedule" },
  { label: "实时计时", href: "/live" },
  { label: "车手", href: "/drivers" },
  { label: "积分榜", href: "/standings" },
  { label: "单站复盘", href: "/race-weekend" },
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const isImmersiveRoute =
    isHomepage ||
    pathname.startsWith("/atlas-v2") ||
    pathname.startsWith("/news") ||
    pathname.startsWith("/schedule") ||
    pathname.startsWith("/races/");

  if (isImmersiveRoute) {
    return (
      <div className="gd-site-shell min-h-screen bg-gdBg text-gdText">
        <Suspense fallback={null}><NavigationMemory /></Suspense>
        {children}
        <MobileRaceDock />
      </div>
    );
  }

  return (
    <div className="gd-site-shell mx-auto min-h-screen max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
      <Suspense fallback={null}><NavigationMemory /></Suspense>
      <header
        data-site-header
        className="mb-5 border-b border-zinc-800/70 px-0 py-2.5 sm:mb-6 sm:rounded-[1.75rem] sm:border sm:bg-zinc-950/55 sm:px-3 sm:py-3 sm:shadow-2xl sm:shadow-black/20 sm:backdrop-blur md:px-4"
      >
        <div className="flex items-center justify-between gap-3">
          <HomeBrandLink
            className="group inline-flex items-center gap-2.5 py-0.5 sm:gap-3 sm:py-1"
            ariaLabel="GridDelta CN 首页"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neonRed/30 bg-neonRed/10 text-xs font-black tracking-tight text-neonRed shadow-inner shadow-red-950/40 sm:h-9 sm:w-9 sm:text-sm">
              GD
            </span>
            <span className="leading-none">
              <span className="block text-base font-bold tracking-wide text-white transition group-hover:text-neonRed sm:text-xl">
                GridDelta CN
              </span>
              <span className="mt-1 hidden text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-zinc-500 sm:block">
                F1 Data Pitwall
              </span>
            </span>
          </HomeBrandLink>
          <Link
            className="shrink-0 rounded-full border border-zinc-800/70 bg-black/15 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.1em] text-zinc-500 transition hover:border-neonAmber/30 hover:bg-neonAmber/5 hover:text-neonAmber sm:px-3 sm:py-1.5 sm:text-xs"
            href="/project"
          >
            更新日志
          </Link>
        </div>
        <nav
          className="mt-3 hidden border-t border-zinc-800/70 pt-3 text-sm sm:flex sm:gap-2"
          aria-label="主导航"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="rounded-lg px-1.5 py-1.5 text-center font-semibold text-zinc-400 transition hover:bg-white/[0.035] hover:text-zinc-100 sm:rounded-full sm:px-3.5 sm:py-2 sm:text-left sm:text-zinc-300 lg:px-4"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
      <MobileRaceDock />
    </div>
  );
}
