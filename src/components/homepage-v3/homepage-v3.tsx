"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { CircuitOutline } from "@/components/race-shared/circuit-outline";
import {
  formatLocalDateTime,
  formatRaceDateRange,
  getCountryFlag,
  getPrimaryRaceMoment,
  type UnifiedRace,
} from "@/lib/atlas/race-detail";
import styles from "./homepage-v3.module.css";

function getCountdown(targetIso: string, now: Date) {
  const remaining = Math.max(0, Date.parse(targetIso) - now.getTime());
  const units = [
    Math.floor(remaining / 86_400_000),
    Math.floor((remaining / 3_600_000) % 24),
    Math.floor((remaining / 60_000) % 60),
  ];
  return units.map((value) => String(value).padStart(2, "0"));
}

export function HomepageV3({ race, phase }: { race: UnifiedRace; phase: "current" | "next" | "off-season" }) {
  const [now, setNow] = useState(() => new Date());
  const moment = useMemo(() => getPrimaryRaceMoment(race, now), [now, race]);
  const countdown = getCountdown(moment.startTime, now);
  const detailHref = `/races/${race.season}/${race.eventId}` as Route;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.space} aria-hidden="true" />
      <header className={styles.header}>
        <Link className={styles.brand} href="/">GRIDDELTA <em>CN</em></Link>
        <nav className={styles.nav} aria-label="GridDelta navigation">
          <Link href="/schedule">赛历</Link>
          <Link href="/atlas-v2">ATLAS</Link>
          <Link href="/live">LIVE</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span>{phase === "current" ? "LIVE RACE WEEK" : "NEXT RACE SIGNAL"}</span>
            2026 / ROUND {String(race.race.round).padStart(2, "0")}
          </p>
          <p className={styles.location}>
            {getCountryFlag(race.race.country)} {race.race.country} · {race.race.city}
          </p>
          <h1>{race.race.name}</h1>
          <p className={styles.circuit}>{race.race.circuitName}</p>
          <p className={styles.date}>{formatRaceDateRange(race)}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href={detailHref}>
              进入比赛周 <span>↗</span>
            </Link>
            <Link className={styles.secondaryAction} href="/schedule">查看赛历</Link>
            <Link className={styles.secondaryAction} href="/atlas-v2">探索 Atlas</Link>
          </div>
        </div>

        <div className={styles.trackVisual} aria-label={`${race.race.circuitName} circuit trace`}>
          <div className={styles.orbitOne} aria-hidden="true" />
          <div className={styles.orbitTwo} aria-hidden="true" />
          <div className={styles.coordinates} aria-hidden="true">
            <span>{Math.abs(race.race.latitude).toFixed(3)}° {race.race.latitude >= 0 ? "N" : "S"}</span>
            <span>{Math.abs(race.race.longitude).toFixed(3)}° {race.race.longitude >= 0 ? "E" : "W"}</span>
          </div>
          <CircuitOutline
            outline={race.circuit?.outline}
            className={styles.trace}
            title={`${race.race.circuitName} verified circuit outline`}
            showStartMarker
          />
          <span className={styles.traceCaption}>VERIFIED CIRCUIT TOPOLOGY</span>
        </div>

        <aside className={styles.signalPanel}>
          <p>UP NEXT</p>
          <strong>{moment.label}</strong>
          <span>
            {moment.isTimeConfirmed
              ? formatLocalDateTime(moment.startTime, race.circuit?.timeZone)
              : "RACE WEEKEND START / TIME TBC"}
          </span>
          <div className={styles.countdown} aria-label="Countdown">
            <div><b>{countdown[0]}</b><small>DAYS</small></div>
            <div><b>{countdown[1]}</b><small>HRS</small></div>
            <div><b>{countdown[2]}</b><small>MIN</small></div>
          </div>
          <Link href={detailHref}>RACE WEEK CONTROL ↗</Link>
        </aside>
      </section>

      <section className={styles.commandBand} aria-label="Product entries">
        <Link href="/live">
          <span>01 / LIVE TIMING</span>
          <strong>实时计时</strong>
          <p>比赛进行时，位置、间隔和进站变化集中在一条清晰时间线上。</p>
        </Link>
        <Link href={detailHref}>
          <span>02 / RACE WEEK</span>
          <strong>单站控制档案</strong>
          <p>赛段、赛道参数、已确认日程与可用的赛事数据汇入同一比赛站。</p>
        </Link>
        <Link href="/standings">
          <span>03 / SEASON</span>
          <strong>赛季数据</strong>
          <p>进入车手、车队积分和逐站结果，保留连续的赛季上下文。</p>
        </Link>
      </section>

      <footer className={styles.footer}>
        <span>GRIDDELTA CN / F1 DATA IN MOTION</span>
        <span>CALENDAR · ATLAS · RACE WEEK CONTROL</span>
      </footer>
    </main>
  );
}
