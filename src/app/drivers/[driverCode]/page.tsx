import Link from "next/link";
import { getDriverProfile } from "@/lib/drivers";

export default function DriverDetailPage({ params }: { params: { driverCode: string } }) {
  const driver = getDriverProfile(params.driverCode);

  const driverStats = [
    { label: "Number", value: driver.number, hint: "车号" },
    { label: "Team", value: driver.team, hint: "当前车队" },
    { label: "Points", value: driver.points, hint: "赛季积分" },
    { label: "Status", value: driver.status, hint: "积分榜位置" }
  ];

  const profileCards = [
    { label: "Season Role", value: "POINTS FIGHT", hint: "赛季定位" },
    { label: "Data Mode", value: "MOCK", hint: "当前数据源" },
    { label: "Profile", value: "ACTIVE", hint: "资料状态" }
  ];

  return (
    <main className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
          ← BACK TO HOME
        </Link>
        <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/drivers">
          ← DRIVER INDEX
        </Link>
      </div>

      <section className="motion-fade-up overflow-hidden rounded-2xl border border-zinc-800 bg-black/30 shadow-xl shadow-black/20">
        <div className="grid md:grid-cols-[1.05fr_0.95fr]">
          <div
            className="relative min-h-72 bg-cover bg-center"
            style={{ backgroundImage: `url('${driver.image}')` }}
            aria-label="车手视觉图"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/20 to-black/80" aria-hidden="true" />
            <div className="absolute bottom-4 left-4 rounded-full border border-pitGreen/60 bg-black/65 px-3 py-1 text-xs font-semibold text-pitGreen shadow-[0_0_24px_rgba(25,243,139,0.18)] backdrop-blur">
              DRIVER PROFILE · MOCK DATA
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-6 p-5 sm:p-6">
            <div>
              <p className="eyebrow">Driver Detail</p>
              <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">{driver.code}</h1>
              <p className="mt-2 text-lg font-semibold text-neonAmber">{driver.name}</p>
              <p className="mt-1 text-sm font-semibold text-zinc-300">{driver.team}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                当前展示 {driver.name} 的模拟赛季资料，包括车队、车号、积分与排名状态。单场圈速和分段数据已拆分到圈速分析页面。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {driverStats.map((item) => (
                <div key={item.label} className="rounded-xl border border-zinc-800 bg-black/25 p-3">
                  <p className="race-code">{item.label}</p>
                  <p className="mt-2 font-mono text-2xl font-bold text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {profileCards.map((item, index) => (
          <article key={item.label} className={`card motion-fade-up motion-delay-${index + 1}`}>
            <p className="eyebrow">{item.label}</p>
            <p className="mt-3 font-mono text-2xl font-bold text-white">{item.value}</p>
            <p className="mt-1 text-sm text-zinc-400">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="card motion-fade-up motion-delay-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Related Module</p>
            <h2 className="mt-1 text-lg font-semibold text-white">查看单场圈速表现</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">圈速、S1/S2/S3 分段和 stint 对比数据已拆分到独立分析页。</p>
          </div>
          <Link className="w-fit rounded-full border border-neonAmber/50 bg-neonAmber/10 px-4 py-2 text-sm font-semibold text-neonAmber transition hover:bg-neonAmber/20" href="/lap-analysis">
            打开圈速分析 →
          </Link>
        </div>
      </section>
    </main>
  );
}
