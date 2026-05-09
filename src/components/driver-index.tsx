"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DriverProfile } from "@/lib/drivers";

export function DriverIndex({ drivers }: { drivers: DriverProfile[] }) {
  const [query, setQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");

  const teams = useMemo(() => ["All Teams", ...Array.from(new Set(drivers.map((driver) => driver.team)))], [drivers]);

  const filteredDrivers = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return drivers.filter((driver) => {
      const matchesTeam = selectedTeam === "All Teams" || driver.team === selectedTeam;
      const matchesKeyword =
        !keyword ||
        driver.code.toLowerCase().includes(keyword) ||
        driver.name.toLowerCase().includes(keyword) ||
        driver.team.toLowerCase().includes(keyword) ||
        driver.number.includes(keyword);

      return matchesTeam && matchesKeyword;
    });
  }, [drivers, query, selectedTeam]);

  return (
    <section className="space-y-4">
      <div className="card motion-fade-up motion-delay-1">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="block">
            <span className="race-code">Search Driver</span>
            <input
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-black/30 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-neonAmber"
              placeholder="搜索车手代码、姓名、车队或车号，例如 VER / Norris / Ferrari / 44"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {teams.map((team) => (
              <button
                key={team}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  selectedTeam === team
                    ? "border-neonAmber bg-neonAmber/10 text-neonAmber"
                    : "border-zinc-800 bg-black/20 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100"
                }`}
                type="button"
                onClick={() => setSelectedTeam(team)}
              >
                {team}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs text-zinc-500">
          <span className="race-code">{filteredDrivers.length} / {drivers.length} Drivers</span>
          <button
            className="transition hover:text-neonAmber"
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedTeam("All Teams");
            }}
          >
            Reset filters
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {filteredDrivers.map((driver, index) => (
          <Link
            key={driver.code}
            className={`card motion-fade-up motion-delay-${(index % 6) + 1} group flex min-h-72 flex-col justify-between p-5`}
            href={driver.href}
          >
            <div>
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="eyebrow">{driver.team}</p>
                <span className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.16em] ${driver.accent}`}>
                  {driver.status}
                </span>
              </div>
              <p className="font-mono text-5xl font-bold text-white">{driver.code}</p>
              <h2 className="mt-3 text-xl font-semibold text-neonAmber">{driver.name}</h2>
              <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                  <p className="race-code">No.</p>
                  <p className="mt-1 font-mono text-xl font-bold text-white">{driver.number}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                  <p className="race-code">Pts</p>
                  <p className="mt-1 font-mono text-xl font-bold text-white">{driver.points}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-4">
              <span className="race-code">OPEN PROFILE</span>
              <span className="text-xl text-zinc-500 transition group-hover:translate-x-1 group-hover:text-neonAmber">→</span>
            </div>
          </Link>
        ))}
      </section>

      {filteredDrivers.length === 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-black/20 p-6 text-center text-sm text-zinc-400">
          没有找到符合条件的车手。换个关键词或重置筛选。
        </section>
      ) : null}
    </section>
  );
}
