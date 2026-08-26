"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { NavigationMemory } from "@/components/navigation-memory";
import { HomeBrandLink } from "@/components/home-brand-link";
import styles from "@/app/data-pages.module.css";

const navItems = [
  { label: "首页", href: "/" },
  { label: "赛程", href: "/schedule" },
  { label: "Live", href: "/live" },
  { label: "比赛结果", href: "/results" },
  { label: "赛会控制", href: "/race-control" },
  { label: "圈速分析", href: "/lap-analysis" },
  { label: "赛道天气", href: "/weather" },
  { label: "车手", href: "/drivers" },
  { label: "积分榜", href: "/standings" },
  { label: "单站复盘", href: "/race-weekend" },
  { label: "项目记录", href: "/project" },
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
      <div className={`gd-site-shell min-h-screen bg-gdBg text-gdText${isHomepage ? " gd-site-shell--home-dock" : ""}`}>
        <Suspense fallback={null}><NavigationMemory /></Suspense>
        {children}
      </div>
    );
  }

  const isActive = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <div className={styles.shell}>
      <Suspense fallback={null}><NavigationMemory /></Suspense>
      <header className={styles.mobileHeader} data-site-header>
        <HomeBrandLink className={styles.brand} ariaLabel="LAPMETRY 首页">
          <span className={styles.brandMark}>LM</span>
          <span>LAPMETRY</span>
        </HomeBrandLink>
        <Link className={styles.mobileLink} href="/project">ARCH. 2.0</Link>
      </header>

      <nav className={styles.mobileNav} aria-label="移动端主导航">
        {navItems.map((item) => (
          <Link
            aria-current={isActive(item.href) ? "page" : undefined}
            className={`${styles.mobileLink} ${isActive(item.href) ? styles.activeLink : ""}`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <aside className={styles.rail}>
        <HomeBrandLink className={styles.brand} ariaLabel="LAPMETRY 首页">
          <span className={styles.brandMark}>LM</span>
          <span>LAPMETRY</span>
        </HomeBrandLink>
        <nav className={styles.railNav} aria-label="主导航">
          {navItems.map((item, index) => (
            <Link
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`${styles.railLink} ${isActive(item.href) ? styles.activeLink : ""}`}
              href={item.href}
              key={item.href}
            >
              <span>{item.label}</span>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            </Link>
          ))}
        </nav>
        <p className={styles.railFooter}>F1 RACE DATA<br />SOURCE STATUS IS ALWAYS EXPLICIT</p>
      </aside>

      <div className={styles.frame}>{children}</div>
    </div>
  );
}
