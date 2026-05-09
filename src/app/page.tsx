import Link from "next/link";

const primaryModules = [
  {
    code: "LIVE TIMING",
    title: "实时计时",
    description: "查看车手排名、差距、上一圈、最快圈与进站状态。",
    href: "/live",
    status: "AUTO REFRESH",
    accent: "border-pitGreen/40 bg-pitGreen/10 text-pitGreen"
  },
  {
    code: "RACE CONTROL",
    title: "赛会控制",
    description: "集中查看旗语、安全车、事故记录与比赛控制消息。",
    href: "/race-control",
    status: "MESSAGE LOG",
    accent: "border-neonAmber/40 bg-neonAmber/10 text-neonAmber"
  },
  {
    code: "DRIVER DATA",
    title: "车手数据",
    description: "进入车手选择页，选择不同车手查看资料卡、圈速走势与分段速度。",
    href: "/drivers",
    status: "DRIVER INDEX",
    accent: "border-neonRed/40 bg-neonRed/10 text-neonRed"
  }
] as const;

export default function Home() {
  return (
    <main className="space-y-6">
      <section
        className="motion-fade-up relative overflow-hidden rounded-2xl border border-zinc-800 bg-cover bg-center px-6 py-12 shadow-xl shadow-black/30 sm:px-8 sm:py-16"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/94 via-black/76 to-black/92" aria-hidden="true" />
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-pitGreen/60 bg-black/65 px-3 py-1 text-xs font-semibold text-pitGreen shadow-[0_0_24px_rgba(25,243,139,0.18)] backdrop-blur">
            <span className="live-dot" aria-hidden="true" />
            主控台在线 · Mock data feed
          </div>
          <p className="text-sm tracking-wide text-zinc-300">图片由站长于上海大奖赛现场拍摄</p>
          <h1 className="text-4xl font-bold text-white sm:text-6xl">Pitwall CN</h1>
          <h2 className="text-xl font-semibold text-neonAmber sm:text-2xl">非官方 F1 数据看板</h2>
          <p className="max-w-2xl text-base leading-7 text-zinc-100">
            一个面向中文车迷的 F1 数据主控台。首页只保留核心入口，实时计时、赛会控制与车手数据分别进入独立页面查看。
          </p>
          <div className="flex flex-wrap gap-3 pt-2 text-sm">
            <Link className="rounded-full bg-neonRed px-4 py-2 font-semibold text-white transition hover:bg-red-500" href="/live">
              进入实时计时
            </Link>
            <Link className="rounded-full border border-zinc-600 px-4 py-2 text-zinc-100 transition hover:border-neonAmber hover:text-neonAmber" href="/drivers">
              选择车手数据
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {primaryModules.map((item, index) => (
          <Link
            key={item.href}
            className={`card motion-fade-up motion-delay-${index + 1} group flex min-h-64 flex-col justify-between overflow-hidden p-5`}
            href={item.href}
          >
            <div>
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="eyebrow">{item.code}</p>
                <span className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.16em] ${item.accent}`}>
                  {item.status}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{item.description}</p>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-4">
              <span className="race-code">OPEN MODULE</span>
              <span className="text-xl text-zinc-500 transition group-hover:translate-x-1 group-hover:text-neonAmber">→</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="card motion-fade-up motion-delay-4 overflow-hidden p-0">
        <div className="grid md:grid-cols-2">
          <div
            className="min-h-56 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/feature-ferrari.jpg')" }}
            aria-label="法拉利主题图"
          />
          <div className="flex flex-col justify-center p-5">
            <p className="eyebrow">Project Status</p>
            <h2 className="mt-2 text-xl font-semibold text-neonAmber">v1 首页主控台</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              当前版本以 Mock 数据展示完整界面结构。后续优先打磨各独立页面，再考虑接入真实 F1 数据源。
            </p>
          </div>
        </div>
      </section>

      <footer className="motion-fade-up rounded-2xl border border-zinc-900 bg-black/20 px-5 py-6 text-sm text-zinc-500">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-zinc-300">Pitwall CN</p>
          <p>非官方项目 · 当前使用 Mock 数据展示 · For Chinese F1 fans</p>
        </div>
      </footer>
    </main>
  );
}
