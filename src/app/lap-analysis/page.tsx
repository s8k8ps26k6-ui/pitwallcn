import Link from "next/link";

const lapComparison = [
  { lap: 18, ver: "1:33.622", nor: "1:33.800", lec: "1:34.002", gap: "+0.380" },
  { lap: 19, ver: "1:33.918", nor: "1:34.004", lec: "1:34.223", gap: "+0.305" },
  { lap: 20, ver: "1:34.102", nor: "1:33.944", lec: "1:34.310", gap: "+0.158" },
  { lap: 21, ver: "1:34.028", nor: "1:33.876", lec: "1:34.188", gap: "+0.152" }
];

const sectorComparison = [
  { sector: "S1", ver: "31.204", nor: "31.180", lec: "31.331", best: "NOR" },
  { sector: "S2", ver: "39.882", nor: "39.944", lec: "40.080", best: "VER" },
  { sector: "S3", ver: "22.536", nor: "22.676", lec: "22.591", best: "VER" }
];

const stintCards = [
  { driver: "VER", compound: "MEDIUM", laps: "18", avg: "1:33.918", deg: "LOW" },
  { driver: "NOR", compound: "HARD", laps: "19", avg: "1:33.951", deg: "LOW" },
  { driver: "LEC", compound: "SOFT", laps: "14", avg: "1:34.181", deg: "MED" }
];

export default function LapAnalysisPage() {
  return (
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>

      <section className="motion-fade-up rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Lap Analysis</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">圈速分析</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              单独承载比赛中的圈速、分段、stint 与差距变化分析。页面已预留 OpenF1 接口位，比赛 session 有数据后可切换为真实圈速源。
            </p>
          </div>
          <div className="w-fit rounded-full border border-pitGreen/50 bg-black/60 px-3 py-1 text-xs font-semibold text-pitGreen shadow-[0_0_24px_rgba(25,243,139,0.14)]">
            SESSION ANALYSIS · API READY
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-black/20 p-4 text-sm leading-6 text-zinc-400">
        当前为演示样例数据。下一步将接入 OpenF1 的 laps / stints / position / intervals 数据，并在无 session 数据时显示“等待比赛数据”，不再使用 Mock 标签。
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {stintCards.map((item, index) => (
          <article key={item.driver} className={`card motion-fade-up motion-delay-${index + 1}`}>
            <div className="flex items-center justify-between">
              <p className="font-mono text-3xl font-bold text-white">{item.driver}</p>
              <span className="rounded-full border border-neonAmber/40 bg-neonAmber/10 px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.16em] text-neonAmber">
                {item.compound}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                <p className="race-code">Laps</p>
                <p className="mt-1 font-mono text-xl font-bold text-white">{item.laps}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                <p className="race-code">Avg</p>
                <p className="mt-1 font-mono text-lg font-bold text-white">{item.avg}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                <p className="race-code">Deg</p>
                <p className="mt-1 font-mono text-xl font-bold text-white">{item.deg}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card motion-fade-up motion-delay-4 overflow-hidden p-0">
          <div className="border-b border-zinc-800 bg-black/25 px-4 py-3">
            <p className="eyebrow">Lap Comparison</p>
            <h2 className="mt-1 text-lg font-semibold text-white">关键圈速对比</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950/60 text-xs uppercase tracking-[0.18em] text-zinc-500">
                <tr>
                  {['Lap', 'VER', 'NOR', 'LEC', 'Lead Gap'].map((title) => (
                    <th key={title} className="px-4 py-3">{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lapComparison.map((row) => (
                  <tr key={row.lap} className="border-b border-zinc-900 transition hover:bg-white/[0.03]">
                    <td className="px-4 py-4 font-mono text-zinc-500">L{row.lap}</td>
                    <td className="px-4 py-4 font-mono text-neonRed">{row.ver}</td>
                    <td className="px-4 py-4 font-mono text-orange-300">{row.nor}</td>
                    <td className="px-4 py-4 font-mono text-zinc-300">{row.lec}</td>
                    <td className="px-4 py-4 font-mono text-neonAmber">{row.gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card motion-fade-up motion-delay-5 overflow-hidden p-0">
          <div className="border-b border-zinc-800 bg-black/25 px-4 py-3">
            <p className="eyebrow">Sector Split</p>
            <h2 className="mt-1 text-lg font-semibold text-white">S1 / S2 / S3 分段对比</h2>
          </div>
          <div className="space-y-3 p-4">
            {sectorComparison.map((row) => (
              <article key={row.sector} className="rounded-xl border border-zinc-800 bg-black/25 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-2xl font-bold text-white">{row.sector}</p>
                  <span className="race-code">BEST · {row.best}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-zinc-950/70 p-2"><p className="text-zinc-500">VER</p><p className="mt-1 font-mono text-neonRed">{row.ver}</p></div>
                  <div className="rounded-lg bg-zinc-950/70 p-2"><p className="text-zinc-500">NOR</p><p className="mt-1 font-mono text-orange-300">{row.nor}</p></div>
                  <div className="rounded-lg bg-zinc-950/70 p-2"><p className="text-zinc-500">LEC</p><p className="mt-1 font-mono text-zinc-300">{row.lec}</p></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
