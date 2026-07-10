import Image from "next/image";
import Link from "next/link";
import type { RaceWeekend } from "@/lib/types";

type CinematicHomepageProps = {
  nextRace: RaceWeekend;
  sourceLabel: string;
  dateRange: string;
};

const primaryModules = [
  {
    href: "/live",
    eyebrow: "Live timing",
    title: "实时计时",
    description: "比赛进行时，把位置、间隔和进站变化放在一张干净的时间轴里。",
    action: "进入实时数据",
  },
  {
    href: "/race-weekend",
    eyebrow: "Race weekend",
    title: "单站复盘",
    description: "从结果、赛会控制、圈速到天气，按比赛周末重新组织关键线索。",
    action: "查看比赛周末",
  },
  {
    href: "/standings",
    eyebrow: "Season overview",
    title: "赛季格局",
    description: "查看积分、车手与赛程，回到整个赛季的坐标系里理解一场比赛。",
    action: "查看积分榜",
  },
] as const;

const quickLinks = [
  { href: "/schedule", label: "完整赛程" },
  { href: "/drivers", label: "车手索引" },
  { href: "/results", label: "比赛结果" },
  { href: "/race-control", label: "赛会控制" },
  { href: "/lap-analysis", label: "圈速分析" },
  { href: "/weather", label: "赛道天气" },
] as const;

export function CinematicHomepage({
  nextRace,
  sourceLabel,
  dateRange,
}: CinematicHomepageProps) {
  return (
    <main className="pb-12 sm:pb-20">
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-zinc-950">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="一辆 F1 赛车驶过终点线"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[64%_center] opacity-65 sm:object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.98)_0%,rgba(9,9,11,0.88)_33%,rgba(9,9,11,0.42)_70%,rgba(9,9,11,0.7)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,9,11,0.92)_0%,transparent_48%)]" />
        </div>

        <div className="relative mx-auto grid min-h-[min(680px,calc(100svh-4rem))] max-w-7xl items-end gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-10 lg:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow text-zinc-400">GridDelta CN · F1 数据看板</p>
            <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl">
              看懂每一个
              <br />
              比赛周末。
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">
              面向中文车迷的非官方 F1 数据看板。实时计时、单站复盘与赛季信息，都从这里开始。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/live"
                className="inline-flex items-center justify-center bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                查看实时计时
              </Link>
              <Link
                href="/race-weekend"
                className="inline-flex items-center justify-center border border-white/30 bg-black/20 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10"
              >
                进入单站复盘
              </Link>
            </div>
          </div>

          <aside className="border-t border-white/25 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <p className="eyebrow text-zinc-400">下一站比赛</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
              {nextRace.raceName}
            </h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-3">
                <dt className="text-zinc-500">地点</dt>
                <dd className="text-right font-medium text-zinc-100">
                  {nextRace.country} · {nextRace.location}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-3">
                <dt className="text-zinc-500">赛道</dt>
                <dd className="max-w-[13rem] text-right font-medium text-zinc-100">{nextRace.circuitName}</dd>
              </div>
              <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-3">
                <dt className="text-zinc-500">日期</dt>
                <dd className="text-right font-medium text-zinc-100">{dateRange}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-zinc-500">赛历来源：{sourceLabel}</p>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16 lg:px-10">
        <div className="flex flex-col gap-3 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">比赛周末</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
              从数据进入比赛，而不是从装饰开始。
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-zinc-500">
            三个主要入口覆盖比赛进行时、单站回看和整个赛季的上下文。
          </p>
        </div>

        <div className="grid divide-y divide-zinc-800 border-b border-zinc-800 md:grid-cols-3 md:divide-x md:divide-y-0">
          {primaryModules.map((module, index) => (
            <Link
              key={module.href}
              href={module.href}
              className="group relative py-8 md:px-7 md:first:pl-0 md:last:pr-0"
            >
              <span className="font-mono text-xs text-zinc-600">0{index + 1}</span>
              <p className="mt-6 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {module.eyebrow}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white transition group-hover:text-zinc-300">
                {module.title}
              </h3>
              <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-400">{module.description}</p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-zinc-200">
                {module.action}
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16 lg:px-10">
        <div className="grid gap-8 border-t border-zinc-800 pt-7 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div>
            <p className="eyebrow">更多数据</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">按你想看的方式进入。</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              不把所有内容塞进首页。每个模块保留自己的信息密度和阅读节奏。
            </p>
          </div>
          <div className="grid grid-cols-2 border-l border-t border-zinc-800 sm:grid-cols-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-24 items-end justify-between border-b border-r border-zinc-800 px-4 py-4 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.035] hover:text-white"
              >
                {item.label}
                <span aria-hidden="true" className="text-zinc-600 transition group-hover:text-white">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
