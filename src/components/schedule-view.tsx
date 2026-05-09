"use client";

import { useMemo, useState } from "react";

const scheduleItems = [
  {
    date: "5月23日 周六",
    circuitDate: "5月22日 周五",
    title: "第一次自由练习赛",
    localTime: "00:30 - 01:30",
    circuitTime: "12:30 - 13:30",
    type: "FP1",
    tone: "bg-neonAmber"
  },
  {
    date: "5月23日 周六",
    circuitDate: "5月22日 周五",
    title: "冲刺排位赛",
    localTime: "04:30 - 05:30",
    circuitTime: "16:30 - 17:30",
    type: "SQ",
    tone: "bg-purple-500"
  },
  {
    date: "5月24日 周日",
    circuitDate: "5月23日 周六",
    title: "冲刺赛",
    localTime: "00:00 - 00:30",
    circuitTime: "12:00 - 12:30",
    type: "SPRINT",
    tone: "bg-purple-500"
  },
  {
    date: "5月24日 周日",
    circuitDate: "5月23日 周六",
    title: "排位赛",
    localTime: "04:00 - 05:00",
    circuitTime: "16:00 - 17:00",
    type: "QUALIFYING",
    tone: "bg-neonRed"
  },
  {
    date: "5月25日 周一",
    circuitDate: "5月24日 周日",
    title: "正赛",
    localTime: "02:00 - 04:00",
    circuitTime: "14:00 - 16:00",
    type: "RACE",
    tone: "bg-pitGreen"
  }
] as const;

export function ScheduleView() {
  const [timeMode, setTimeMode] = useState<"local" | "circuit">("local");

  const modeMeta = useMemo(
    () => ({
      local: {
        hint: "按中国时间展示"
      },
      circuit: {
        hint: "按蒙特利尔当地时间展示"
      }
    }),
    []
  );

  return (
    <section className="motion-fade-up motion-delay-1 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Weekend Schedule</p>
          <h2 className="mt-1 text-2xl font-bold text-white">赛事时间安排</h2>
          <p className="mt-1 text-xs text-zinc-500">{modeMeta[timeMode].hint}</p>
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
        {scheduleItems.map((item, index) => {
          const date = timeMode === "local" ? item.date : item.circuitDate;
          const time = timeMode === "local" ? item.localTime : item.circuitTime;

          return (
            <article
              key={`${item.title}-${item.localTime}`}
              className={`motion-fade-up motion-delay-${(index % 6) + 1} rounded-2xl border border-zinc-800 bg-[#11182f]/90 p-4 shadow-lg shadow-black/20`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${item.tone} shadow-[0_0_18px_rgba(59,130,246,0.4)]`} />
                  <div>
                    <p className="text-lg font-semibold text-white">{date}</p>
                    <p className="mt-1 text-sm text-zinc-400">{item.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-bold text-neonAmber">{time}</p>
                  <p className="mt-1 race-code">{item.type}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
