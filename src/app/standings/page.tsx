import Link from "next/link";
import { BackNavigation } from "@/components/back-navigation";
import { getDriverStandings } from "@/lib/standings-service";

export default async function StandingsPage() {
  const standings = await getDriverStandings();
  const driverLeader = Math.max(standings.drivers[0]?.points ?? 1, 1);
  const constructorLeader = Math.max(standings.constructors[0]?.points ?? 1, 1);
  const isFallback = standings.source === "static-fallback";

  return <main className="mx-auto max-w-6xl space-y-7 px-0 pb-8 sm:px-0">
    <header className="border-b border-zinc-800/80 pb-6 sm:rounded-3xl sm:border sm:bg-black/20 sm:p-6 sm:shadow-xl sm:shadow-black/10">
      <BackNavigation className="mb-6 inline-flex min-h-10 items-center rounded-xl border border-zinc-700/70 bg-zinc-950/55 px-3 text-sm text-zinc-300 backdrop-blur transition hover:text-neonAmber" fallbackHref="/" fallbackLabel="返回主页" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Season standings</p><h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">积分榜</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">排名按可用赛季数据呈现；数据源状态会同时公开标示。</p></div>
        <span className={`w-fit text-xs font-semibold ${isFallback ? "text-zinc-500" : "text-neonAmber"}`}>{isFallback ? "等待已核验排名快照" : "赛季排名数据已更新"}</span>
      </div>
    </header>

    <section className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
      <section className="border-y border-zinc-800/80 py-1 sm:rounded-3xl sm:border sm:bg-black/20 sm:py-0">
        <header className="px-0 py-4 sm:px-5"><p className="eyebrow">Driver championship</p><h2 className="mt-1 text-lg font-semibold text-white">车手积分</h2></header>
        <div className="divide-y divide-zinc-900/90">
          {standings.drivers.map((driver) => {
            const width = Math.max(8, (driver.points / driverLeader) * 100);
            return <Link key={driver.code} className="group block px-0 py-4 transition hover:bg-white/[.025] sm:px-5" href={driver.href}>
              <div className="flex items-center gap-3"><span className="w-8 font-mono text-sm text-zinc-500">P{driver.position}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="font-mono text-xl font-bold text-white">{driver.code}</p><p className="truncate text-xs text-zinc-500">{driver.name} · {driver.team}</p></div><p className="font-mono text-lg font-bold text-neonAmber">{driver.points}</p></div><div className="mt-2 h-1 overflow-hidden bg-zinc-900"><div className="h-full bg-neonAmber/80 transition group-hover:bg-neonAmber" style={{ width: `${width}%` }} /></div></div></div>
            </Link>;
          })}
        </div>
      </section>
      <section className="border-y border-zinc-800/80 py-1 sm:rounded-3xl sm:border sm:bg-black/20 sm:py-0">
        <header className="px-0 py-4 sm:px-5"><p className="eyebrow">Constructor championship</p><h2 className="mt-1 text-lg font-semibold text-white">车队积分</h2></header>
        <div className="divide-y divide-zinc-900/90">
          {standings.constructors.map((team) => {
            const width = Math.max(8, (team.points / constructorLeader) * 100);
            return <article key={team.team} className="px-0 py-4 sm:px-5"><div className="flex items-start justify-between gap-3"><div><p className="race-code">P{team.position}</p><h3 className="mt-1 text-base font-semibold text-white">{team.team}</h3><p className="mt-1 text-xs text-zinc-500">{team.drivers.join(" / ")}</p></div><p className="font-mono text-xl font-bold text-neonAmber">{team.points}</p></div><div className="mt-3 h-1 overflow-hidden bg-zinc-900"><div className="h-full bg-gdCyan/80" style={{ width: `${width}%` }} /></div></article>;
          })}
        </div>
      </section>
    </section>
  </main>;
}
