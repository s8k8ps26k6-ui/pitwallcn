const cards = ["下一站比赛", "车手积分榜", "车队积分榜", "最近比赛结果"];

export default function Home() {
  return (
    <main>
      <h2 className="mb-4 text-xl font-semibold">比赛周末总览</h2>
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
