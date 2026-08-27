"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NavigationMemory } from "@/components/navigation-memory";
import { HomeBrandLink } from "@/components/home-brand-link";
import styles from "@/app/data-pages.module.css";
import type { EventTheme } from "@/lib/event-theme";

const navGroups = [
  {
    label: "比赛",
    items: [
      { label: "Live", href: "/live" },
      { label: "比赛结果", href: "/results" },
      { label: "赛会控制", href: "/race-control" },
      { label: "圈速分析", href: "/lap-analysis" },
      { label: "赛道天气", href: "/weather" },
    ],
  },
  {
    label: "赛季",
    items: [
      { label: "首页", href: "/" },
      { label: "赛程", href: "/schedule" },
      { label: "车手", href: "/drivers" },
      { label: "积分榜", href: "/standings" },
    ],
  },
  {
    label: "记录",
    items: [
      { label: "单站复盘", href: "/race-weekend" },
      { label: "项目记录", href: "/project" },
    ],
  },
] as const;

export function SiteShell({ children, dataTheme }: { children: React.ReactNode; dataTheme: EventTheme }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navAreaRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isHomepage = pathname === "/";
  const isImmersiveRoute =
    isHomepage ||
    pathname.startsWith("/atlas-v2") ||
    pathname.startsWith("/news") ||
    pathname.startsWith("/schedule") ||
    pathname.startsWith("/races/") ||
    pathname.startsWith("/preview/results-hallmark");

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener("keydown", closeOnEscape);
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (navAreaRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [menuOpen]);

  if (isImmersiveRoute) {
    return (
      <div className={`gd-site-shell min-h-screen bg-gdBg text-gdText${isHomepage ? " gd-site-shell--home-dock" : ""}`}>
        <Suspense fallback={null}><NavigationMemory /></Suspense>
        <div id="main-content" tabIndex={-1}>{children}</div>
      </div>
    );
  }

  const isActive = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);

  const shellStyle = {
    "--color-accent": dataTheme.accent,
    "--color-accent-soft": `rgb(${dataTheme.accentRgb} / 0.12)`,
    "--color-accent-ink": "#071016",
    "--event-accent-rgb": dataTheme.accentRgb,
    "--event-support": dataTheme.support,
  } as React.CSSProperties;

  return (
    <div className={styles.shell} style={shellStyle}>
      <Suspense fallback={null}><NavigationMemory /></Suspense>
      <div className={styles.navArea} ref={navAreaRef}>
        <header className={styles.mobileHeader} data-site-header>
          <HomeBrandLink className={styles.brand} ariaLabel="LAPMETRY 首页">
            <span translate="no">LAPMETRY</span>
          </HomeBrandLink>
          <div className={styles.mobileHeaderTools}>
            <button
              aria-controls="data-route-menu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "关闭导航" : "打开导航"}
              className={styles.menuToggle}
              onClick={() => setMenuOpen((open) => !open)}
              ref={menuButtonRef}
              type="button"
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </header>

        {menuOpen ? (
          <nav className={styles.mobileMenu} id="data-route-menu" aria-label="主导航">
            {navGroups.map((group) => (
              <section className={styles.navGroup} key={group.label} aria-label={group.label}>
                <p className={styles.navGroupLabel}>{group.label}</p>
                <div className={styles.navGroupLinks}>
                  {group.items.map((item) => (
                    <Link
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={`${styles.mobileLink} ${isActive(item.href) ? styles.activeLink : ""}`}
                      href={item.href}
                      key={item.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </nav>
        ) : null}
      </div>

      <div className={styles.frame} id="main-content" tabIndex={-1}>{children}</div>
    </div>
  );
}
