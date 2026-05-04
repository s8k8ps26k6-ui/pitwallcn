"use client";

import { useEffect, useState } from "react";
import { LiveTimingRow } from "@/lib/types";

export function LiveTimingTable({ initialData }: { initialData: LiveTimingRow[] }) {
  const [rows, setRows] = useState(initialData);
  const [updatedAt, setUpdatedAt] = useState(new Date());

  useEffect(() => {
    const id = setInterval(async () => {
      const response = await fetch("/api/f1/live", { cache: "no-store" });
      const json = (await response.json()) as { data: LiveTimingRow[] };
      setRows(json.data);
      setUpdatedAt(new Date());
    }, 10000);

    return () => clearInterval(id);
  }, []);

  return (
    <section className="card overflow-x-auto">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">实时计时</h2>
        <span className="text-xs text-pitGreen">每 10 秒自动刷新 · {updatedAt.toLocaleTimeString("zh-CN")}</span>
      </div>
      <table className="min-w-full text-left text-sm">
        <thead className="text-zinc-400">
          <tr>
            {["名次", "车手", "车队", "差距", "上一圈", "最快圈", "进站状态"].map((h) => (
              <th key={h} className="px-2 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.driver} className="border-t border-zinc-800">
              <td className="px-2 py-2">{row.position}</td><td className="px-2 py-2 font-semibold">{row.driver}</td>
              <td className="px-2 py-2">{row.team}</td><td className="px-2 py-2">{row.gap}</td>
              <td className="px-2 py-2">{row.lastLap}</td><td className="px-2 py-2 text-neonAmber">{row.bestLap}</td>
              <td className="px-2 py-2">{row.pitStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
