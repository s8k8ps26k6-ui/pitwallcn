import Link from "next/link";
import { DriverIndex } from "@/components/driver-index";
import { drivers } from "@/lib/drivers";

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
              从这里选择车手进入详情页。当前为 Mock 数据版本，后续可扩展到完整车手名单、动漫头像与真实积分数据。
            </p>
          </div>
          <div className="w-fit rounded-full border border-neonRed/50 bg-black/60 px-3 py-1 text-xs font-semibold text-neonRed shadow-[0_0_24px_rgba(255,46,46,0.14)]">
            {drivers.length} DRIVERS · MOCK
          </div>
        </div>
      </section>

      <DriverIndex drivers={drivers} />
    </main>
  );
}
