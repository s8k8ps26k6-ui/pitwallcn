"use client";

import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const lapTimes = [
  { lap: 1, time: 97.2 },
  { lap: 2, time: 96.8 },
  { lap: 3, time: 96.5 },
  { lap: 4, time: 96.9 },
  { lap: 5, time: 96.4 },
  { lap: 6, time: 96.2 },
  { lap: 7, time: 96.6 }
];

const speed = [
  { point: "T1", speed: 284 },
  { point: "T2", speed: 301 },
  { point: "T3", speed: 269 },
  { point: "T4", speed: 315 },
  { point: "S1", speed: 328 }
];

const tooltipStyle = {
  background: "rgba(9, 9, 11, 0.95)",
  border: "1px solid rgba(63, 63, 70, 0.85)",
  borderRadius: "12px",
  color: "#f4f4f5"
};

export function DriverCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="card h-72">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Lap Trace</p>
            <h3 className="mt-1 text-lg font-semibold text-white">圈速走势</h3>
          </div>
          <span className="race-code">LAP TIME</span>
        </div>
        <ResponsiveContainer width="100%" height="76%">
          <LineChart data={lapTimes} margin={{ left: -20, right: 10, top: 8, bottom: 0 }}>
            <XAxis dataKey="lap" stroke="#71717a" tick={{ fill: "#a1a1aa", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis domain={[96, 98]} stroke="#71717a" tick={{ fill: "#a1a1aa", fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#ffb020" }} cursor={{ stroke: "rgba(255, 176, 32, 0.22)", strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="time"
              stroke="#ff2e2e"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="card h-72">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Telemetry</p>
            <h3 className="mt-1 text-lg font-semibold text-white">速度遥测</h3>
          </div>
          <span className="race-code">KM/H</span>
        </div>
        <ResponsiveContainer width="100%" height="76%">
          <AreaChart data={speed} margin={{ left: -20, right: 10, top: 8, bottom: 0 }}>
            <XAxis dataKey="point" stroke="#71717a" tick={{ fill: "#a1a1aa", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717a" tick={{ fill: "#a1a1aa", fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#19f38b" }} cursor={{ stroke: "rgba(25, 243, 139, 0.22)", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="speed"
              stroke="#19f38b"
              fill="rgba(25, 243, 139, 0.12)"
              strokeWidth={2.5}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
