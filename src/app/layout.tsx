import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";

const siteUrl = "https://pitwallcn-57ny.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GridDelta CN | F1 数据看板",
    template: "%s | GridDelta CN",
  },
  description:
    "GridDelta CN 是一个面向中文 F1 车迷的非官方数据看板，提供赛程、赛控、比赛结果、圈速分析和赛道天气等比赛周末数据入口。",
  keywords: [
    "F1",
    "Formula 1",
    "OpenF1",
    "GridDelta CN",
    "Grid Delta",
    "赛车数据",
    "赛会控制",
    "圈速分析",
    "比赛结果",
  ],
  authors: [{ name: "GridDelta CN" }],
  creator: "GridDelta CN",
  publisher: "GridDelta CN",
  applicationName: "GridDelta CN",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "GridDelta CN | F1 数据看板",
    description: "面向中文 F1 车迷的非官方比赛周末数据看板。",
    url: siteUrl,
    siteName: "GridDelta CN",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "GridDelta CN | F1 数据看板",
    description: "面向中文 F1 车迷的非官方比赛周末数据看板。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const navItems = [
  { label: "首页", href: "/" },
  { label: "赛程", href: "/schedule" },
  { label: "实时计时", href: "/live" },
  { label: "车手", href: "/drivers" },
  { label: "积分榜", href: "/standings" },
  { label: "单站复盘", href: "/race-weekend" },
] as const;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="mx-auto min-h-screen max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
          <header
            data-site-header
            className="mb-5 rounded-[1.25rem] border border-zinc-800/80 bg-zinc-950/55 px-3 py-2.5 shadow-2xl shadow-black/20 backdrop-blur sm:mb-6 sm:rounded-[1.75rem] sm:py-3 md:px-4"
          >
            <div className="flex items-center justify-between gap-3">
              <Link
                className="group inline-flex items-center gap-2.5 py-0.5 sm:gap-3 sm:py-1"
                href="/"
                aria-label="GridDelta CN 首页"
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
              </Link>
              <Link
                className="shrink-0 rounded-full border border-zinc-800/70 bg-black/15 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.1em] text-zinc-500 transition hover:border-neonAmber/30 hover:bg-neonAmber/5 hover:text-neonAmber sm:px-3 sm:py-1.5 sm:text-xs"
                href="/project"
              >
                更新日志
              </Link>
            </div>
            <nav
              className="mt-2.5 grid grid-cols-3 gap-x-2 gap-y-1.5 border-t border-zinc-800/70 pt-2.5 text-xs sm:mt-3 sm:flex sm:gap-2 sm:pt-3 sm:text-sm"
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
        </div>
      </body>
    </html>
  );
}
