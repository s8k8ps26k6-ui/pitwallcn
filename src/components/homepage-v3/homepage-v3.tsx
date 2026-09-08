"use client";

import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { HomeBrandLink } from "@/components/home-brand-link";
import { formatRaceDateRange, formatLocalDateTime, getPrimaryRaceMoment, type UnifiedRace } from "@/lib/atlas/race-detail";
import { getEventTheme } from "@/lib/event-theme";
import { CircuitField } from "./circuit-field";
import { HomeCountryFlag } from "./home-country-flag";
import styles from "./homepage-v3.module.css";

export function HomepageV3({race, phase, raceRail, seasonCount}: {
  race: UnifiedRace; phase: "current" | "next" | "off-season"; raceRail: UnifiedRace[]; seasonCount: number;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const moment = getPrimaryRaceMoment(race, now ?? new Date(race.race.startDate + "T00:00:00Z"));
  const theme = getEventTheme(race.race.id);
  const previous = raceRail.find(item => item.race.round < race.race.round);
  const next = raceRail.find(item => item.race.round > race.race.round);
  const title = race.race.name.replace(/ Grand Prix$/i, "");
  const href = (item: UnifiedRace) => `/races/${item.season}/${item.eventId}` as Route;
  const style = {
    "--home-ambient": theme.support,
    "--home-event": theme.accent,
    "--home-light-direction": `${128 + (race.race.longitude / 180) * 12}deg`,
  } as CSSProperties;
  return <main className={styles.page} style={style}>
    <div className={styles.surface} aria-hidden="true" />
    <div className={styles.scene}>
      <header className={styles.header}>
        <HomeBrandLink className={styles.brand} ariaLabel="返回主页顶部">LAPMETRY</HomeBrandLink>
        <nav aria-label="主要导航"><Link href="/schedule">赛历</Link><Link href="/atlas-v2">Atlas</Link></nav>
      </header>
      <div className={styles.identity}>
        <p className={styles.formula}><HomeCountryFlag country={race.race.country} /> Formula 1 <span className={styles.round}>R{race.race.round}</span></p>
        <h1 className={styles.title} data-long={title.length > 16}>{title}<span>Grand Prix</span></h1>
        <p className={styles.dates}>{formatRaceDateRange(race)} {race.season}</p>
      </div>
      <CircuitField outline={race.circuit?.outline} desktop={false} title={race.race.circuitName}/>
      <CircuitField outline={race.circuit?.outline} desktop title={race.race.circuitName}/>
      <CircuitField outline={race.circuit?.outline} desktop={false} landscape title={race.race.circuitName}/>
      <p className={styles.length}><strong>{race.circuit?.lengthKm?.toFixed(3) ?? "—"}</strong><span>KM</span></p>
      <p className={styles.laps}><strong>{race.circuit?.laps ?? "—"}</strong><span>LAPS</span></p>
      <div className={styles.session}>
        <p className={styles.status}><i aria-hidden="true"/>{moment.isTimeConfirmed ? (phase === "current" ? "比赛周进行中" : "赛程已确认") : "赛程待确认"}</p>
        <p className={styles.sessionLabel}>Next Session</p>
        <h2>{moment.kind === "weekend" ? "Race Weekend" : moment.label}</h2>
        {moment.isTimeConfirmed
          ? <time dateTime={moment.startTime}>{formatLocalDateTime(moment.startTime, race.circuit?.timeZone, "zh-CN")}</time>
          : <p className={styles.sessionTime}>具体赛段时间待官方确认</p>}
        <Link className={styles.weekendLink} href={href(race)}>查看比赛周 <span aria-hidden="true">↗</span></Link>
      </div>
      <Link href={href(race)} className={styles.currentRace}><strong>{race.race.city}</strong><span>R{race.race.round} · {race.race.country}</span></Link>
      {previous && <Link className={styles.previous} href={href(previous)} aria-label={`R${previous.race.round} ${previous.race.name}`}>R{previous.race.round}</Link>}
      {next && <Link className={styles.next} href={href(next)} aria-label={`R${next.race.round} ${next.race.name}`}>R{next.race.round}</Link>}
      <a className={styles.continueHint} href="#season-continuation">赛季继续 <span aria-hidden="true">↓</span></a>
      <div className={styles.sceneFooter}><span>{race.season} · {race.race.round} / {seasonCount}</span><time suppressHydrationWarning>{now ? now.toLocaleTimeString("en-GB", {hour:"2-digit",minute:"2-digit",timeZone:"UTC"}) : "—"} UTC</time></div>
    </div>
    <nav id="season-continuation" className={styles.continuation} aria-label="赛季延续">
      {raceRail.map(item => <Link key={item.eventId} href={href(item)} aria-current={item.eventId === race.eventId ? "page" : undefined}>
        <span className={styles.stop}><i/>R{item.race.round}</span>
        <strong>{item.race.city}</strong><span>{item.race.name}</span>
        <time dateTime={item.race.startDate}>{formatRaceDateRange(item)}</time>
      </Link>)}
    </nav>
    <footer className={styles.footer}><Link href="/schedule">完整赛历 ↗</Link><span>时间以官方确认赛程为准</span></footer>
  </main>;
}
