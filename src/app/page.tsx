const cards = ["下一站比赛", "车手积分榜", "车队积分榜", "最近比赛结果"];

export default function Home() {
  return (
    <main className="space-y-6">
      <section
        className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-cover bg-center px-6 py-16 shadow-xl shadow-black/30"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/55 to-black/70" aria-hidden="true" />
        <div className="relative max-w-2xl space-y-3">
          <p className="text-sm tracking-wide text-zinc-300">图片由站长于上海大奖赛现场拍摄</p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Pitwall CN</h1>
          <h2 className="text-xl font-semibold text-neonAmber">非官方 F1 数据看板</h2>
          <p className="text-base text-zinc-100">面向中文车迷的 F1 实时计时、赛会控制与车手数据看板。</p>
        </div>
      </section>

      <section className="card overflow-hidden p-0">
        <div className="grid gap-0 md:grid-cols-2">
          <div
            className="min-h-56 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/feature-ferrari.jpg')" }}
            aria-label="法拉利主题图"
          />
          <div className="p-5">
            <h2 className="mb-2 text-xl font-semibold text-neonAmber">比赛周末总览</h2>
            <p className="text-sm text-zinc-300">聚合展示实时计时、赛会控制与关键事件，当前为模拟数据展示。</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((title) => (
          <section key={title} className="card">
            <h3 className="mb-2 text-lg font-medium text-neonAmber">{title}</h3>
            <p className="text-sm text-zinc-300">占位内容，下一步可接入真实 API 数据。</p>
          </section>
        ))}
      </div>
    </main>
  );
}
