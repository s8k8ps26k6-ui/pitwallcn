"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CircuitOutline } from "@/components/race-shared/circuit-outline";
import { HomeBrandLink } from "@/components/home-brand-link";
import {
  formatRaceDateRange,
  getCalendarDisplayStatus,
  getCountryFlag,
  getCurrentSeasonRace,
  getSeasonRaces,
  getStatusLabel,
  type UnifiedRace,
} from "@/lib/atlas/race-detail";
import styles from "./season-calendar.module.css";

type SeasonCalendarProps = {
  races: readonly UnifiedRace[];
  currentEventId: string;
  phase: ReturnType<typeof getCurrentSeasonRace>["phase"];
};

function CalendarRow({
  race,
  status,
}: {
  race: UnifiedRace;
  status: ReturnType<typeof getCalendarDisplayStatus>;
}) {
  const detailHref = `/races/${race.season}/${race.eventId}` as Route;

  return (
    <Link
      id={`race-${race.eventId}`}
      className={styles.row}
      href={detailHref}
      data-calendar-status={status}
      aria-label={`Open ${race.race.name}`}
    >
      <span className={styles.rowIndex}>{String(race.race.round).padStart(2, "0")}</span>
      <span className={styles.flag} aria-hidden="true">
        {getCountryFlag(race.race.country)}
      </span>
      <span className={styles.rowTitle}>
        <span className={styles.raceName}>{race.race.name}</span>
        <span className={styles.circuitName}>{race.race.circuitName}</span>
      </span>
      <CircuitOutline
        outline={race.circuit?.outline}
        className={styles.trace}
        title={`${race.race.circuitName} track outline`}
      />
      <span className={styles.rowDate}>{formatRaceDateRange(race)}</span>
      <span className={styles.rowStatus}>{getStatusLabel(status)}</span>
      <span className={styles.rowArrow} aria-hidden="true">↗</span>
    </Link>
  );
}

export function SeasonCalendar({
  races,
  currentEventId,
  phase,
}: SeasonCalendarProps) {
  const searchParams = useSearchParams();
  const listRef = useRef<HTMLDivElement>(null);
  const liveRaces = useMemo(() => getSeasonRaces(), []);
  const liveCurrent = useMemo(() => getCurrentSeasonRace(), []);
  const renderedRaces = liveRaces.length === races.length ? liveRaces : races;
  const renderedCurrentEventId = liveCurrent.race?.eventId ?? currentEventId;
  const renderedPhase = liveCurrent.phase ?? phase;

  useEffect(() => {
    const eventId = searchParams.get("event");
    if (!eventId) return;
    const target = document.getElementById(`race-${eventId}`);
    target?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [searchParams]);

  const currentIndex = renderedRaces.findIndex(
    (race) => race.eventId === renderedCurrentEventId,
  );
  const currentRace = renderedRaces[Math.max(0, currentIndex)] ?? renderedRaces[0];

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true" />
      <header className={styles.header}>
        <HomeBrandLink className={styles.brand} ariaLabel="返回主页顶部">
          <span>GRIDDELTA</span> <em>CN</em>
        </HomeBrandLink>
        <nav className={styles.nav} aria-label="Season navigation">
          <Link href="/">HOME</Link>
          <Link href="/atlas-v2">ATLAS</Link>
        </nav>
      </header>

      <section className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>2026 / SEASON INDEX</p>
          <h1>赛季赛历</h1>
          <p>22 场比赛，按真实赛历与赛道资料组织。选择任一比赛进入统一 Race Week Control。</p>
        </div>
        <div className={styles.actions}>
          {currentRace ? (
            <a className={styles.primaryAction} href={`#race-${currentRace.eventId}`}>
              跳至当前 / 下一站
            </a>
          ) : null}
          <a className={styles.secondaryAction} href="#race-australia-gp-2026">
            回到赛季开端
          </a>
          <Link className={styles.atlasAction} href="/atlas-v2">
            探索 ATLAS ↗
          </Link>
        </div>
      </section>

      <section className={styles.currentStrip} aria-label="Current race context">
        <span>{renderedPhase === "current" ? "LIVE WEEKEND" : "NEXT RACE"}</span>
        <strong>{currentRace?.race.name ?? "SEASON DATA"}</strong>
        <small>{currentRace ? formatRaceDateRange(currentRace) : "DATES TBC"}</small>
      </section>

      <div ref={listRef} className={styles.list}>
        {renderedRaces.map((race) => (
          <CalendarRow
            key={race.eventId}
            race={race}
            status={getCalendarDisplayStatus(
              race,
              renderedPhase,
              renderedCurrentEventId,
            )}
          />
        ))}
      </div>
      <footer className={styles.footer}>
        CALENDAR DATA / 2026 · ROUTES OPEN INTO A SINGLE EVENT DETAIL SYSTEM
      </footer>
    </main>
  );
}
