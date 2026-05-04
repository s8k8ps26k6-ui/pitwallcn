"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area } from "recharts";

const lapTimes = [
  { lap: 1, time: 97.2 },
  { lap: 2, time: 96.8 },
  { lap: 3, time: 96.5 },
  { lap: 4, time: 96.9 },
  { lap: 5, time: 96.4 }
];

const speed = [
  { point: "T1", speed: 284 },
  { point: "T2", speed: 301 },
  { point: "T3", speed: 269 },
  { point: "T4", speed: 315 }
];

export function DriverCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="card h-72">
        <h3 className="mb-2 text-sm font-medium">圈速走势</h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={lapTimes}><XAxis dataKey="lap" /><YAxis domain={[96, 98]} /><Tooltip /><Line type="monotone" dataKey="time" stroke="#ff2e2e" strokeWidth={2} /></LineChart>
        </ResponsiveContainer>
      </section>
      <section className="card h-72">
        <h3 className="mb-2 text-sm font-medium">速度遥测（占位）</h3>
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={speed}><XAxis dataKey="point" /><YAxis /><Tooltip /><Area type="monotone" dataKey="speed" stroke="#19f38b" fill="#19f38b33" /></AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
