import Link from "next/link";
import { RaceCountdown } from "@/components/race-countdown";
import { ScheduleView } from "@/components/schedule-view";

export default function SchedulePage() {
  return (
    <main className="space-y-5">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>

      <section className="motion-fade-up overflow-hidden rounded-3xl border border-blue-500/20 bg-[#11182f] p-5 shadow-xl shadow-blue-950/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="race-code text-zinc-400">第 5 站 · 下一站</span>
              <span className="rounded-full border border-purple-400/40 bg-purple-500/20 px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.16em] text-purple-200">
                冲刺赛
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">加拿大大奖赛</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">🇨🇦 吉尔斯·维伦纽夫赛道 · 蒙特利尔</p>
            <p className="mt-2 font-mono text-sm text-zinc-400">2026.05.23 - 25</p>
          </div>
          <div className="hidden rounded-2xl border border-blue-400/30 bg-blue-500/10 px-5 py-8 text-blue-400 sm:block">
            <span className="text-5xl">⌁</span>
          </div>
        </div>

        <div className="mt-6">
          <RaceCountdown />
        </div>

        <Link className="mt-5 flex items-center justify-center rounded-2xl border border-blue-400/40 bg-blue-500/20 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/30" href="/lap-analysis">
          查看比赛数据分析 →
        </Link>
      </section>

      <ScheduleView />
    </main>
  );
}
