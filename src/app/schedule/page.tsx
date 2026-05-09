import Link from "next/link";
import { RaceCountdown } from "@/components/race-countdown";
import { ScheduleView } from "@/components/schedule-view";
import { getScheduleCalendar } from "@/lib/f1-service";

function formatDateRange(startIso: string, endIso: string) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai"
  });
  return `${formatter.format(new Date(startIso))} - ${formatter.format(new Date(endIso))}`;
}

export default async function SchedulePage() {
  const { nextRace, source } = await getScheduleCalendar();

  return (
    <main className="space-y-5">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>

      <section className="motion-fade-up overflow-hidden rounded-3xl border border-blue-500/20 bg-[#11182f] p-5 shadow-xl shadow-blue-950/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="race-code text-zinc-400">下一站 · {source === "openf1" ? "OpenF1" : "Mock"}</span>
              <span className="rounded-full border border-purple-400/40 bg-purple-500/20 px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.16em] text-purple-200">
                Race Weekend
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{nextRace.raceName}</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{nextRace.country} · {nextRace.circuitName} · {nextRace.location}</p>
            <p className="mt-2 font-mono text-sm text-zinc-400">{formatDateRange(nextRace.startDate, nextRace.endDate)}</p>
          </div>
          <div className="hidden rounded-2xl border border-blue-400/30 bg-blue-500/10 px-5 py-8 text-blue-400 sm:block">
            <span className="text-5xl">⌁</span>
          </div>
        </div>

        <div className="mt-6">
          <RaceCountdown targetIso={nextRace.countdownTarget} />
        </div>

        <Link className="mt-5 flex items-center justify-center rounded-2xl border border-blue-400/40 bg-blue-500/20 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/30" href="/lap-analysis">
          查看比赛数据分析 →
        </Link>
      </section>

      <ScheduleView race={nextRace} />
    </main>
  );
}
