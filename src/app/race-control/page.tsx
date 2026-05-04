import { mockRaceControl } from "@/lib/mockData";

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

export default function RaceControlPage() {
  return (
    <section className="card">
      <h2 className="mb-3 text-lg font-semibold">赛会控制</h2>
      <ul className="space-y-2">
        {mockRaceControl.map((msg) => (
          <li key={msg.id} className="rounded border border-zinc-800 p-3">
            <div className="flex items-center justify-between text-xs text-zinc-400"><span>{msg.timestamp}</span><span className={colors[msg.category]}>{categoryText[msg.category]}</span></div>
            <p className="mt-1 text-sm">{msg.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
