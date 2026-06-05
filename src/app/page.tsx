import Link from "next/link";
import { RaceCountdown } from "@/components/race-countdown";
import { getScheduleCalendar } from "@/lib/f1-service";

const primaryModules = [
  {
    label: "实时计时",
    href: "/live",
    description: "查看排名、差距、上一圈和进站状态。"
  },
  {
    label: "单站复盘",
    href: "/race-weekend",
    description: "集中回看结果、赛控、圈速和天气。"
  },
  {
    label: "赛程",
    href: "/schedule",
    description: "查看下一站与完整周末时间安排。"
  },
  {
    label: "积分榜",
    href: "/standings",
    description: "跟踪车手与车队赛季积分排名。"
  }
] as const;

const secondaryModules = [
  {
    label: "车手",
    href: "/drivers"
  },
  {
    label: "比赛结果",
    href: "/results"
  },
  {
    label: "赛会控制",
    href: "/race-control"
  },
  {
    label: "圈速分析",
    href: "/lap-analysis"
  },
  {
    label: "赛道天气",
    href: "/weather"
  }
] as const;

function formatDateRange(startIso: string, endIso: string) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai"
  });
  return `${formatter.format(new Date(startIso))} - ${formatter.format(new Date(endIso))}`;
}

function getScheduleSourceLabel(source: "local" | "local+openf1") {
  return source === "local+openf1" ? "Local calendar + OpenF1 sessions" : "Local official calendar";
}

export default async function Home() {
  const { nextRace, source } = await getScheduleCalendar();
  const sourceLabel = getScheduleSourceLabel(source);

  return (
    <main className="space-y-6">
      <section
        className="motion-fade-up relative overflow-hidden rounded-3xl border border-zinc-800 bg-cover bg-center px-6 py-16 sm:px-10 lg:px-12 lg:py-24"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/45" aria-hidden="true" />
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative max-w-2xl space-y-6">
          <p className="text-sm tracking-wide text-zinc-300">图片由站长于上海大奖赛现场拍摄</p>
          <div className="space-y-3">
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">GridDelta CN</h1>
            <p className="text-lg text-zinc-200 sm:text-xl">面向中文车迷的非官方 F1 数据产品。</p>
          </div>
          <p className="max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
            以赛程、实时计时、单站复盘和赛季积分为核心，减少干扰，让比赛数据更清晰。
          </p>
          <div className="flex flex-wrap gap-3 pt-2 text-sm">
            <Link className="rounded-full bg-neonRed px-5 py-2.5 font-semibold text-white transition hover:bg-red-600" href="/live">
              查看实时计时
            </Link>
            <Link className="rounded-full border border-zinc-700 bg-black/25 px-5 py-2.5 font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-white/5" href="/race-weekend">
              进入单站复盘
            </Link>
          </div>
        </div>
      </section>

      <section className="motion-fade-up motion-delay-1 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-4">
            <div>
              <p className="eyebrow text-zinc-500">下一站</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{nextRace.raceName}</h2>
            </div>
            <dl className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">地点</dt>
                <dd className="mt-2 leading-6">
                  {nextRace.country} · {nextRace.location}
                  <br />
                  {nextRace.circuitName}
                </dd>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">日期</dt>
                <dd className="mt-2 leading-6">{formatDateRange(nextRace.startDate, nextRace.endDate)}</dd>
                <dd className="mt-1 text-xs text-zinc-500">{sourceLabel}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
            <RaceCountdown targetIso={nextRace.countdownTarget} />
          </div>
        </div>
        <div className="mt-6 border-t border-zinc-800 pt-5">
          <Link className="text-sm font-semibold text-zinc-200 transition hover:text-neonRed" href="/schedule">
            查看完整赛事时间安排 →
          </Link>
        </div>
      </section>

      <section className="motion-fade-up motion-delay-2 rounded-3xl border border-zinc-800 bg-black/25 p-5 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-zinc-500">核心模块</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">比赛周末的主要入口</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">优先呈现最常用的数据路径，保持入口清晰、稳定、可扫描。</p>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {primaryModules.map((item) => (
            <Link
              key={item.href}
              className="group flex min-h-52 flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 transition hover:border-zinc-600 hover:bg-zinc-900/80"
              href={item.href}
            >
              <div>
                <h3 className="text-xl font-semibold text-white">{item.label}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.description}</p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-4 text-sm">
                <span className="font-semibold text-zinc-500">打开模块</span>
                <span className="text-zinc-500 transition group-hover:text-neonRed">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="motion-fade-up motion-delay-3 rounded-3xl border border-zinc-800 bg-zinc-950/55 p-5 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-zinc-500">更多数据</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">辅助分析入口</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">按需进入车手、赛果、赛控、圈速和天气页面。</p>
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {secondaryModules.map((item) => (
            <Link
              key={item.href}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black/20 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-600 hover:bg-white/5"
              href={item.href}
            >
              <span>{item.label}</span>
              <span className="text-zinc-600" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="motion-fade-up rounded-2xl border border-zinc-900 bg-black/20 px-5 py-6 text-sm text-zinc-500">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-zinc-300">GridDelta CN</p>
          <p>非官方项目 · 当前使用本地官方赛历 + OpenF1 辅助 · For Chinese F1 fans</p>
        </div>
      </footer>
    </main>
  );
}
