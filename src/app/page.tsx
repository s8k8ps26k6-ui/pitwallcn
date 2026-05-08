import Link from "next/link";
import { mockLiveTiming, mockRaceControl } from "@/lib/mockData";

const nextRaceStats = [
  { label: "比赛地", value: "上海国际赛车场" },
  { label: "赛道长度", value: "5.451 km" },
  { label: "比赛圈数", value: "56 圈" }
];

const standingsPreview = [
  { title: "车手积分榜", leader: "VER", detail: "168 pts", href: "/drivers/VER" },
  { title: "车队积分榜", leader: "Red Bull", detail: "287 pts", href: "/live" }
];

export default function Home() {
  const topDrivers = mockLiveTiming.slice(0, 3);
  const latestRaceControl = [...mockRaceControl].slice(-3).reverse();

  return (
    <main className="space-y-6">
      <section
        className="motion-fade-up relative overflow-hidden rounded-2xl border border-zinc-800 bg-cover bg-center px-6 py-16 shadow-xl shadow-black/30 sm:px-8 sm:py-20"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/55 to-black/75" aria-hidden="true" />
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-pitGreen/30 bg-pitGreen/10 px-3 py-1 text-xs font-medium text-pitGreen">
            <span className="live-dot" aria-hidden="true" />
            模拟数据在线 · 每 10 秒刷新预览
          </div>
          <p className="text-sm tracking-wide text-zinc-300">图片由站长于上海大奖赛现场拍摄</p>
          <h1 className="text-4xl font-bold text-white sm:text-6xl">Pitwall CN</h1>
          <h2 className="text-xl font-semibold text-neonAmber sm:text-2xl">非官方 F1 数据看板</h2>
          <p className="max-w-2xl text-base leading-7 text-zinc-100">
            面向中文车迷的 F1 实时计时、赛会控制与车手数据看板。先用 mock 数据打磨产品体验，后续再接入真实数据源。
          </p>
          <div className="flex flex-wrap gap-3 pt-2 text-sm">
            <Link className="rounded-full bg-neonRed px-4 py-2 font-semibold text-white transition hover:bg-red-500" href="/live">
              查看实时计时
            </Link>
            <Link className="rounded-full border border-zinc-600 px-4 py-2 text-zinc-100 transition hover:border-neonAmber hover:text-neonAmber" href="/race-control">
              赛会控制记录
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card motion-fade-up motion-delay-1 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Next Race</p>
              <h2 className="text-2xl font-semibold text-white">下一站比赛</h2>
            </div>
            <span className="rounded-full bg-neonAmber/15 px-3 py-1 text-xs font-medium text-neonAmber">周末总览</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {nextRaceStats.map((item) => (
              <div key={item.label} className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                <p className="text-xs text-zinc-500">{item.label}</p>
                <p className="mt-1 font-semibold text-zinc-100">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-300">
            首页先聚合比赛入口、实时计时摘要与赛会控制消息，让用户打开后第一眼就知道比赛状态。
          </p>
        </article>

        <article className="card motion-fade-up motion-delay-2 overflow-hidden p-0">
          <div
            className="min-h-56 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/feature-ferrari.jpg')" }}
            aria-label="法拉利主题图"
          />
          <div className="p-5">
            <p className="eyebrow">Trackside Visual</p>
            <h2 className="mb-2 text-xl font-semibold text-neonAmber">比赛周末总览</h2>
            <p className="text-sm leading-6 text-zinc-300">聚合展示实时计时、赛会控制与关键事件，当前为模拟数据展示。</p>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card motion-fade-up motion-delay-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">Live Timing</p>
              <h2 className="text-xl font-semibold">实时计时预览</h2>
            </div>
            <Link className="text-sm text-neonAmber hover:text-yellow-300" href="/live">完整表格 →</Link>
          </div>
          <div className="space-y-2">
            {topDrivers.map((row) => (
              <div key={row.driver} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/20 px-3 py-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-zinc-500">P{row.position}</span>
                  <span className="font-semibold text-white">{row.driver}</span>
                  <span className="hidden text-zinc-400 sm:inline">{row.team}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-neonAmber">{row.bestLap}</p>
                  <p className="text-xs text-zinc-500">{row.gap}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card motion-fade-up motion-delay-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">Race Control</p>
              <h2 className="text-xl font-semibold">赛会控制预览</h2>
            </div>
            <Link className="text-sm text-neonAmber hover:text-yellow-300" href="/race-control">全部消息 →</Link>
          </div>
          <ol className="space-y-3">
            {latestRaceControl.map((msg) => (
              <li key={msg.id} className="relative border-l border-zinc-800 pl-4">
                <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-neonRed shadow-[0_0_12px_rgba(255,46,46,0.7)]" />
                <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
                  <span>{msg.timestamp}</span>
                  <span>{msg.category}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-200">{msg.message}</p>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {standingsPreview.map((item, index) => (
          <Link key={item.title} className={`card motion-fade-up motion-delay-${index + 5} group block`} href={item.href}>
            <p className="eyebrow">Standings</p>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-lg font-medium text-neonAmber">{item.title}</h3>
              <span className="text-zinc-500 transition group-hover:text-zinc-200">→</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-white">{item.leader}</p>
            <p className="mt-1 text-sm text-zinc-400">当前领先 · {item.detail}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
