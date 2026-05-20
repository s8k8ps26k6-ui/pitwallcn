export default function Loading() {
  return (
    <main className="space-y-4">
      <section className="rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Pitwall CN</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">正在加载数据</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              正在连接 OpenF1 与本地赛历。数据页首次进入可能需要几秒钟，请稍等。
            </p>
          </div>
          <div className="w-fit rounded-full border border-pitGreen/50 bg-black/60 px-3 py-1 text-xs font-semibold text-pitGreen shadow-[0_0_24px_rgba(25,243,139,0.14)]">
            LOADING · API READY
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {["Session", "Drivers", "Timing", "Control"].map((item) => (
          <article key={item} className="rounded-2xl border border-zinc-800 bg-black/25 p-4 shadow-lg shadow-black/10">
            <p className="race-code text-zinc-600">{item}</p>
            <div className="mt-3 h-7 w-24 animate-pulse rounded-lg bg-zinc-800/80" />
            <div className="mt-3 h-3 w-32 animate-pulse rounded-full bg-zinc-900" />
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-black/20 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Loading Table</p>
            <div className="mt-2 h-6 w-32 animate-pulse rounded-lg bg-zinc-800/80" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-900" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="grid grid-cols-5 gap-3 rounded-xl border border-zinc-900 bg-black/20 p-3">
              <div className="h-4 animate-pulse rounded bg-zinc-800" />
              <div className="h-4 animate-pulse rounded bg-zinc-800" />
              <div className="h-4 animate-pulse rounded bg-zinc-900" />
              <div className="h-4 animate-pulse rounded bg-zinc-900" />
              <div className="h-4 animate-pulse rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
