import { DriverCharts } from "@/components/driver-charts";

export default function DriverDetailPage({ params }: { params: { driverCode: string } }) {
  return (
    <main className="space-y-4">
      <section className="card">
        <h2 className="text-lg font-semibold">车手：{params.driverCode.toUpperCase()}</h2>
        <p className="mt-1 text-sm text-zinc-300">资料卡占位内容：车队、号码与赛季表现数据。</p>
      </section>
      <DriverCharts />
    </main>
  );
}
