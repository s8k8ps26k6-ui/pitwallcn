"use client";

import { BackNavigation } from "@/components/back-navigation";
import { TechnicalCircuitMap } from "@/components/race-shared/technical-circuit-map";
import type { RaceOutlookReport } from "@/lib/race-outlook-types";
import {
  formatRaceDateRange,
  getCountryFlag,
  type UnifiedRace,
} from "@/lib/atlas/race-detail";
import styles from "./race-detail.module.css";

type DetailProps = {
  race: UnifiedRace;
  outlook: RaceOutlookReport | null;
};

function StaticFact({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className={styles.staticFact}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

export function RaceDetailView({ race }: DetailProps) {
  const circuit = race.circuit;
  const length = circuit?.lengthKm ? `${circuit.lengthKm.toFixed(3)} KM` : "UNVERIFIED";
  const laps = circuit?.laps ? `${circuit.laps} LAPS` : "UNVERIFIED";
  const raceDistance = circuit?.lengthKm && circuit?.laps
    ? `${(circuit.lengthKm * circuit.laps).toFixed(3)} KM`
    : "UNVERIFIED";
  const profileSummary = circuit?.lengthKm && circuit?.laps
    ? `${race.race.name} 的比赛场地，位于 ${race.race.city}。当前赛季档案记录 ${length} 的单圈长度与 ${laps} 的正赛设置。`
    : `${race.race.name} 的比赛场地，位于 ${race.race.city}。赛道长度与正赛圈数仍等待可核验来源。`;

  return (
    <main className={styles.page}>
      <header className={styles.contextBar}>
        <BackNavigation className={styles.backButton} fallbackHref="/schedule" fallbackLabel="返回赛历" />
        <p>2026 SEASON / ROUND {String(race.race.round).padStart(2, "0")}</p>
      </header>

      <section className={styles.introduction} aria-labelledby="circuit-title">
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>CIRCUIT INTELLIGENCE</p>
          <h1 id="circuit-title">{race.race.circuitName}</h1>
          <p className={styles.location}>
            <span aria-hidden="true">{getCountryFlag(race.race.country)}</span>
            {race.race.city}, {race.race.country}
          </p>
        </div>
        <div className={styles.eventReference}>
          <span>EVENT REFERENCE</span>
          <strong>{race.race.name}</strong>
          <time>{formatRaceDateRange(race, "en-GB")}</time>
        </div>
      </section>

      <section className={styles.circuitField} aria-labelledby="field-title">
        <div className={styles.fieldOrientation}>
          <span id="field-title">VERIFIED CIRCUIT GEOMETRY</span>
          <p>赛道形状、起终点与行驶方向</p>
        </div>

        <div className={styles.fieldMetricLength}>
          <span>CIRCUIT LENGTH</span>
          <strong>{length}</strong>
          <small>赛道 metadata</small>
        </div>

        <div className={styles.mapStage}>
          <TechnicalCircuitMap
            circuitId={race.circuitId}
            outline={circuit?.outline}
            title={`${race.race.circuitName} 赛道技术图`}
          />
        </div>

        <div className={styles.fieldMetricLaps}>
          <span>RACE DISTANCE</span>
          <strong>{laps}</strong>
          <small>{raceDistance} / 正赛距离</small>
        </div>

        <div className={styles.fieldLegend}>
          <span>START / FINISH</span>
          <span>DIRECTION OF TRAVEL</span>
          <small>赛道内标记由几何数据生成；额外技术点等待官方赛会图核验。</small>
        </div>
      </section>

      <nav className={styles.sectionNav} aria-label="赛道资料导航">
        <a href="#profile">Circuit profile</a>
        <a href="#sessions">Event sessions</a>
        <a href="#history">Record archive</a>
      </nav>

      <section className={styles.profileField} id="profile" aria-labelledby="profile-title">
        <div className={styles.profileLead}>
          <p className={styles.eyebrow}>CIRCUIT PROFILE</p>
          <h2 id="profile-title">{race.race.city} · {race.race.country}</h2>
          <p className={styles.profileSummary}>{profileSummary}</p>
        </div>
        <div className={styles.factAxis}>
          <StaticFact label="LOCATION" value={`${race.race.city}, ${race.race.country}`} detail="赛季赛事 metadata" />
          <StaticFact label="CIRCUIT LENGTH" value={length} detail="赛道 registry" />
          <StaticFact label="RACE LAPS" value={laps} detail="赛道 registry" />
          <StaticFact label="TIME ZONE" value={circuit?.timeZone ?? "UNVERIFIED"} detail="赛道 metadata" />
          <StaticFact label="SOURCE" value="CIRCUIT REGISTRY" detail={circuit?.source ?? "待核验"} />
          <p className={styles.coverageNote}>
            <span>DATA COVERAGE</span>
            弯角编号、DRS、海拔与历史纪录尚无独立核验来源，因此未纳入当前档案。
          </p>
        </div>
      </section>

      <section className={styles.archiveField} id="sessions" aria-labelledby="archive-title">
        <div>
          <p className={styles.eyebrow}>EVENT ARCHIVE</p>
          <h2 id="archive-title">赛事资料正在等待官方 Session 表。</h2>
        </div>
        <div className={styles.archiveState}>
          <span>SESSION SCHEDULE</span>
          <strong>{race.sessions.some((session) => session.isTimeConfirmed) ? "PARTIALLY CONFIRMED" : "AWAITING OFFICIAL RELEASE"}</strong>
          <p>比赛周日期已确认；单独 Session、分类与 Race Control 资料会在有可核验来源后进入此处。</p>
        </div>
      </section>

      <section className={styles.recordNote} id="history" aria-label="历史纪录资料状态">
        <span>RECORD ARCHIVE</span>
        <p>最快圈、杆位与历届赛果当前未连接独立的可复核来源，因此保持为空。</p>
      </section>

      <footer className={styles.footer}>
        <span>赛事 metadata / {race.source}</span>
        <span>赛道几何 / {circuit?.source ?? "待核验"}</span>
      </footer>
    </main>
  );
}
