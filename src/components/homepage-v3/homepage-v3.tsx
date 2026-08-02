"use client";

import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { CircuitOutline } from "@/components/race-shared/circuit-outline";
import {
  formatLocalDateTime,
  getCountryFlag,
  getPrimaryRaceMoment,
  type UnifiedRace,
} from "@/lib/atlas/race-detail";
import styles from "./homepage-v3.module.css";

type EventTheme = {
  accent: string;
  accentRgb: string;
  support: string;
};

const DEFAULT_THEME: EventTheme = {
  accent: "#d7b56d",
  accentRgb: "215 181 109",
  support: "#4d8ba9",
};

const EVENT_THEMES: Partial<Record<string, EventTheme>> = {
  netherlands: { accent: "#d9a35a", accentRgb: "217 163 90", support: "#28749c" },
  belgium: { accent: "#d6a566", accentRgb: "214 165 102", support: "#55758a" },
  hungary: { accent: "#cc866d", accentRgb: "204 134 109", support: "#65769c" },
  italy: { accent: "#b8c77a", accentRgb: "184 199 122", support: "#477f78" },
  monaco: { accent: "#d9b09a", accentRgb: "217 176 154", support: "#6f5d98" },
  singapore: { accent: "#ce816d", accentRgb: "206 129 109", support: "#3c87a1" },
  japan: { accent: "#cf8c83", accentRgb: "207 140 131", support: "#5475a1" },
  australia: { accent: "#d3b16c", accentRgb: "211 177 108", support: "#3d87a9" },
  "united-states": { accent: "#cb9d73", accentRgb: "203 157 115", support: "#476da4" },
  mexico: { accent: "#caa66b", accentRgb: "202 166 107", support: "#467f80" },
  "sao-paulo": { accent: "#c0b66f", accentRgb: "192 182 111", support: "#408475" },
  qatar: { accent: "#c69b80", accentRgb: "198 155 128", support: "#6d608d" },
};

function getCountdown(targetIso: string, now: Date) {
  const remaining = Math.max(0, Date.parse(targetIso) - now.getTime());
  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
  };
}

function formatRaceDates(race: UnifiedRace) {
  const format = new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });
  const start = format.format(new Date(`${race.race.startDate}T12:00:00.000Z`));
  const end = format.format(new Date(`${race.race.endDate}T12:00:00.000Z`));
  return `${start} — ${end}`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00.000Z`));
}

function getGrandPrixTitle(name: string) {
  return name.replace(/ Grand Prix$/i, "");
}

function getPhaseLabel(phase: "current" | "next" | "off-season") {
  if (phase === "current") return "比赛周进行中";
  if (phase === "off-season") return "赛季收官后";
  return "下一场比赛";
}

function getRailState(
  item: UnifiedRace,
  selected: UnifiedRace,
  phase: "current" | "next" | "off-season",
) {
  if (item.eventId === selected.eventId) return phase === "current" ? "当前" : "下一站";
  return new Date(`${item.race.endDate}T23:59:59.999Z`).getTime() < Date.now()
    ? "已结束"
    : "随后";
}

export function HomepageV3({
  race,
  phase,
  raceRail,
}: {
  race: UnifiedRace;
  phase: "current" | "next" | "off-season";
  raceRail: UnifiedRace[];
}) {
  const [now, setNow] = useState(() => new Date());
  const moment = useMemo(() => getPrimaryRaceMoment(race, now), [now, race]);
  const countdown = getCountdown(moment.startTime, now);
  const theme = EVENT_THEMES[race.race.id] ?? DEFAULT_THEME;
  const detailHref = `/races/${race.season}/${race.eventId}` as Route;
  const localSessionTime = moment.isTimeConfirmed
    ? formatLocalDateTime(moment.startTime, race.circuit?.timeZone, "zh-CN")
    : "比赛周起始时间待官方赛段确认";
  const themeStyle = {
    "--event-accent": theme.accent,
    "--event-accent-rgb": theme.accentRgb,
    "--event-support": theme.support,
  } as CSSProperties;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className={styles.page} style={themeStyle}>
      <div className={styles.backdrop} aria-hidden="true" />
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          GRIDDELTA <em>CN</em>
        </Link>
        <nav className={styles.nav} aria-label="GridDelta navigation">
          <Link href="/schedule">赛历</Link>
          <Link href="/atlas-v2">Atlas</Link>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="race-title">
        <div className={styles.heroBackdropTitle} aria-hidden="true">
          {getGrandPrixTitle(race.race.name)}
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.raceMeta}>
            <span>{getPhaseLabel(phase)}</span>
            2026 赛季 · 第 {race.race.round} 轮
          </p>
          <p className={styles.country}>
            {getCountryFlag(race.race.country)} {race.race.country} · {race.race.city}
          </p>
          <h1 id="race-title">
            {getGrandPrixTitle(race.race.name)} <span>GRAND PRIX</span>
          </h1>
          <p className={styles.circuit}>{race.race.circuitName}</p>
          <p className={styles.weekendDates}>{formatRaceDates(race)}</p>
        </div>

        <div className={styles.trackStage} aria-label={`${race.race.circuitName} circuit model`}>
          <div className={styles.trackHalo} aria-hidden="true" />
          <div className={styles.trackRings} aria-hidden="true" />
          <CircuitOutline
            outline={race.circuit?.outline}
            className={`${styles.trackLayer} ${styles.trackDepth}`}
            title={`${race.race.circuitName} circuit depth layer`}
          />
          <CircuitOutline
            outline={race.circuit?.outline}
            className={`${styles.trackLayer} ${styles.trackMid}`}
            title={`${race.race.circuitName} circuit model`}
          />
          <CircuitOutline
            outline={race.circuit?.outline}
            className={`${styles.trackLayer} ${styles.trackTop}`}
            title={`${race.race.circuitName} circuit outline`}
            showStartMarker
          />
          <p className={styles.trackLocation}>{race.race.city}</p>
        </div>

        <section className={styles.sessionPanel} aria-label="Next session">
          <p className={styles.sessionLabel}>下一 Session</p>
          <strong>{moment.label}</strong>
          <time dateTime={moment.startTime}>{localSessionTime}</time>
          <div className={styles.countdown} aria-label="Countdown to next session">
            <span><b>{String(countdown.days).padStart(2, "0")}</b>天</span>
            <span><b>{String(countdown.hours).padStart(2, "0")}</b>时</span>
            <span><b>{String(countdown.minutes).padStart(2, "0")}</b>分</span>
          </div>
          <Link className={styles.primaryAction} href={detailHref}>
            进入比赛周 <span aria-hidden="true">→</span>
          </Link>
          <div className={styles.secondaryLinks}>
            <Link href="/schedule">查看赛历</Link>
            <Link href="/atlas-v2">探索 Atlas</Link>
          </div>
        </section>
      </section>

      <section className={styles.raceRail} aria-labelledby="season-rail-title">
        <div className={styles.sectionHeading}>
          <p>赛季进度</p>
          <h2 id="season-rail-title">上一站 · 当前站 · 下一站</h2>
        </div>
        <div className={styles.railItems}>
          {raceRail.map((item) => {
            const state = getRailState(item, race, phase);
            const active = item.eventId === race.eventId;
            return (
              <Link
                className={`${styles.railItem} ${active ? styles.railItemActive : ""}`}
                href={`/races/${item.season}/${item.eventId}` as Route}
                key={item.eventId}
              >
                <span className={styles.railState}>{state}</span>
                <span className={styles.railRound}>R{String(item.race.round).padStart(2, "0")}</span>
                <span className={styles.railFlag}>{getCountryFlag(item.race.country)}</span>
                <span className={styles.railName}>{getGrandPrixTitle(item.race.name)}</span>
                <span className={styles.railDate}>{formatShortDate(item.race.startDate)}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.dataDeck} aria-label="Race data summary">
        <Link className={styles.liveStatus} href="/live">
          <span className={styles.dataKicker}>LIVE TIMING</span>
          <strong>{phase === "current" ? "比赛周数据窗口" : "赛时开启"}</strong>
          <p>
            {phase === "current"
              ? "实时计时入口已就绪，数据流取决于 OpenF1 当期可用性。"
              : "比赛周开始后可进入实时计时；当前不伪造实时圈速。"}
          </p>
          <span className={styles.dataArrow} aria-hidden="true">→</span>
        </Link>

        <article className={styles.circuitData}>
          <span className={styles.dataKicker}>本站关键数据</span>
          <div>
            <strong>{race.circuit?.lengthKm ? `${race.circuit.lengthKm.toFixed(3)} KM` : "长度待确认"}</strong>
            <strong>{race.circuit?.laps ? `${race.circuit.laps} 圈` : "圈数待确认"}</strong>
            <strong>{race.race.isSprint ? "冲刺周末" : "常规周末"}</strong>
          </div>
          <p>赛道字段来自统一 circuit registry。</p>
        </article>

        <Link className={styles.standingsStatus} href="/standings">
          <span className={styles.dataKicker}>冠军积分</span>
          <strong>已核验快照待接入</strong>
          <p>当前项目的静态 fallback 不作为真实积分榜展示。</p>
          <span className={styles.dataArrow} aria-hidden="true">→</span>
        </Link>
      </section>

      <footer className={styles.footer}>
        <span>GRIDDELTA CN · 2026 F1 SEASON</span>
        <span>赛事与赛道字段使用统一赛历数据源</span>
      </footer>
    </main>
  );
}
