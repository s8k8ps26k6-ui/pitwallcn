import Link from "next/link";

const drivers = [
  {
    code: "VER",
    name: "Max Verstappen",
    team: "Red Bull Racing",
    number: "1",
    points: "168",
    status: "P1",
    href: "/drivers/VER",
    accent: "border-blue-500/40 bg-blue-500/10 text-blue-300"
  },
  {
    code: "NOR",
    name: "Lando Norris",
    team: "McLaren",
    number: "4",
    points: "142",
    status: "P2",
    href: "/drivers/NOR",
    accent: "border-orange-400/40 bg-orange-400/10 text-orange-300"
  },
  {
    code: "LEC",
    name: "Charles Leclerc",
    team: "Ferrari",
    number: "16",
    points: "119",
    status: "P3",
    href: "/drivers/LEC",
    accent: "border-neonRed/40 bg-neonRed/10 text-neonRed"
  }
] as const;

export default function DriversPage() {
  return (
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>

      <section className="motion-fade-up rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Driver Index</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">车手数据中心</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              从这里选择车手进入详情页。当前为 Mock 数据版本，后续可扩展到完整车手名单与真实积分数据。
            </p>
          </div>
          <div className="w-fit rounded-full border border-neonRed/50 bg-black/60 px-3 py-1 text-xs font-semibold text-neonRed shadow-[0_0_24px_rgba(255,46,46,0.14)]">
            DRIVER DATA · MOCK
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {drivers.map((driver, index) => (
          <Link
            key={driver.code}
            className={`card motion-fade-up motion-delay-${index + 1} group flex min-h-72 flex-col justify-between p-5`}
            href={driver.href}
          >
            <div>
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="eyebrow">{driver.team}</p>
                <span className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.16em] ${driver.accent}`}>
                  {driver.status}
                </span>
              </div>
              <p className="font-mono text-5xl font-bold text-white">{driver.code}</p>
              <h2 className="mt-3 text-xl font-semibold text-neonAmber">{driver.name}</h2>
              <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                  <p className="race-code">No.</p>
                  <p className="mt-1 font-mono text-xl font-bold text-white">{driver.number}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                  <p className="race-code">Pts</p>
                  <p className="mt-1 font-mono text-xl font-bold text-white">{driver.points}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-4">
              <span className="race-code">OPEN PROFILE</span>
              <span className="text-xl text-zinc-500 transition group-hover:translate-x-1 group-hover:text-neonAmber">→</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
