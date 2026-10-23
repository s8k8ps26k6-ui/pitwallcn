"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { CircuitOutline } from "@/components/race-shared/circuit-outline";
import {
  formatLocalDateTime,
  getCountryFlag,
  getPrimaryRaceMoment,
  type UnifiedRace,
} from "@/lib/atlas/race-detail";
import styles from "./hallmark-home-preview.module.css";

type Props = {
  race: UnifiedRace;
  phase: "current" | "next" | "off-season";
  raceRail: UnifiedRace[];
};

function shortName(name: string) {
  return name.replace(/ Grand Prix$/i, "");
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00.000Z`));
}

function phaseLabel(phase: Props["phase"]) {
  if (phase === "current") return "比赛周进行中";
  if (phase === "off-season") return "赛季间歇";
  return "下一站";
}

function countdown(targetIso: string, now: Date) {
  const ms = Math.max(0, Date.parse(targetIso) - now.getTime());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms / 3_600_000) % 24);
  const minutes = Math.floor((ms / 60_000) % 60);
  return `${String(days).padStart(2, "0")}D ${String(hours).padStart(2, "0")}H ${String(minutes).padStart(2, "0")}M`;
}

export function HallmarkHomePreview({ race, phase, raceRail }: Props) {
  const [now, setNow] = useState(() => new Date());
  const moment = useMemo(() => getPrimaryRaceMoment(race, now), [race, now]);
  const detailHref = `/races/${race.season}/${race.eventId}` as Route;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const localTime = moment.isTimeConfirmed
    ? formatLocalDateTime(moment.startTime, race.circuit?.timeZone, "zh-CN")
    : "赛段时间待确认";

  return (
    <main className={styles.page}>
      <header className={styles.navbar}>
        <Link className={styles.brand} href="/">LAPMETRY</Link>
        <div className={styles.navLinks}>
          <Link href="/schedule">赛历</Link>
          <Link href="/atlas-v2">Atlas</Link>
          <span>Hallmark Preview</span>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="preview-race-title">
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>
            <span>{phaseLabel(phase)}</span>
            <span>R{String(race.race.round).padStart(2, "0")}</span>
          </div>
          <p className={styles.place}>{getCountryFlag(race.race.country)} {race.race.city} · {race.race.country}</p>
          <h1 id="preview-race-title">
            {shortName(race.race.name)}
            <span>Grand Prix</span>
          </h1>
          <p className={styles.circuit}>{race.race.circuitName}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primary} href={detailHref}>进入比赛周</Link>
            <Link className={styles.secondary} href="/atlas-v2">查看赛道地图</Link>
          </div>
        </div>

        <div className={styles.trackStage}>
          <div className={styles.trackGlow} aria-hidden="true" />
          <CircuitOutline
            outline={race.circuit?.outline}
            className={styles.track}
            title={`${race.race.circuitName} 赛道轮廓`}
            showStartMarker
          />
          <div className={styles.trackMeta}>
            <span>{race.circuit?.lengthKm ? `${race.circuit.lengthKm.toFixed(3)} KM` : "LENGTH —"}</span>
            <span>{race.circuit?.laps ? `${race.circuit.laps} LAPS` : "LAPS —"}</span>
          </div>
        </div>
      </section>

      <section className={styles.telemetry} aria-label="下一赛段">
        <div>
          <span>NEXT SESSION</span>
          <strong>{moment.label}</strong>
        </div>
        <div>
          <span>LOCAL TIME</span>
          <strong>{localTime}</strong>
        </div>
        <div>
          <span>COUNTDOWN</span>
          <strong className={styles.mono}>{countdown(moment.startTime, now)}</strong>
        </div>
        <Link href="/live">Live Timing →</Link>
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.seasonPanel}>
          <div className={styles.sectionHead}>
            <span>2026 SEASON</span>
            <h2>赛季轨迹</h2>
          </div>
          <div className={styles.raceRail}>
            {raceRail.map((item) => {
              const active = item.eventId === race.eventId;
              return (
                <Link
                  href={`/races/${item.season}/${item.eventId}` as Route}
                  className={`${styles.raceItem} ${active ? styles.activeRace : ""}`}
                  key={item.eventId}
                >
                  <span>R{String(item.race.round).padStart(2, "0")}</span>
                  <strong>{shortName(item.race.name)}</strong>
                  <time>{shortDate(item.race.startDate)}</time>
                </Link>
              );
            })}
          </div>
        </article>

        <article className={styles.dataPanel}>
          <div className={styles.sectionHead}>
            <span>RACE DATA</span>
            <h2>本站数据</h2>
          </div>
          <dl className={styles.dataList}>
            <div><dt>比赛格式</dt><dd>{race.race.isSprint ? "SPRINT" : "GRAND PRIX"}</dd></div>
            <div><dt>赛道长度</dt><dd>{race.circuit?.lengthKm ? `${race.circuit.lengthKm.toFixed(3)} km` : "—"}</dd></div>
            <div><dt>正赛圈数</dt><dd>{race.circuit?.laps ?? "—"}</dd></div>
          </dl>
          <p className={styles.dataNote}>只展示统一赛历中已核验字段；未接入的数据保持空缺。</p>
        </article>
      </section>

      <footer className={styles.footer}>
        <span>LAPMETRY · Hallmark preview</span>
        <Link href="/">返回当前正式首页</Link>
      </footer>
    </main>
  );
}
