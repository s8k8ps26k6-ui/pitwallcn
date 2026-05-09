import Link from "next/link";
import { DriverCharts } from "@/components/driver-charts";

export default function DriverDetailPage({ params }: { params: { driverCode: string } }) {
  return (
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>
      <section className="card motion-fade-up overflow-hidden p-0">
        <div className="grid md:grid-cols-2">
          <div
            className="min-h-64 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/driver-redbull.jpg')" }}
            aria-label="车手视觉图"
          />
          <div className="space-y-3 p-5">
            <p className="eyebrow">Driver Detail</p>
            <h2 className="text-2xl font-semibold text-white">车手：{params.driverCode.toUpperCase()}</h2>
            <p className="text-sm leading-6 text-zinc-300">资料卡占位内容：车队、号码与赛季表现数据。</p>
            <p className="rounded-lg border border-zinc-800 bg-black/20 p-3 text-sm text-zinc-400">当前页面使用模拟数据，后续将接入实时接口。</p>
          </div>
        </div>
      </section>
      <div className="motion-fade-up motion-delay-1">
        <DriverCharts />
      </div>
    </main>
  );
}
