import Link from "next/link";

const scheduleItems = [
  { date: "5月23日 周六", title: "第一次自由练习赛", time: "00:30 - 01:30", type: "FP1", tone: "bg-neonAmber" },
  { date: "5月23日 周六", title: "冲刺排位赛", time: "04:30 - 05:30", type: "SQ", tone: "bg-purple-500" },
  { date: "5月24日 周日", title: "冲刺赛", time: "00:00 - 00:30", type: "Sprint", tone: "bg-purple-500" },
  { date: "5月24日 周日", title: "排位赛", time: "04:00 - 05:00", type: "Qualifying", tone: "bg-neonRed" },
  { date: "5月25日 周一", title: "正赛", time: "02:00 - 04:00", type: "Race", tone: "bg-pitGreen" }
] as const;

const countdown = [
  { value: "15", label: "天" },
  { value: "06", label: "小时" },
  { value: "25", label: "分钟" },
  { value: "53", label: "秒" }
] as const;

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

        <div className="mt-6 grid grid-cols-4 gap-2 rounded-2xl border border-zinc-800/80 bg-black/25 p-3 text-center">
          {countdown.map((item) => (
            <div key={item.label}>
              <p className="font-mono text-3xl font-bold text-blue-400 sm:text-4xl">{item.value}</p>
              <p className="mt-1 text-xs text-zinc-500">{item.label}</p>
            </div>
          ))}
        </div>

        <Link className="mt-5 flex items-center justify-center rounded-2xl border border-blue-400/40 bg-blue-500/20 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/30" href="/lap-analysis">
          查看比赛数据分析 →
        </Link>
      </section>

      <section className="motion-fade-up motion-delay-1 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Weekend Schedule</p>
            <h2 className="mt-1 text-2xl font-bold text-white">赛事时间安排</h2>
          </div>
          <div className="rounded-full border border-zinc-800 bg-black/30 p-1 text-xs">
            <span className="rounded-full bg-blue-500 px-3 py-1 font-semibold text-white">本地时间</span>
            <span className="px-3 py-1 text-zinc-500">赛道时间</span>
          </div>
        </div>

        <div className="space-y-3">
          {scheduleItems.map((item, index) => (
            <article key={`${item.title}-${item.time}`} className={`motion-fade-up motion-delay-${(index % 6) + 1} rounded-2xl border border-zinc-800 bg-[#11182f]/90 p-4 shadow-lg shadow-black/20`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${item.tone} shadow-[0_0_18px_rgba(59,130,246,0.4)]`} />
                  <div>
                    <p className="text-lg font-semibold text-white">{item.date}</p>
                    <p className="mt-1 text-sm text-zinc-400">{item.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-bold text-neonAmber">{item.time}</p>
                  <p className="mt-1 race-code">{item.type}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
