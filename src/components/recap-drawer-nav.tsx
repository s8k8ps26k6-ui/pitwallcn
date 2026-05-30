"use client";

import Link from "next/link";
import type { UrlObject } from "url";
import { useState } from "react";

type RecapNavItem = {
  href: string | UrlObject;
  label: string;
  hint: string;
};

type RecapDrawerNavProps = {
  items: RecapNavItem[];
  currentLabel: string;
  currentHint: string;
};

export function RecapDrawerNav({ items, currentLabel, currentHint }: RecapDrawerNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-3 z-30 rounded-[1.6rem] border border-zinc-800 bg-zinc-950/90 p-2 shadow-xl shadow-black/30 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            aria-expanded={open}
            aria-label="打开复盘导航"
            className="flex h-11 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-black/35 px-4 text-sm font-bold text-zinc-100 transition hover:border-neonAmber hover:text-neonAmber"
            onClick={() => setOpen(true)}
            type="button"
          >
            Menu
          </button>
          <div className="min-w-0 flex-1 px-1">
            <p className="race-code truncate text-zinc-500">Recap Navigation</p>
            <p className="truncate text-sm font-semibold text-white">{currentLabel}</p>
            <p className="truncate text-xs text-zinc-500">{currentHint}</p>
          </div>
        </div>
      </div>

      <div className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button
          aria-label="关闭复盘导航遮罩"
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
          type="button"
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-[84vw] max-w-sm flex-col border-r border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl shadow-black/60 transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="race-code text-zinc-500">Navigator</p>
              <h2 className="mt-1 text-xl font-bold text-white">复盘导航</h2>
            </div>
            <button
              aria-label="关闭复盘导航"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-800 bg-black/30 text-lg text-zinc-300 transition hover:border-neonAmber hover:text-neonAmber"
              onClick={() => setOpen(false)}
              type="button"
            >
              X
            </button>
          </div>

          <div className="mb-4 rounded-2xl border border-zinc-800 bg-black/25 p-3">
            <p className="text-xs leading-5 text-zinc-500">当前赛段</p>
            <p className="mt-1 text-sm font-semibold text-white">{currentLabel}</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">{currentHint}</p>
          </div>

          <nav className="grid gap-2 overflow-y-auto pr-1">
            {items.map((item) => {
              const key = typeof item.href === "string" ? item.href : `${item.href.pathname ?? ""}-${item.label}`;
              const linkClass = "rounded-2xl border border-zinc-800 bg-black/25 px-4 py-3 transition hover:border-neonAmber/70 hover:bg-white/[0.04]";
              const content = (
                <>
                  <span className="block text-base font-semibold text-zinc-100">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-zinc-500">{item.hint}</span>
                </>
              );

              return typeof item.href === "string" ? (
                <a key={key} className={linkClass} href={item.href} onClick={() => setOpen(false)}>
                  {content}
                </a>
              ) : (
                <Link key={key} className={linkClass} href={item.href} onClick={() => setOpen(false)}>
                  {content}
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
    </>
  );
}
