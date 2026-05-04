import { DriverCharts } from "@/components/driver-charts";

export default function DriverDetailPage({ params }: { params: { driverCode: string } }) {
  return (
    <main className="space-y-4">
      <section className="card overflow-hidden p-0">
        <div className="grid md:grid-cols-2">
          <div
            className="min-h-64 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/driver-redbull.jpg')" }}
            aria-label="车手视觉图"
          />
          <div className="space-y-2 p-5">
            <h2 className="text-lg font-semibold">车手：{params.driverCode.toUpperCase()}</h2>
            <p className="text-sm text-zinc-300">资料卡占位内容：车队、号码与赛季表现数据。</p>
            <p className="text-sm text-zinc-400">当前页面使用模拟数据，后续将接入实时接口。</p>
          </div>
        </div>
      </section>
      <DriverCharts />
    </main>
  );
}
