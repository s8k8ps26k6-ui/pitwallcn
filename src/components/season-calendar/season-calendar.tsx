"use client";

import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CircuitOutline } from "@/components/race-shared/circuit-outline";
import { HomeBrandLink } from "@/components/home-brand-link";
import {
  formatLocalDateTime,
  formatRaceDateRange,
  getCalendarDisplayStatus,
  getCountryFlag,
  getCurrentSeasonRace,
  getPrimaryRaceMoment,
  getSeasonRaces,
  getStatusLabel,
  type CalendarDisplayStatus,
  type RaceMoment,
  type UnifiedRace,
} from "@/lib/atlas/race-detail";
import { getEventTheme } from "@/lib/event-theme";
import styles from "./season-calendar-v2.module.css";

type SeasonCalendarProps = {
  races: readonly UnifiedRace[];
  currentEventId: string;
  phase: ReturnType<typeof getCurrentSeasonRace>["phase"];
};

function CalendarRow({
  race,
  status,
  focused,
  moment,
}: {
  race: UnifiedRace;
  status: CalendarDisplayStatus;
  focused: boolean;
  moment: RaceMoment | null;
}) {
  const detailHref = `/races/${race.season}/${race.eventId}` as Route;
  const sessionTime = moment?.isTimeConfirmed
    ? formatLocalDateTime(moment.startTime, race.circuit?.timeZone, "zh-CN")
    : "赛段时间待官方确认";

  return (
    <li className={styles.rowShell}>
      <Link
        id={`race-${race.eventId}`}
        className={styles.row}
        href={detailHref}
        data-calendar-status={status}
        data-calendar-focus={focused || undefined}
        aria-label={`打开 ${race.race.name}`}
      >
        <span className={styles.rowIndex}>
          <small>R</small>
          {String(race.race.round).padStart(2, "0")}
        </span>

        <span className={styles.rowTitle}>
          <span className={styles.location}>
            <i aria-hidden="true">{getCountryFlag(race.race.country)}</i>
            {race.race.country} · {race.race.city}
          </span>
          <strong className={styles.raceName}>{race.race.name}</strong>
          <span className={styles.circuitName}>{race.race.circuitName}</span>
        </span>

        <CircuitOutline
          outline={race.circuit?.outline}
          className={styles.trace}
          title={`${race.race.circuitName} 赛道轮廓`}
        />

        <span className={styles.rowDate}>
          <small>DATE</small>
          {formatRaceDateRange(race)}
        </span>

        <span className={styles.rowStatus}>
          <i aria-hidden="true" />
          {getStatusLabel(status)}
        </span>

        <span className={styles.rowArrow} aria-hidden="true">
          ↗
        </span>

        {focused && moment ? (
          <span className={styles.focusDetail}>
            <span>
              <small>下一节点</small>
              <strong>{moment.label}</strong>
              <time dateTime={moment.startTime}>{sessionTime}</time>
            </span>
            <b>
              进入 Race Week <i aria-hidden="true">→</i>
            </b>
          </span>
        ) : null}
      </Link>
    </li>
  );
}

export function SeasonCalendar({
  races,
  currentEventId,
  phase,
}: SeasonCalendarProps) {
  const searchParams = useSearchParams();
  const liveRaces = useMemo(() => getSeasonRaces(), []);
  const liveCurrent = useMemo(() => getCurrentSeasonRace(), []);
  const renderedRaces = liveRaces.length === races.length ? liveRaces : races;
  const renderedCurrentEventId = liveCurrent.race?.eventId ?? currentEventId;
  const renderedPhase = liveCurrent.phase ?? phase;
  const currentIndex = renderedRaces.findIndex(
    (race) => race.eventId === renderedCurrentEventId,
  );
  const currentRace =
    renderedRaces[Math.max(0, currentIndex)] ?? renderedRaces[0];
  const currentMoment = currentRace ? getPrimaryRaceMoment(currentRace) : null;
  const currentTheme = currentRace ? getEventTheme(currentRace.race.id) : null;
  const style = {
    "--season-progress": `${Math.max(0, ((currentIndex + 1) / renderedRaces.length) * 100)}%`,
    "--event-accent": currentTheme?.accent,
    "--event-accent-rgb": currentTheme?.accentRgb,
  } as CSSProperties;

  useEffect(() => {
    const requestedEventId = searchParams.get("event");
    if (!requestedEventId) return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`race-${requestedEventId}`)?.scrollIntoView({
        block: "center",
        behavior: "instant",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [searchParams]);

  return (
    <main className={styles.page} style={style}>
      <div className={styles.backdrop} aria-hidden="true" />

      <header className={styles.header}>
        <HomeBrandLink className={styles.brand} ariaLabel="返回主页顶部">
          LAPMETRY
        </HomeBrandLink>
        <nav className={styles.nav} aria-label="赛历导航">
          <Link href="/">首页</Link>
          <Link href="/atlas-v2">Atlas</Link>
        </nav>
      </header>

      <section className={styles.seasonHead} aria-labelledby="calendar-title">
        <div className={styles.seasonTitle}>
          <p>2026 Formula 1</p>
          <h1 id="calendar-title">赛季赛历</h1>
          <span>
            22 场比赛沿统一时间轴连续排列，赛道轮廓用于快速识别每一站。
          </span>
        </div>

        <div className={styles.seasonPosition}>
          <span>赛季位置</span>
          <strong>
            {String(Math.max(1, currentIndex + 1)).padStart(2, "0")}
            <small>/ {String(renderedRaces.length).padStart(2, "0")}</small>
          </strong>
          <p>{currentRace?.race.name ?? "赛季数据待确认"}</p>
          {currentRace ? (
            <a href={`#race-${currentRace.eventId}`}>定位当前站 ↓</a>
          ) : null}
        </div>
      </section>

      <section className={styles.seasonScale} aria-label="2026 赛季进度">
        <div className={styles.scaleLine} aria-hidden="true" />
        <ol>
          {renderedRaces.map((race) => {
            const status = getCalendarDisplayStatus(
              race,
              renderedPhase,
              renderedCurrentEventId,
            );
            return (
              <li
                key={race.eventId}
                data-scale-status={status}
                aria-label={`第 ${race.race.round} 轮 ${race.race.name}`}
              >
                <span />
              </li>
            );
          })}
        </ol>
      </section>

      <div className={styles.columnGuide} aria-hidden="true">
        <span>ROUND</span>
        <span>EVENT / LOCATION</span>
        <span>CIRCUIT</span>
        <span>DATE</span>
        <span>STATUS</span>
      </div>

      <ol className={styles.list}>
        {renderedRaces.map((race) => {
          const focused = race.eventId === renderedCurrentEventId;
          return (
            <CalendarRow
              key={race.eventId}
              race={race}
              focused={focused}
              moment={focused ? currentMoment : null}
              status={getCalendarDisplayStatus(
                race,
                renderedPhase,
                renderedCurrentEventId,
              )}
            />
          );
        })}
      </ol>

      <footer className={styles.footer}>
        <span>LAPMETRY · 2026 SEASON</span>
        <span>赛程与赛道字段来自统一赛历数据源</span>
      </footer>
    </main>
  );
}
