"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircuitOutline } from "@/components/race-shared/circuit-outline";
import {
  formatLocalDateTime,
  formatRaceDateRange,
  getCountryFlag,
  getPrimaryRaceMoment,
  getSessionLabel,
  type UnifiedRace,
} from "@/lib/atlas/race-detail";
import { getVenueModel } from "@/lib/atlas/venue-model";
import styles from "./race-detail.module.css";

type Section = "overview" | "sessions" | "records" | "history";

function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

function formatCountdown(targetIso: string, now: Date) {
  const ms = Math.max(0, Date.parse(targetIso) - now.getTime());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms / 3_600_000) % 24);
  const minutes = Math.floor((ms / 60_000) % 60);
  const seconds = Math.floor((ms / 1_000) % 60);
  return [days, hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(" : ");
}

function SessionTimeline({ race }: { race: UnifiedRace }) {
  if (!race.sessions.length) {
    return <EmptyState label="SESSION TIMETABLE" detail="No session timetable is available from the current verified calendar source." />;
  }

  return (
    <ol className={styles.sessionTimeline}>
      {race.sessions.map((session, index) => {
        const confirmed = Boolean(session.isTimeConfirmed);
        return (
          <li key={`${session.startTime}-${index}`} data-confirmed={confirmed}>
            <span className={styles.sessionIndex}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.sessionName}>
              {getSessionLabel(session, index, race.race.isSprint)}
            </span>
            <span className={styles.sessionTime}>
              {confirmed
                ? formatLocalDateTime(session.startTime, race.circuit?.timeZone)
                : "TIME TBC"}
            </span>
            <span className={styles.sessionState}>{confirmed ? "CONFIRMED" : "PENDING"}</span>
            <span className={styles.sessionResult}>RESULT —</span>
          </li>
        );
      })}
    </ol>
  );
}

function EmptyState({ label, detail }: { label: string; detail: string }) {
  return (
    <div className={styles.emptyState}>
      <span>{label}</span>
      <p>{detail}</p>
      <small>NO UNVERIFIED PLACEHOLDER DATA IS SHOWN.</small>
    </div>
  );
}

function VenueStage({ race }: { race: UnifiedRace }) {
  const venue = getVenueModel(race.circuitId);

  return (
    <section className={styles.venueStage} aria-label={`${race.race.circuitName} venue overview`}>
      <div className={styles.venueGrid} aria-hidden="true" />
      <div className={styles.venueOrbit} aria-hidden="true" />
      <div className={styles.stageCoordinates}>
        <span>LAT {race.race.latitude.toFixed(4)}°</span>
        <span>LON {race.race.longitude.toFixed(4)}°</span>
      </div>
      <CircuitOutline
        outline={race.circuit?.outline}
        className={styles.heroTrace}
        title={`${race.race.circuitName} verified circuit outline`}
        showStartMarker
      />
      <div className={styles.venueNote}>
        <span>TRACK TOPOLOGY / VERIFIED</span>
        <p>{venue.note}</p>
      </div>
    </section>
  );
}

export function RaceDetailView({ race }: { race: UnifiedRace }) {
  const now = useNow();
  const searchParams = useSearchParams();
  const [section, setSection] = useState<Section>("overview");
  const moment = useMemo(() => getPrimaryRaceMoment(race, now), [now, race]);
  const returnToAtlas = searchParams.get("from") === "atlas";
  const returnHref = returnToAtlas
    ? `/atlas-v2?station=${race.eventId}`
    : `/schedule?event=${race.eventId}`;
  const returnLabel = returnToAtlas ? "返回 Atlas" : "返回赛历";
  const metricRows = [
    { label: "LENGTH", value: race.circuit?.lengthKm ? `${race.circuit.lengthKm.toFixed(3)} KM` : "TBC" },
    { label: "LAPS", value: race.circuit?.laps ? String(race.circuit.laps) : "TBC" },
    { label: "TIME ZONE", value: race.circuit?.timeZone ?? "TBC" },
    { label: "WEEKEND", value: race.race.isSprint ? "SPRINT FORMAT" : "GRAND PRIX" },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true" />
      <header className={styles.header}>
        <Link className={styles.brand} href="/">GRIDDELTA <em>CN</em></Link>
        <div className={styles.headerMeta}>
          <span>2026 / ROUND {String(race.race.round).padStart(2, "0")}</span>
          <Link href="/schedule">SEASON INDEX</Link>
        </div>
      </header>

      <nav className={styles.sectionNav} aria-label="Race detail sections">
        {(["overview", "sessions", "records", "history"] as const).map((item) => (
          <button
            key={item}
            type="button"
            data-active={section === item}
            onClick={() => setSection(item)}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </nav>

      <section className={styles.hero}>
        <div className={styles.raceIdentity}>
          <p className={styles.kicker}>
            <span className={styles.flag}>{getCountryFlag(race.race.country)}</span>
            {race.race.country} / {race.race.city}
          </p>
          <h1>{race.race.name}</h1>
          <p className={styles.circuitName}>{race.race.circuitName}</p>
          <div className={styles.raceMeta}>
            <span>{formatRaceDateRange(race)}</span>
            <span>{race.race.isSprint ? "SPRINT WEEKEND" : "GRAND PRIX WEEKEND"}</span>
          </div>
        </div>

        <VenueStage race={race} />

        <aside className={styles.signalPanel}>
          <p>NEXT SIGNAL</p>
          <strong>{moment.label}</strong>
          <span>
            {moment.isTimeConfirmed
              ? formatLocalDateTime(moment.startTime, race.circuit?.timeZone)
              : "WEEKEND START / TIME TBC"}
          </span>
          <output>{formatCountdown(moment.startTime, now)}</output>
          <small>{moment.isTimeConfirmed ? "LOCAL COUNTDOWN" : "COUNTDOWN TO WEEKEND"}</small>
        </aside>
      </section>

      <section className={styles.content} data-section={section}>
        {section === "overview" ? (
          <div className={styles.overviewGrid}>
            <article className={styles.overviewBlock}>
              <p className={styles.blockKicker}>RACE WEEK STATUS</p>
              <h2>{moment.label}</h2>
              <p className={styles.bodyCopy}>
                {moment.isTimeConfirmed
                  ? "The next confirmed session is shown in circuit local time."
                  : "The verified calendar confirms the race-weekend dates; individual session times are not yet confirmed."}
              </p>
              <button
                type="button"
                className={styles.enterAction}
                onClick={() => setSection("sessions")}
              >
                查看比赛周日程 ↘
              </button>
            </article>
            <article className={styles.metricsBlock}>
              <p className={styles.blockKicker}>CIRCUIT DATA</p>
              <dl>
                {metricRows.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
            <article className={styles.weatherBlock}>
              <p className={styles.blockKicker}>TRACK CONDITIONS</p>
              <EmptyState
                label="LIVE WEATHER"
                detail="Live circuit weather is not available for this event from the current verified data source."
              />
            </article>
          </div>
        ) : null}

        {section === "sessions" ? <SessionTimeline race={race} /> : null}
        {section === "records" ? (
          <div className={styles.archiveGrid}>
            <EmptyState label="FASTEST RACE LAP" detail="Verified circuit records are not yet attached to this event record." />
            <EmptyState label="POLE RECORD" detail="Verified qualifying records are not yet attached to this event record." />
            <EmptyState label="MOST WINS" detail="Driver and team history will appear only after source verification." />
          </div>
        ) : null}
        {section === "history" ? (
          <div className={styles.archiveGrid}>
            <EmptyState label="PAST WINNERS" detail="Champion history is awaiting a separately verified historical data source." />
            <EmptyState label="CIRCUIT EVOLUTION" detail="No venue-change narrative is shown until a source is recorded." />
            <EmptyState label="CLASSIC RACES" detail="Editorial race history has not been published for this event." />
          </div>
        ) : null}
      </section>

      <footer className={styles.footer}>
        <Link href={returnHref as Route}>← {returnLabel}</Link>
        <span>EVENT {race.eventId} · CIRCUIT {race.circuitId}</span>
        <span>CALENDAR SOURCE / {race.source}</span>
      </footer>
    </main>
  );
}
