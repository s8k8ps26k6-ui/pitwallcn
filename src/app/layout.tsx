import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pitwall CN",
  description: "Formula 1 data dashboard"
};

const navItems = [
  { label: "首页", href: "/" },
  { label: "赛程", href: "/schedule" },
  { label: "实时计时", href: "/live" },
  { label: "赛会控制", href: "/race-control" },
  { label: "车手", href: "/drivers" },
  { label: "积分榜", href: "/standings" },
  { label: "比赛结果", href: "/results" },
  { label: "圈速分析", href: "/lap-analysis" }
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6">
          <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link className="text-2xl font-bold tracking-wide text-neonRed transition hover:text-red-400" href="/">
              Pitwall CN
            </Link>
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
