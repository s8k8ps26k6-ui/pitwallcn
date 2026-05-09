import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pitwall CN",
  description: "Formula 1 data dashboard"
};

const navItems = [
  { label: "首页", href: "/" },
  { label: "实时计时", href: "/live" },
  { label: "赛会控制", href: "/race-control" },
  { label: "车手", href: "/drivers" }
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6">
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link className="text-2xl font-bold tracking-wide text-neonRed transition hover:text-red-400" href="/">
              Pitwall CN
            </Link>
            <nav className="flex w-fit flex-wrap gap-1.5 rounded-full border border-zinc-800/80 bg-black/20 p-1 text-sm shadow-lg shadow-black/10 backdrop-blur">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  className="rounded-full px-3 py-1.5 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
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
