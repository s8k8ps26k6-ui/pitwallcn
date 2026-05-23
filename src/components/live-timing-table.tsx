"use client";

import { useEffect, useMemo, useState } from "react";
import type { LiveTimingRow } from "@/lib/types";

type LiveTimingSource = "openf1" | "openf1-waiting" | "openf1-error";

const statusStyles: Record<LiveTimingRow["pitStatus"], string> = {
  OUT: "border-pitGreen/40 bg-pitGreen/10 text-pitGreen",
  PIT: "border-neonAmber/40 bg-neonAmber/10 text-neonAmber",
  IN: "border-neonRed/40 bg-neonRed/10 text-neonRed"
};

const teamAccent: Record<string, string> = {
  "Red Bull Racing": "bg-blue-500",
  "Red Bull": "bg-blue-500",
  McLaren: "bg-orange-400",
  Ferrari: "bg-neonRed",
  Mercedes: "bg-cyan-300",
  Williams: "bg-blue-400",
  Alpine: "bg-pink-400",
  "Aston Martin": "bg-emerald-400",
  Haas: "bg-zinc-300",
  "Racing Bulls": "bg-blue-300",
  Sauber: "bg-pitGreen"
};

function sourceLabel(source: LiveTimingSource) {
  if (source === "openf1") return "OPENF1 LIVE";
  if (source === "openf1-waiting") return "WAITING DATA";
  return "OPENF1 WAITING";
}

export function LiveTimingTable({ initialData, initialSource, sessionName }: { initialData: LiveTimingRow[]; initialSource: LiveTimingSource; sessionName: string }) {
  const [rows, setRows] = useState(initialData);
  const [source, setSource] = useState(initialSource);
  const [updatedAt, setUpdatedAt] = useState(new Date());

  useEffect(() => {
    const refresh = async () => {
      try {
        const response = await fetch("/api/f1/live", { cache: "no-store" });
        const json = (await response.json()) as { data: LiveTimingRow[]; source: LiveTimingSource };
        setRows(json.data);
        setSource(json.source);
        setUpdatedAt(new Date());
      } catch {
        setSource("openf1-error");
        setUpdatedAt(new Date());
      }
    };

    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, []);

  const leader = rows[0];
  const averageLastLap = useMemo(() => {
    const seconds = rows
      .map((row) => row.lastLap)
      .map((lap) => {
        if (lap === "--") return Number.NaN;
        const [minutes, rest] = lap.split(":");
        return Number(minutes) * 60 + Number(rest);
      })
      .filter((value) => Number.isFinite(value));

    if (!seconds.length) return "--";

    const average = seconds.reduce((sum, value) => sum + value, 0) / seconds.length;
    const minutes = Math.floor(average / 60);
    const remaining = (average - minutes * 60).toFixed(3).padStart(6, "0");

    return `${minutes}:${remaining}`;
  }, [rows]);

  return (
    <section className="space-y-4">
      <div className="motion-fade-up rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Live Timing</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">实时计时</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              使用 OpenF1 最新会话数据展示当前可用的车手位置、差距、上一圈和最快圈。没有进行中的官方会话时，会显示等待状态。
            </p>
            <p className="mt-2 text-xs text-zinc-600">{sessionName}</p>
          </div>
          <div className="w-fit rounded-full border border-pitGreen/60 bg-black/60 px-3 py-1 text-xs font-semibold text-pitGreen shadow-[0_0_24px_rgba(25,243,139,0.16)]">
            <span className="mr-2 inline-flex align-middle live-dot" aria-hidden="true" />
            {sourceLabel(source)} · {updatedAt.toLocaleTimeString("zh-CN")}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <section className="card motion-fade-up motion-delay-1">
          <p className="eyebrow">Leader</p>
          <p className="mt-3 text-3xl font-bold text-white">{leader?.driver ?? "--"}</p>
          <p className="mt-1 text-sm text-zinc-400">{leader?.team ?? "等待 OpenF1 数据"}</p>
        </section>
        <section className="card motion-fade-up motion-delay-2">
          <p className="eyebrow">Best Lap</p>
          <p className="mt-3 font-mono text-3xl font-bold text-neonAmber">{leader?.bestLap ?? "--"}</p>
          <p className="mt-1 text-sm text-zinc-400">当前表内最快圈参考</p>
        </section>
        <section className="card motion-fade-up motion-delay-3">
          <p className="eyebrow">Avg Last Lap</p>
          <p className="mt-3 font-mono text-3xl font-bold text-white">{averageLastLap}</p>
          <p className="mt-1 text-sm text-zinc-400">表内上一圈均值</p>
        </section>
      </div>

      <section className="card motion-fade-up motion-delay-4 overflow-hidden p-0">
        <div className="border-b border-zinc-800 bg-black/25 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Timing Tower</p>
              <h2 className="mt-1 text-lg font-semibold text-white">赛道排名</h2>
            </div>
            <span className="race-code">{sourceLabel(source)}</span>
          </div>
        </div>

        {rows.length ? (
          <>
            <div className="space-y-2 p-3 md:hidden">
              {rows.map((row) => (
                <article key={`${row.position}-${row.driver}`} className="rounded-xl border border-zinc-800 bg-black/25 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="font-mono text-sm text-zinc-500">P{row.position}</span>
                      <span className={`h-8 w-1 rounded-full ${teamAccent[row.team] ?? "bg-zinc-500"}`} aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold text-white">{row.driver}</p>
                        <p className="truncate text-xs text-zinc-500">{row.team}</p>
                      </div>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[0.65rem] font-bold tracking-[0.18em] ${statusStyles[row.pitStatus]}`}>
                      {row.pitStatus}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg bg-zinc-950/70 p-2">
                      <p className="text-zinc-500">GAP</p>
                      <p className="mt-1 font-mono text-zinc-100">{row.gap}</p>
                    </div>
                    <div className="rounded-lg bg-zinc-950/70 p-2">
                      <p className="text-zinc-500">LAST</p>
                      <p className="mt-1 font-mono text-zinc-100">{row.lastLap}</p>
                    </div>
                    <div className="rounded-lg bg-zinc-950/70 p-2">
                      <p className="text-zinc-500">BEST</p>
                      <p className="mt-1 font-mono text-neonAmber">{row.bestLap}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-950/60 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Pos</th>
                    <th className="px-4 py-3">Driver</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Gap</th>
                    <th className="px-4 py-3">Last Lap</th>
                    <th className="px-4 py-3">Best Lap</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`${row.position}-${row.driver}`} className="border-b border-zinc-900 transition hover:bg-white/[0.03]">
                      <td className="px-4 py-4 font-mono text-zinc-500">P{row.position}</td>
                      <td className="px-4 py-4 text-lg font-bold text-white">{row.driver}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 text-zinc-300">
                          <span className={`h-6 w-1 rounded-full ${teamAccent[row.team] ?? "bg-zinc-500"}`} aria-hidden="true" />
                          {row.team}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-zinc-300">{row.gap}</td>
                      <td className="px-4 py-4 font-mono text-zinc-300">{row.lastLap}</td>
                      <td className="px-4 py-4 font-mono text-neonAmber">{row.bestLap}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full border px-2 py-1 text-[0.65rem] font-bold tracking-[0.18em] ${statusStyles[row.pitStatus]}`}>
                          {row.pitStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-5 text-sm leading-6 text-zinc-400">
            当前没有可用的 OpenF1 实时计时数据。可能是没有正在进行的会话，或 OpenF1 暂时未返回 position / intervals / laps 数据。
          </div>
        )}
      </section>
    </section>
  );
}
