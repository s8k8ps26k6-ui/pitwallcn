import Link from "next/link";
import { getDriverStandings } from "@/lib/standings-service";

export default async function StandingsPage() {
  const standings = await getDriverStandings();
  const leaderPoints = Math.max(standings.drivers[0]?.points ?? 1, 1);
  const constructorLeaderPoints = Math.max(standings.constructors[0]?.points ?? 1, 1);
  const statusBadge = standings.source === "static-fallback" ? "STATIC FALLBACK" : "API READY";

  return (
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>

      <section className="motion-fade-up rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Standings</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">积分榜</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              展示当前静态回退数据的车手积分榜与车队积分榜。这里负责赛季排名，不承载单场圈速分析。
            </p>
          </div>
          <div className="w-fit rounded-full border border-neonAmber/50 bg-black/60 px-3 py-1 text-xs font-semibold text-neonAmber shadow-[0_0_24px_rgba(255,176,32,0.14)]">
            SEASON TABLE · {statusBadge}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card motion-fade-up motion-delay-1 overflow-hidden p-0">
          <div className="border-b border-zinc-800 bg-black/25 px-4 py-3">
            <p className="eyebrow">Driver Championship</p>
            <h2 className="mt-1 text-lg font-semibold text-white">车手积分榜</h2>
          </div>
          <div className="divide-y divide-zinc-900">
            {standings.drivers.map((driver) => {
              const percentage = Math.max(8, (driver.points / leaderPoints) * 100);

              return (
                <Link key={driver.code} className="group block px-4 py-3 transition hover:bg-white/[0.03]" href={driver.href}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 font-mono text-sm text-zinc-500">P{driver.position}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-xl font-bold text-white">{driver.code}</p>
                          <p className="truncate text-xs text-zinc-500">{driver.name} · {driver.team}</p>
                        </div>
                        <p className="font-mono text-lg font-bold text-neonAmber">{driver.points}</p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                        <div className="h-full rounded-full bg-neonRed transition group-hover:bg-neonAmber" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="card motion-fade-up motion-delay-2 overflow-hidden p-0">
          <div className="border-b border-zinc-800 bg-black/25 px-4 py-3">
            <p className="eyebrow">Constructor Championship</p>
            <h2 className="mt-1 text-lg font-semibold text-white">车队积分榜</h2>
          </div>
          <div className="divide-y divide-zinc-900">
            {standings.constructors.map((team) => {
              const percentage = Math.max(8, (team.points / constructorLeaderPoints) * 100);

              return (
                <article key={team.team} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="race-code">P{team.position}</p>
                      <h3 className="mt-1 text-base font-semibold text-white">{team.team}</h3>
                      <p className="mt-1 text-xs text-zinc-500">{team.drivers.join(" / ")}</p>
                    </div>
                    <p className="font-mono text-xl font-bold text-neonAmber">{team.points}</p>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                    <div className="h-full rounded-full bg-pitGreen" style={{ width: `${percentage}%` }} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
