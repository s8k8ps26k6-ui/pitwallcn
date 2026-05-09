import Link from "next/link";
import { mockLiveTiming, mockRaceControl } from "@/lib/mockData";
import { getScheduleCalendar } from "@/lib/f1-service";


const driverStandings = [
  { name: "维斯塔潘", points: 110 },
  { name: "诺里斯", points: 97 },
  { name: "勒克莱尔", points: 86 }
];

const constructorStandings = [
  { name: "红牛", points: 176 },
  { name: "迈凯伦", points: 163 },
  { name: "法拉利", points: 154 }
];

export default async function Home() {
  const { nextRace, source } = await getScheduleCalendar();
  return (
    <main className="space-y-6">
      <section
        className="dashboard-hero reveal-up relative overflow-hidden rounded-2xl border border-zinc-800 bg-cover bg-center px-6 py-16 shadow-xl shadow-black/30"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/55 to-black/70" aria-hidden="true" />
        <div className="relative max-w-2xl space-y-3">
          <p className="text-sm tracking-wide text-zinc-300">图片由站长于上海大奖赛现场拍摄</p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Pitwall CN</h1>
          <h2 className="text-xl font-semibold text-neonAmber">非官方 F1 数据看板</h2>
          <p className="text-base text-zinc-100">面向中文车迷的 F1 实时计时、赛会控制与车手数据看板。</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/live" className="dashboard-chip">
              查看实时计时
            </Link>
            <Link href="/race-control" className="dashboard-chip">
              查看赛会控制
            </Link>
            <Link href="/schedule" className="dashboard-chip">
              查看完整赛历
            </Link>
            <Link href="/drivers/VER" className="dashboard-chip">
              进入车手详情
            </Link>
          </div>
        </div>
      </section>

      <section className="card dashboard-elevated reveal-up stagger-1 overflow-hidden p-0">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="min-h-56 bg-cover bg-center" style={{ backgroundImage: "url('/images/feature-ferrari.jpg')" }} aria-label="法拉利主题图" />
          <div className="space-y-3 p-5">
            <h2 className="text-xl font-semibold text-neonAmber">下一站赛事概览</h2>
            <p className="text-sm text-zinc-300">{nextRace.raceName} · {nextRace.circuitName}</p>
            <div className="text-sm text-zinc-200">
              <p>地区：{nextRace.country} · {nextRace.location}</p>
              <p>正赛倒计时目标：{new Date(nextRace.countdownTarget).toLocaleString("zh-CN", { hour12: false })}</p>
            </div>
            <p className="text-xs text-zinc-400">当前赛历数据来源：{source === "openf1" ? "OpenF1" : "Mock 兜底"}，页面样式与交互已按仪表盘布局准备。</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card dashboard-elevated reveal-up stagger-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-medium text-neonAmber">实时计时预览</h3>
            <span className="inline-flex items-center gap-2 text-xs text-zinc-300">
              <span className="live-pulse" aria-hidden="true" /> 实时追踪
            </span>
          </div>
          <ul className="space-y-2">
            {mockLiveTiming.slice(0, 3).map((row) => (
              <li key={row.driver} className="rounded-lg border border-zinc-800/90 bg-zinc-950/40 px-3 py-2 text-sm">
                <div className="flex items-center justify-between text-zinc-100">
                  <span>{row.position}. {row.driver}</span>
                  <span>{row.gap}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-zinc-400">
                  <span>{row.team}</span>
                  <span>上圈 {row.lastLap}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card dashboard-elevated reveal-up stagger-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-medium text-neonAmber">赛会控制预览</h3>
            <Link href="/race-control" className="text-xs text-zinc-300 hover:text-neonAmber">
              查看全部
            </Link>
          </div>
          <ul className="space-y-2">
            {mockRaceControl.slice(0, 3).map((msg) => (
              <li key={msg.id} className="rounded-lg border border-zinc-800/90 bg-zinc-950/40 px-3 py-2">
                <p className="text-xs text-zinc-400">{msg.timestamp} · {msg.category}</p>
                <p className="text-sm text-zinc-100">{msg.message}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="card dashboard-elevated reveal-up stagger-4">
          <h3 className="mb-3 text-lg font-medium text-neonAmber">车手积分榜（示例）</h3>
          <ul className="space-y-2 text-sm">
            {driverStandings.map((item, index) => (
              <li key={item.name} className="flex items-center justify-between rounded-lg border border-zinc-800/90 bg-zinc-950/40 px-3 py-2">
                <span>{index + 1}. {item.name}</span>
                <span className="font-semibold text-zinc-200">{item.points} 分</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card dashboard-elevated reveal-up stagger-5">
          <h3 className="mb-3 text-lg font-medium text-neonAmber">车队积分榜（示例）</h3>
          <ul className="space-y-2 text-sm">
            {constructorStandings.map((item, index) => (
              <li key={item.name} className="flex items-center justify-between rounded-lg border border-zinc-800/90 bg-zinc-950/40 px-3 py-2">
                <span>{index + 1}. {item.name}</span>
                <span className="font-semibold text-zinc-200">{item.points} 分</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
