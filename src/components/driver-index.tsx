"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "@/app/data-pages.module.css";
import type { DriverStanding } from "@/lib/standings-service";

export function DriverIndex({ drivers }: { drivers: DriverStanding[] }) {
  const [query, setQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("全部车队");
  const teams = useMemo(() => ["全部车队", ...Array.from(new Set(drivers.map((driver) => driver.team)))], [drivers]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return drivers.filter((driver) => {
      const matchesTeam = selectedTeam === "全部车队" || driver.team === selectedTeam;
      const searchable = [driver.code, driver.name, driver.team, driver.number].join(" ").toLowerCase();
      return matchesTeam && (!keyword || searchable.includes(keyword));
    });
  }, [drivers, query, selectedTeam]);

  const grouped = useMemo(() => Array.from(filtered.reduce((map, driver) => {
    const rows = map.get(driver.team) ?? [];
    rows.push(driver);
    map.set(driver.team, rows);
    return map;
  }, new Map<string, DriverStanding[]>()).entries()), [filtered]);

  return (
    <section>
      <div className={styles.filterDock}>
        <label className={styles.fieldLabel}>
          搜索车手
          <input
            autoCapitalize="none"
            autoComplete="off"
            className={styles.searchInput}
            name="driver-search"
            placeholder="例如 VER、Norris 或 Ferrari…"
            spellCheck={false}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className={styles.teamFilters} aria-label="按车队筛选" role="group">
          {teams.map((team) => (
            <button
              aria-pressed={selectedTeam === team}
              className={`${styles.teamButton} ${selectedTeam === team ? styles.teamButtonActive : ""}`}
              key={team}
              onClick={() => setSelectedTeam(team)}
              type="button"
            >
              {team}
            </button>
          ))}
        </div>
        <div className={styles.filterFooter}>
          <span aria-live="polite">{filtered.length} / {drivers.length} 位车手</span>
          <button className={styles.resetButton} onClick={() => { setQuery(""); setSelectedTeam("全部车队"); }} type="button">重置筛选</button>
        </div>
      </div>

      <div className={styles.roster}>
        {grouped.map(([team, teamDrivers]) => (
          <section className={styles.teamGroup} key={team} aria-labelledby={`team-${team.replace(/\s+/g, "-")}`}>
            <h2 className={styles.teamName} id={`team-${team.replace(/\s+/g, "-")}`}>
              {team}<span>{teamDrivers.length} 位车手</span>
            </h2>
            {teamDrivers.map((driver) => (
              <Link className={styles.driverRow} href={driver.href} key={driver.code}>
                <span className={styles.driverCode} translate="no">{driver.code}</span>
                <span className={styles.driverName}>{driver.name}</span>
                <span className={styles.driverNumber}>#{driver.number}</span>
              </Link>
            ))}
          </section>
        ))}
      </div>

      {!filtered.length ? (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>没有匹配的车手</h2>
          <p>清除关键词或切换到“全部车队”后重试。</p>
        </section>
      ) : null}
    </section>
  );
}
