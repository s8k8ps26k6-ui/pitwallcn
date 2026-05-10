import { getRaceControlFeed } from "@/lib/f1-service";

const colors: Record<string, string> = {
  FLAG: "text-neonAmber",
  SAFETY_CAR: "text-pitGreen",
  INCIDENT: "text-neonRed",
  NOTICE: "text-zinc-100"
};

const categoryText: Record<string, string> = {
  FLAG: "旗语",
  SAFETY_CAR: "安全车",
  INCIDENT: "事故",
  NOTICE: "通知"
};

export default async function RaceControlPage() {
  const { data, source } = await getRaceControlFeed();

  return (
    <section className="card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">赛会控制</h2>
        <span className="text-xs text-zinc-500">数据来源：{source === "openf1" ? "OpenF1" : "Mock"}</span>
      </div>
      <ul className="space-y-2">
        {data.map((msg) => (
          <li key={msg.id} className="rounded border border-zinc-800 p-3">
            <div className="flex items-center justify-between text-xs text-zinc-400"><span>{msg.timestamp}</span><span className={colors[msg.category]}>{categoryText[msg.category]}</span></div>
            <p className="mt-1 text-sm">{msg.message}</p>
            {(msg.flag || typeof msg.lapNumber === "number") && (
              <p className="mt-1 text-xs text-zinc-500">{msg.flag ? `旗语：${msg.flag}` : ""}{msg.flag && typeof msg.lapNumber === "number" ? " · " : ""}{typeof msg.lapNumber === "number" ? `圈数：${msg.lapNumber}` : ""}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
