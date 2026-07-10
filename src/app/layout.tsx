import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

const siteUrl = "https://pitwallcn.vercel.app";

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
  description: "面向中文 F1 车迷的非官方比赛周末数据看板。",
  keywords: ["F1", "Formula 1", "OpenF1", "GridDelta CN", "赛车数据", "赛会控制", "圈速分析"],
  authors: [{ name: "GridDelta CN" }],
  creator: "GridDelta CN",
  publisher: "GridDelta CN",
  applicationName: "GridDelta CN",
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "GridDelta CN | F1 数据看板",
    description: "面向中文 F1 车迷的非官方比赛周末数据看板。",
    url: siteUrl,
    siteName: "GridDelta CN",
    locale: "zh_CN",
    type: "website",
  },
  twitter: { card: "summary", title: "GridDelta CN | F1 数据看板", description: "面向中文 F1 车迷的非官方比赛周末数据看板。" },
  robots: { index: true, follow: true },
};

const navItems = [
  { label: "赛程", href: "/schedule" },
  { label: "实时计时", href: "/live" },
  { label: "车手", href: "/drivers" },
  { label: "积分榜", href: "/standings" },
  { label: "单站复盘", href: "/race-weekend" },
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header data-site-header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-8 lg:px-10">
            <Link href="/" className="shrink-0 text-base font-semibold tracking-[-0.03em] text-white" aria-label="GridDelta CN 首页">
              GridDelta <span className="text-zinc-500">CN</span>
            </Link>
            <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap text-sm" aria-label="主导航">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="shrink-0 px-2.5 py-2 text-zinc-400 transition hover:text-white sm:px-3">
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link href="/project" className="hidden shrink-0 text-sm text-zinc-500 transition hover:text-zinc-200 sm:block">
              项目说明
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
