import { RaceWeekend } from "@/lib/types";
import { RaceCountdown } from "@/components/race-countdown";

function fmtRange(start: string, end: string) {
  return `${new Date(start).toLocaleDateString("zh-CN")} - ${new Date(end).toLocaleDateString("zh-CN")}`;
}

function fmtTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

export function ScheduleView({ schedule, nextRace, source }: { schedule: RaceWeekend[]; nextRace: RaceWeekend; source: "openf1" | "mock" }) {
  return (
    <main className="space-y-4">
      <section className="card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neonAmber">下一站：{nextRace.raceName}</h2>
          <span className="text-xs text-zinc-400">数据来源：{source === "openf1" ? "OpenF1" : "Mock"}</span>
        </div>
        <p className="text-sm text-zinc-300">{nextRace.country} · {nextRace.location} · {nextRace.circuitName}</p>
        <p className="mt-1 text-sm text-zinc-300">比赛周末：{fmtRange(nextRace.startDate, nextRace.endDate)}</p>
        <p className="mt-2 text-sm text-zinc-100">正赛倒计时：<RaceCountdown targetTime={nextRace.countdownTarget} /></p>
      </section>

      <section className="card">
        <h3 className="mb-3 text-lg font-medium">赛历与赛段</h3>
        <div className="space-y-3">
          {schedule.map((race) => (
            <article key={race.id} className="rounded-lg border border-zinc-800/90 bg-zinc-950/40 p-3">
              <h4 className="font-medium text-zinc-100">{race.raceName}</h4>
              <p className="text-xs text-zinc-400">{race.country} · {race.location} · {fmtRange(race.startDate, race.endDate)}</p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                {race.sessions.map((session) => (
                  <li key={`${race.id}-${session.name}-${session.startTime}`} className="flex justify-between gap-4">
                    <span>{session.name}</span>
                    <span>{fmtTime(session.startTime)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
