"use client";

import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CircuitOutline } from "@/components/race-shared/circuit-outline";
import { HomeBrandLink } from "@/components/home-brand-link";
import {
  formatLocalDateTime,
  getCountryFlag,
  getPrimaryRaceMoment,
  type UnifiedRace,
} from "@/lib/atlas/race-detail";
import { getEventTheme } from "@/lib/event-theme";
import styles from "./homepage-v3.module.css";

function getCountdown(targetIso: string, now: Date) {
  const ms = Math.max(0, Date.parse(targetIso) - now.getTime());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
  };
}

function formatRaceDates(race: UnifiedRace) {
  const format = new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });
  return `${format.format(new Date(`${race.race.startDate}T12:00:00.000Z`))} — ${format.format(new Date(`${race.race.endDate}T12:00:00.000Z`))}`;
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
  return phase === "current"
    ? "比赛周进行中"
    : phase === "off-season"
      ? "赛季间歇"
      : "下一场比赛";
}

function getRaceWeekProgress(race: UnifiedRace, now: Date) {
  const start = Date.parse(`${race.race.startDate}T00:00:00.000Z`);
  const end = Date.parse(`${race.race.endDate}T23:59:59.999Z`);
  if (now.getTime() < start)
    return {
      label: "赛前待命",
      detail: `比赛周始于 ${formatShortDate(race.race.startDate)}`,
      progress: 0,
    };
  if (now.getTime() > end)
    return {
      label: "比赛周已完成",
      detail: "等待已核验的赛后结果与复盘。",
      progress: 100,
    };
  return {
    label: "比赛周进行中",
    detail: "赛段、Live Timing 与赛会信息会按可靠数据源更新。",
    progress: Math.round(((now.getTime() - start) / (end - start)) * 100),
  };
}

function getRailState(
  item: UnifiedRace,
  selected: UnifiedRace,
  phase: "current" | "next" | "off-season",
) {
  if (item.eventId === selected.eventId)
    return phase === "current" ? "当前" : "下一站";
  return Date.parse(`${item.race.endDate}T23:59:59.999Z`) < Date.now()
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
  const railItemsRef = useRef<HTMLDivElement>(null);
  const activeRailRef = useRef<HTMLAnchorElement>(null);
  const moment = useMemo(() => getPrimaryRaceMoment(race, now), [race, now]);
  const countdown = getCountdown(moment.startTime, now);
  const theme = getEventTheme(race.race.id);
  const week = getRaceWeekProgress(race, now);
  const detailHref = `/races/${race.season}/${race.eventId}` as Route;
  const localSessionTime = moment.isTimeConfirmed
    ? formatLocalDateTime(moment.startTime, race.circuit?.timeZone, "zh-CN")
    : "比赛周起始时间待官方赛段确认";
  const style = {
    "--event-accent": theme.accent,
    "--event-accent-rgb": theme.accentRgb,
    "--event-support": theme.support,
    "--week-progress": `${week.progress}%`,
  } as CSSProperties;

  useEffect(() => {
    let timer: number | undefined;
    const sync = () => {
      if (timer) window.clearInterval(timer);
      setNow(new Date());
      if (!document.hidden)
        timer = window.setInterval(() => setNow(new Date()), 60_000);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const container = railItemsRef.current;
    const active = activeRailRef.current;
    if (!container || !active) return;

    const frame = window.requestAnimationFrame(() => {
      container.scrollTo({
        left:
          active.offsetLeft - (container.clientWidth - active.clientWidth) / 2,
        behavior: "auto",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [race.eventId]);

  return (
    <main className={styles.page} style={style}>
      <div className={styles.backdrop} aria-hidden="true" />
      <header className={styles.header}>
        <HomeBrandLink className={styles.brand} ariaLabel="返回主页顶部">
          LAPMETRY
        </HomeBrandLink>
        <nav className={styles.nav} aria-label="主要导航">
          <Link href="/schedule">赛历</Link>
          <Link href="/atlas-v2">Atlas</Link>
        </nav>
      </header>

      <section
        className={styles.hero}
        aria-labelledby="race-title"
      >
        <div
          className={styles.heroWord}
          aria-hidden="true"
        >
          {getGrandPrixTitle(race.race.name)}
        </div>
        <div
          className={styles.scene}
          aria-hidden="true"
        >
          <div
            className={styles.sceneHalo}
          />
          <div
            className={styles.sceneContour}
          />
          <CircuitOutline
            outline={race.circuit?.outline}
            className={`${styles.track} ${styles.trackDepth}`}
            title=""
          />
          <CircuitOutline
            outline={race.circuit?.outline}
            className={`${styles.track} ${styles.trackBase}`}
            title=""
          />
          <CircuitOutline
            outline={race.circuit?.outline}
            className={`${styles.track} ${styles.trackEdge}`}
            title=""
            showStartMarker
          />
          <CircuitOutline
            outline={race.circuit?.outline}
            className={`${styles.track} ${styles.trackFlow}`}
            title=""
          />
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.meta}>
            <span>{getPhaseLabel(phase)}</span>2026 赛季 · 第 {race.race.round}{" "}
            轮
          </p>
          <p className={styles.country}>
            {getCountryFlag(race.race.country)} {race.race.country} ·{" "}
            {race.race.city}
          </p>
          <h1 id="race-title">
            {getGrandPrixTitle(race.race.name)} <span>GRAND PRIX</span>
          </h1>
          <div className={styles.raceFacts}>
            <p className={styles.circuit}>{race.race.circuitName}</p>
            <p className={styles.dates}>{formatRaceDates(race)}</p>
          </div>
        </div>
        <section className={styles.session} aria-label="下一场赛段">
          <p>下一 Session</p>
          <strong>{moment.label}</strong>
          <time dateTime={moment.startTime}>{localSessionTime}</time>
          <div className={styles.countdown} aria-label="倒计时">
            <span>
              <b>{String(countdown.days).padStart(2, "0")}</b>天
            </span>
            <span>
              <b>{String(countdown.hours).padStart(2, "0")}</b>时
            </span>
            <span>
              <b>{String(countdown.minutes).padStart(2, "0")}</b>分
            </span>
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

      <section className={styles.rail} aria-labelledby="season-rail-title">
        <header>
          <p>赛季轨迹</p>
          <h2 id="season-rail-title">上一站 · 当前站 · 下一站</h2>
        </header>
        <div className={styles.railItems} ref={railItemsRef}>
          {raceRail.map((item) => {
            const active = item.eventId === race.eventId;
            return (
              <Link
                ref={active ? activeRailRef : undefined}
                href={`/races/${item.season}/${item.eventId}` as Route}
                className={`${styles.railItem} ${active ? styles.railItemActive : ""}`}
                key={item.eventId}
              >
                <span>{getRailState(item, race, phase)}</span>
                <b>R{String(item.race.round).padStart(2, "0")}</b>
                <i>{getCountryFlag(item.race.country)}</i>
                <strong>{getGrandPrixTitle(item.race.name)}</strong>
                <time>{formatShortDate(item.race.startDate)}</time>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.operations} aria-label="本站运行摘要">
        <div className={styles.weekStatus}>
          <div>
            <p>比赛周状态</p>
            <strong>{week.label}</strong>
            <small>{week.detail}</small>
          </div>
          <Link href="/live">
            Live Timing <em>赛时开启</em>
            <b aria-hidden="true">→</b>
          </Link>
        </div>
        <div className={styles.metrics}>
          <p>本站关键数据</p>
          <div>
            <strong>
              {race.circuit?.lengthKm ? race.circuit.lengthKm.toFixed(3) : "—"}
              <small>公里</small>
            </strong>
            <strong>
              {race.circuit?.laps ?? "—"}
              <small>正赛圈数</small>
            </strong>
            <strong>
              {race.race.isSprint ? "SPRINT" : "GP"}
              <small>比赛格式</small>
            </strong>
          </div>
        </div>
        <div className={styles.standings}>
          <p>冠军积分</p>
          <strong>等待已核验排名快照</strong>
          <small>项目现有静态 fallback 不作为真实前三展示。</small>
          <Link href="/standings">查看积分入口 →</Link>
        </div>
      </section>
      <footer className={styles.footer}>
        <span>LAPMETRY · 2026 F1 SEASON</span>
        <span>赛程与赛道字段来自统一赛历数据源</span>
      </footer>
    </main>
  );
}
