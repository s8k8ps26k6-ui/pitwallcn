"use client";

import { useMemo, useState } from "react";
import type { RaceWeekend } from "@/lib/types";

function formatDateTime(iso: string, timeZone: string) {
  const date = new Date(iso);
  return {
    date: new Intl.DateTimeFormat("zh-CN", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
      timeZone
    }).format(date),
    time: new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone
    }).format(date)
  };
}

function getSessionTone(name: string) {
  const upper = name.toUpperCase();
  if (upper.includes("RACE") || name.includes("正赛")) return "bg-pitGreen";
  if (upper.includes("QUALIFYING") || upper.includes("SQ") || name.includes("排位")) return "bg-neonRed";
  if (upper.includes("SPRINT") || name.includes("冲刺")) return "bg-purple-500";
  return "bg-neonAmber";
}

export function ScheduleView({ race }: { race: RaceWeekend }) {
  const [timeMode, setTimeMode] = useState<"local" | "circuit">("local");

  const modeMeta = useMemo(
    () => ({
      local: {
        hint: "按中国时间展示",
        timeZone: "Asia/Shanghai"
      },
      circuit: {
        hint: `按${race.location || race.country}当地时间展示`,
        timeZone: "America/Toronto"
      }
    }),
    [race.country, race.location]
  );

  const currentMeta = modeMeta[timeMode];

  return (
    <section className="motion-fade-up motion-delay-1 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Weekend Schedule</p>
          <h2 className="mt-1 text-2xl font-bold text-white">赛事时间安排</h2>
          <p className="mt-1 text-xs text-zinc-500">{currentMeta.hint}</p>
        </div>
        <div className="grid w-fit grid-cols-2 rounded-full border border-zinc-800 bg-black/30 p-1 text-xs">
          <button
            className={`rounded-full px-3 py-1 font-semibold transition ${
              timeMode === "local" ? "bg-blue-500 text-white" : "text-zinc-500 hover:text-zinc-200"
            }`}
            type="button"
            onClick={() => setTimeMode("local")}
          >
            本地时间
          </button>
          <button
            className={`rounded-full px-3 py-1 font-semibold transition ${
              timeMode === "circuit" ? "bg-blue-500 text-white" : "text-zinc-500 hover:text-zinc-200"
            }`}
            type="button"
            onClick={() => setTimeMode("circuit")}
          >
            赛道时间
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {race.sessions.map((item, index) => {
          const formatted = formatDateTime(item.startTime, currentMeta.timeZone);

          return (
            <article
              key={`${item.name}-${item.startTime}`}
              className={`motion-fade-up motion-delay-${(index % 6) + 1} rounded-2xl border border-zinc-800 bg-[#11182f]/90 p-4 shadow-lg shadow-black/20`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${getSessionTone(item.name)} shadow-[0_0_18px_rgba(59,130,246,0.4)]`} />
                  <div>
                    <p className="text-lg font-semibold text-white">{formatted.date}</p>
                    <p className="mt-1 text-sm text-zinc-400">{item.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-bold text-neonAmber">{formatted.time}</p>
                  <p className="mt-1 race-code">SESSION</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
