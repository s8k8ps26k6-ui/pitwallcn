"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const lapTimes = [
  { lap: 1, time: 97.2 },
  { lap: 2, time: 96.8 },
  { lap: 3, time: 96.5 },
  { lap: 4, time: 96.9 },
  { lap: 5, time: 96.4 },
  { lap: 6, time: 96.2 },
  { lap: 7, time: 96.6 }
];

const sectorSpeeds = [
  { sector: "S1", speed: 304 },
  { sector: "S2", speed: 286 },
  { sector: "S3", speed: 318 }
];

const tooltipStyle = {
  background: "rgba(9, 9, 11, 0.92)",
  border: "1px solid rgba(63, 63, 70, 0.9)",
  borderRadius: "12px",
  color: "#f4f4f5"
};

export function DriverCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="card h-80">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Lap Trace</p>
            <h3 className="mt-1 text-lg font-semibold text-white">圈速走势</h3>
          </div>
          <span className="race-code">LAP TIME</span>
        </div>
        <ResponsiveContainer width="100%" height="78%">
          <LineChart data={lapTimes} margin={{ left: -18, right: 12, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="rgba(63, 63, 70, 0.35)" strokeDasharray="3 3" />
            <XAxis dataKey="lap" stroke="#71717a" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
            <YAxis domain={[96, 98]} stroke="#71717a" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#ffb020" }} />
            <Line type="monotone" dataKey="time" stroke="#ff2e2e" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="card h-80">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Sector Speed</p>
            <h3 className="mt-1 text-lg font-semibold text-white">分段速度</h3>
          </div>
          <span className="race-code">S1 / S2 / S3</span>
        </div>
        <ResponsiveContainer width="100%" height="78%">
          <AreaChart data={sectorSpeeds} margin={{ left: -18, right: 12, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="rgba(63, 63, 70, 0.35)" strokeDasharray="3 3" />
            <XAxis dataKey="sector" stroke="#71717a" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
            <YAxis stroke="#71717a" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#19f38b" }} />
            <Area type="monotone" dataKey="speed" stroke="#19f38b" fill="rgba(25, 243, 139, 0.16)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
