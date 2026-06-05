import Link from "next/link";
import { HomeIntroSequence } from "@/components/home-intro-sequence";
import { LivePulsePanel } from "@/components/live-pulse-panel";
import { RaceCountdown } from "@/components/race-countdown";
import { getScheduleCalendar } from "@/lib/f1-service";

const primaryModules = [
  {
    label: "实时计时",
    href: "/live",
    description: "查看排名、差距、上一圈和进站状态。",
  },
  {
    label: "单站复盘",
    href: "/race-weekend",
    description: "集中回看结果、赛控、圈速和天气。",
  },
  {
    label: "赛程",
    href: "/schedule",
    description: "查看下一站与完整周末时间安排。",
  },
  {
    label: "积分榜",
    href: "/standings",
    description: "跟踪车手与车队赛季积分排名。",
  },
] as const;

const secondaryModules = [
  {
    label: "车手",
    href: "/drivers",
  },
  {
    label: "比赛结果",
    href: "/results",
  },
  {
    label: "赛会控制",
    href: "/race-control",
  },
  {
    label: "圈速分析",
    href: "/lap-analysis",
  },
  {
    label: "赛道天气",
    href: "/weather",
  },
] as const;

function formatDateRange(startIso: string, endIso: string) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  });
  return `${formatter.format(new Date(startIso))} - ${formatter.format(new Date(endIso))}`;
}

function getScheduleSourceLabel(source: "local" | "local+openf1") {
  return source === "local+openf1"
    ? "Local calendar + OpenF1 sessions"
    : "Local official calendar";
}

export default async function Home() {
  const { nextRace, source } = await getScheduleCalendar();
  const sourceLabel = getScheduleSourceLabel(source);

  return (
    <main className="space-y-5 sm:space-y-6">
      <HomeIntroSequence />
      <section
        className="motion-fade-up relative overflow-hidden rounded-[1.5rem] border border-zinc-800/80 bg-cover bg-[center_42%] px-4 py-5 shadow-2xl shadow-black/30 sm:rounded-[2rem] sm:px-8 sm:py-10 lg:min-h-[560px] lg:px-12 lg:py-12"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/92 via-zinc-950/62 to-black/10"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"
          aria-hidden="true"
        />
        <div
          className="absolute inset-y-6 left-0 w-px bg-neonRed/70 sm:inset-y-8 sm:w-1 sm:bg-neonRed/85"
          aria-hidden="true"
        />
        <div className="relative flex min-h-[340px] flex-col justify-between gap-6 sm:min-h-[430px] sm:gap-10 lg:min-h-[470px]">
          <div className="max-w-2xl space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[0.68rem] font-semibold text-zinc-300 backdrop-blur sm:px-3 sm:py-1.5 sm:text-xs">
              <span
                className="h-1.5 w-1.5 rounded-full bg-neonRed"
                aria-hidden="true"
              />
              图片由站长于上海大奖赛现场拍摄
            </div>
            <div className="space-y-3 sm:space-y-4">
              <p className="eyebrow text-zinc-400">Premium F1 Data Product</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-white sm:text-7xl sm:tracking-[-0.06em] lg:text-8xl">
                GridDelta CN
              </h1>
              <p className="max-w-xl text-base leading-7 text-zinc-200 sm:text-xl sm:leading-8">
                面向中文车迷的非官方 F1 数据中枢。
              </p>
            </div>
            <p className="max-w-xl text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7">
              聚合赛程、实时计时、单站复盘与赛季积分，保留关键上下文，让比赛周末更清晰。
            </p>
            <div className="flex flex-col gap-2.5 pt-0.5 text-sm sm:flex-row sm:gap-3 sm:pt-1">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-neonRed px-4 py-2.5 font-bold text-white shadow-lg shadow-red-950/25 transition hover:bg-red-600 sm:px-5 sm:py-3"
                href="/live"
              >
                查看实时计时
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 font-semibold text-zinc-100 backdrop-blur transition hover:border-white/25 hover:bg-white/[0.09] sm:px-5 sm:py-3"
                href="/race-weekend"
              >
                进入单站复盘
              </Link>
            </div>
          </div>
          <div className="hidden max-w-2xl gap-2 border-t border-white/10 pt-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 sm:grid sm:grid-cols-3">
            <span>Live Timing</span>
            <span>Race Weekend</span>
            <span>Season Context</span>
          </div>
        </div>
      </section>

      <LivePulsePanel />

      <section className="motion-fade-up motion-delay-2 overflow-hidden rounded-[2rem] border border-zinc-800/80 bg-zinc-950/80 shadow-xl shadow-black/20">
        <div className="border-b border-zinc-800/80 bg-gradient-to-r from-neonRed/10 via-white/[0.03] to-transparent px-5 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-zinc-500">下一站</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {nextRace.raceName}
              </h2>
            </div>
            <Link
              className="text-sm font-semibold text-zinc-300 transition hover:text-neonRed"
              href="/schedule"
            >
              查看完整赛事时间安排 →
            </Link>
          </div>
        </div>
        <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
          <dl className="grid gap-px bg-zinc-800/80 sm:grid-cols-3">
            <div className="bg-zinc-950/85 p-5 sm:p-6">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                地点
              </dt>
              <dd className="mt-3 text-base font-semibold text-zinc-100">
                {nextRace.country} · {nextRace.location}
              </dd>
            </div>
            <div className="bg-zinc-950/85 p-5 sm:p-6">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                赛道
              </dt>
              <dd className="mt-3 text-base font-semibold leading-6 text-zinc-100">
                {nextRace.circuitName}
              </dd>
            </div>
            <div className="bg-zinc-950/85 p-5 sm:p-6">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                日期
              </dt>
              <dd className="mt-3 text-base font-semibold text-zinc-100">
                {formatDateRange(nextRace.startDate, nextRace.endDate)}
              </dd>
              <dd className="mt-2 text-xs text-zinc-500">{sourceLabel}</dd>
            </div>
          </dl>
          <div className="border-t border-zinc-800/80 bg-black/25 p-5 sm:p-6 lg:border-l lg:border-t-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              倒计时
            </p>
            <RaceCountdown targetIso={nextRace.countdownTarget} />
          </div>
        </div>
      </section>

      <section className="motion-fade-up motion-delay-3 rounded-[2rem] border border-zinc-800/80 bg-black/20 p-5 shadow-xl shadow-black/10 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-zinc-500">核心模块</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            比赛周末的主要入口
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            优先呈现最常用的数据路径，保持入口清晰、稳定、可扫描。
          </p>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {primaryModules.map((item) => (
            <Link
              key={item.href}
              className="group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-950/75 p-5 transition hover:border-zinc-600 hover:bg-zinc-950"
              href={item.href}
            >
              <span
                className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-neonRed/80 via-zinc-500/30 to-transparent"
                aria-hidden="true"
              />
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <span className="rounded-full border border-zinc-800 bg-black/25 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Module
                  </span>
                  <span
                    className="text-zinc-600 transition group-hover:text-neonRed"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-white">
                  {item.label}
                </h3>
                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  {item.description}
                </p>
              </div>
              <div className="mt-8 border-t border-zinc-800/80 pt-4 text-sm font-semibold text-zinc-300 transition group-hover:text-white">
                打开模块
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="motion-fade-up motion-delay-4 rounded-[2rem] border border-zinc-800/80 bg-zinc-950/55 p-5 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-zinc-500">更多数据</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            辅助分析入口
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            按需进入车手、赛果、赛控、圈速和天气页面。
          </p>
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {secondaryModules.map((item) => (
            <Link
              key={item.href}
              className="group flex min-h-20 items-center justify-between rounded-2xl border border-zinc-800/90 bg-black/20 px-4 py-4 text-sm font-semibold text-zinc-200 transition hover:border-zinc-600 hover:bg-white/[0.04]"
              href={item.href}
            >
              <span className="flex items-center gap-3">
                <span
                  className="h-7 w-px bg-gradient-to-b from-neonRed/70 to-zinc-700"
                  aria-hidden="true"
                />
                {item.label}
              </span>
              <span
                className="text-zinc-600 transition group-hover:text-zinc-300"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="motion-fade-up rounded-2xl border border-zinc-900 bg-black/20 px-5 py-6 text-sm text-zinc-500">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-zinc-300">GridDelta CN</p>
          <p>
            非官方项目 · 当前使用本地官方赛历 + OpenF1 辅助 · For Chinese F1
            fans
          </p>
        </div>
      </footer>
    </main>
  );
}
