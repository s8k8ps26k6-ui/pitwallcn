import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pitwall CN",
  description: "Formula 1 data dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6">
          <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold tracking-wide text-neonRed">Pitwall CN</h1>
            <nav className="flex flex-wrap gap-2 text-sm">
              <Link className="rounded bg-zinc-800 px-3 py-1 hover:bg-zinc-700" href="/">首页</Link>
              <Link className="rounded bg-zinc-800 px-3 py-1 hover:bg-zinc-700" href="/live">实时计时</Link>
              <Link className="rounded bg-zinc-800 px-3 py-1 hover:bg-zinc-700" href="/race-control">赛会控制</Link>
              <Link className="rounded bg-zinc-800 px-3 py-1 hover:bg-zinc-700" href="/drivers/VER">车手</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
