import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";

const siteUrl = "https://pitwallcn-57ny.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GridDelta CN | F1 数据看板",
    template: "%s | GridDelta CN"
  },
  description: "GridDelta CN 是一个面向中文 F1 车迷的非官方数据看板，提供赛程、赛控、比赛结果、圈速分析和赛道天气等比赛周末数据入口。",
  keywords: ["F1", "Formula 1", "OpenF1", "GridDelta CN", "Grid Delta", "赛车数据", "赛会控制", "圈速分析", "比赛结果"],
  authors: [{ name: "GridDelta CN" }],
  creator: "GridDelta CN",
  publisher: "GridDelta CN",
  applicationName: "GridDelta CN",
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: "GridDelta CN | F1 数据看板",
    description: "面向中文 F1 车迷的非官方比赛周末数据看板。",
    url: siteUrl,
    siteName: "GridDelta CN",
    locale: "zh_CN",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "GridDelta CN | F1 数据看板",
    description: "面向中文 F1 车迷的非官方比赛周末数据看板。"
  },
  robots: {
    index: true,
    follow: true
  }
};

const navItems = [
  { label: "首页", href: "/" },
  { label: "赛程", href: "/schedule" },
  { label: "实时计时", href: "/live" },
  { label: "车手", href: "/drivers" },
  { label: "积分榜", href: "/standings" },
  { label: "单站复盘", href: "/race-weekend" }
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6">
          <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Link className="text-2xl font-bold tracking-wide text-neonRed transition hover:text-red-400" href="/">
                GridDelta CN
              </Link>
              <Link
                className="rounded-full border border-neonAmber/40 bg-neonAmber/10 px-3 py-1 text-xs font-bold tracking-[0.14em] text-neonAmber transition hover:border-neonAmber hover:bg-neonAmber/20"
                href="/project"
              >
                更新日志
              </Link>
            </div>
            <nav className="grid w-full grid-cols-4 gap-1.5 rounded-2xl border border-zinc-800/80 bg-black/20 p-1 text-center text-sm shadow-lg shadow-black/10 backdrop-blur lg:flex lg:w-fit lg:flex-wrap lg:text-left">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  className="rounded-xl border border-zinc-800/70 bg-zinc-950/20 px-2.5 py-2 text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white sm:px-3 lg:rounded-full lg:py-1.5"
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
