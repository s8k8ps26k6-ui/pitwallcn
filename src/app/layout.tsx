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
        <div className="mx-auto min-h-screen max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
          <header className="mb-6 rounded-[1.75rem] border border-zinc-800/80 bg-zinc-950/55 px-3 py-3 shadow-2xl shadow-black/20 backdrop-blur md:px-4">
            <div className="flex items-center justify-between gap-3">
              <Link
                className="group inline-flex items-center gap-3 py-1"
                href="/"
                aria-label="GridDelta CN 首页"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neonRed/35 bg-neonRed/10 text-sm font-black tracking-tight text-neonRed shadow-inner shadow-red-950/40">
                  GD
                </span>
                <span className="leading-none">
                  <span className="block text-lg font-bold tracking-wide text-white transition group-hover:text-neonRed sm:text-xl">
                    GridDelta CN
                  </span>
                  <span className="mt-1 hidden text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-zinc-500 sm:block">
                    F1 Data Pitwall
                  </span>
                </span>
              </Link>
              <Link
                className="shrink-0 rounded-full border border-zinc-800 bg-black/25 px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-zinc-400 transition hover:border-neonAmber/40 hover:bg-neonAmber/10 hover:text-neonAmber"
                href="/project"
              >
                更新日志
              </Link>
            </div>
            <nav
              className="mt-3 flex gap-2 overflow-x-auto border-t border-zinc-800/80 pt-3 text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="主导航"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  className="shrink-0 rounded-full border border-transparent px-3.5 py-2 font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-white/[0.04] hover:text-white lg:px-4"
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
