import Link from "next/link";
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
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>
      <section className="card">
        <div className="mb-4">
          <p className="eyebrow">Race Control</p>
          <h2 className="mt-2 text-xl font-semibold text-white">赛会控制</h2>
        </div>
        <ul className="space-y-2">
          {mockRaceControl.map((msg) => (
            <li key={msg.id} className="rounded border border-zinc-800 bg-black/20 p-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{msg.timestamp}</span>
                <span className={colors[msg.category]}>{categoryText[msg.category]}</span>
              </div>
              <p className="mt-1 text-sm">{msg.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
