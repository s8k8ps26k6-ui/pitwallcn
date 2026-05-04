import Image from "next/image";
import Link from "next/link";

const cards = ["下一站比赛", "车手积分榜", "车队积分榜", "最近比赛结果"];

export default function Home() {
  return (
    <main className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800">
        <Image src="/images/hero.jpg" alt="上海大奖赛现场" width={1600} height={900} className="h-[300px] w-full object-cover sm:h-[360px]" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/85" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
          <h2 className="text-3xl font-bold tracking-wide text-white sm:text-4xl">Pitwall CN</h2>
          <p className="mt-2 text-lg text-neonAmber">非官方 F1 数据看板</p>
          <p className="mt-2 max-w-2xl text-sm text-zinc-200 sm:text-base">面向中文车迷的 F1 实时计时、赛会控制与车手数据看板。</p>
          <p className="mt-3 text-xs text-zinc-300">图片由站长于上海大奖赛现场拍摄</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card lg:col-span-2">
          <h3 className="mb-3 text-lg font-semibold text-neonAmber">本站亮点</h3>
          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <Image src="/images/feature-ferrari.jpg" alt="法拉利赛车特写" width={1200} height={700} className="h-52 w-full object-cover sm:h-64" />
          </div>
          <p className="mt-3 text-sm text-zinc-300">聚焦比赛节奏变化、关键判罚与圈速走势，以深色赛道风格呈现核心信息。</p>
        </article>

        <article className="card">
          <h3 className="mb-3 text-lg font-semibold">快速入口</h3>
          <div className="space-y-2 text-sm">
            <Link className="block rounded bg-zinc-800 px-3 py-2 hover:bg-zinc-700" href="/live">进入实时计时</Link>
            <Link className="block rounded bg-zinc-800 px-3 py-2 hover:bg-zinc-700" href="/race-control">查看赛会控制</Link>
            <Link className="block rounded bg-zinc-800 px-3 py-2 hover:bg-zinc-700" href="/drivers/VER">查看车手页</Link>
          </div>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {cards.map((title) => (
          <article key={title} className="card">
            <h3 className="mb-2 text-lg font-medium text-neonAmber">{title}</h3>
            <p className="text-sm text-zinc-300">占位内容，下一步可接入真实 API 数据。</p>
          </article>
        ))}
      </section>
    </main>
  );
}
