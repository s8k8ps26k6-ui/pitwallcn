import Image from "next/image";
import { DriverCharts } from "@/components/driver-charts";

export default function DriverDetailPage({ params }: { params: { driverCode: string } }) {
  return (
    <main className="space-y-4">
      <section className="relative overflow-hidden rounded-xl border border-zinc-800">
        <Image src="/images/driver-redbull.jpg" alt="红牛车队车手" width={1400} height={700} className="h-44 w-full object-cover sm:h-52" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/70" />
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <h2 className="text-lg font-semibold text-white">车手：{params.driverCode.toUpperCase()}</h2>
          <p className="mt-1 text-sm text-zinc-200">资料卡占位内容：车队、号码与赛季表现数据。</p>
        </div>
      </section>
      <DriverCharts />
    </main>
  );
}
