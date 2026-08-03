"use client";

import { useEffect, useMemo, useState } from "react";
import { BackNavigation } from "@/components/back-navigation";
import { HomeBrandLink } from "@/components/home-brand-link";
import { RaceOutlookPanel } from "@/components/race-outlook/race-outlook-panel";
import { TechnicalCircuitMap } from "@/components/race-shared/technical-circuit-map";
import type { RaceOutlookReport } from "@/lib/race-outlook-types";
import {
  formatLocalDateTime,
  formatRaceDateRange,
  getCountryFlag,
  getPrimaryRaceMoment,
  getSessionLabel,
  type UnifiedRace,
} from "@/lib/atlas/race-detail";
import styles from "./race-detail.module.css";

type Section = "overview" | "sessions" | "records" | "history";

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: number | undefined;
    const sync = () => {
      if (timer) window.clearInterval(timer);
      setNow(new Date());
      if (!document.hidden) timer = window.setInterval(() => setNow(new Date()), 1_000);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return now;
}

function formatCountdown(targetIso: string, now: Date) {
  const ms = Math.max(0, Date.parse(targetIso) - now.getTime());
  const units = [
    Math.floor(ms / 86_400_000),
    Math.floor((ms / 3_600_000) % 24),
    Math.floor((ms / 60_000) % 60),
  ];
  return `${String(units[0]).padStart(2, "0")}天 ${String(units[1]).padStart(2, "0")}时 ${String(units[2]).padStart(2, "0")}分`;
}

function EmptyState({ label, detail }: { label: string; detail: string }) {
  return <div className={styles.emptyState}><span>{label}</span><p>{detail}</p></div>;
}

function SessionTimeline({ race }: { race: UnifiedRace }) {
  if (!race.sessions.length) return <EmptyState label="比赛周日程" detail="当前统一赛历还没有可核验的单场 Session 数据。" />;
  return (
    <ol className={styles.sessionTimeline}>
      {race.sessions.map((session, index) => {
        const confirmed = Boolean(session.isTimeConfirmed);
        return <li key={`${session.startTime}-${index}`} data-confirmed={confirmed}>
          <span className={styles.sessionStep}>{String(index + 1).padStart(2, "0")}</span>
          <strong>{getSessionLabel(session, index, race.race.isSprint)}</strong>
          <time dateTime={session.startTime}>{confirmed ? formatLocalDateTime(session.startTime, race.circuit?.timeZone, "zh-CN") : "时间待确认"}</time>
          <span>{confirmed ? "已确认" : "待确认"}</span>
        </li>;
      })}
    </ol>
  );
}

export function RaceDetailView({ race, outlook }: { race: UnifiedRace; outlook: RaceOutlookReport | null }) {
  const now = useNow();
  const [section, setSection] = useState<Section>("overview");
  const moment = useMemo(() => getPrimaryRaceMoment(race, now), [now, race]);
  const metrics = [
    ["赛道长度", race.circuit?.lengthKm ? `${race.circuit.lengthKm.toFixed(3)} km` : "待确认"],
    ["正赛圈数", race.circuit?.laps ? `${race.circuit.laps} 圈` : "待确认"],
    ["赛制", race.race.isSprint ? "冲刺周末" : "大奖赛周末"],
    ["当地时区", race.circuit?.timeZone ?? "待确认"],
  ] as const;

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true" />
      <header className={styles.header}>
        <HomeBrandLink className={styles.brand} ariaLabel="返回主页顶部">GRIDDELTA <em>CN</em></HomeBrandLink>
        <BackNavigation className={styles.backButton} fallbackHref="/schedule" fallbackLabel="返回赛历" />
        <span className={styles.round}>2026 / R{String(race.race.round).padStart(2, "0")}</span>
      </header>

      <section className={styles.identity}>
        <p><span>{getCountryFlag(race.race.country)}</span>{race.race.country} · {race.race.city}</p>
        <h1>{race.race.name}</h1>
        <strong>{race.race.circuitName}</strong>
        <span>{formatRaceDateRange(race, "zh-CN")}</span>
      </section>

      <nav className={styles.sectionNav} aria-label="比赛站详情分区">
        {(["overview", "sessions", "records", "history"] as const).map((item) => (
          <button key={item} type="button" data-active={section === item} onClick={() => setSection(item)}>
            {{ overview: "概览", sessions: "日程", records: "纪录", history: "历史" }[item]}
          </button>
        ))}
      </nav>

      <section className={styles.hero}>
        <div className={styles.trackField}>
          <div className={styles.trackHeading}><span>赛道技术图</span><small>仅显示已核验标记</small></div>
          <TechnicalCircuitMap circuitId={race.circuitId} outline={race.circuit?.outline} title={`${race.race.circuitName} 技术赛道图`} />
        </div>
        <aside className={styles.nextSession}>
          <span>下一 Session</span>
          <strong>{moment.label}</strong>
          <time dateTime={moment.startTime}>{moment.isTimeConfirmed ? formatLocalDateTime(moment.startTime, race.circuit?.timeZone, "zh-CN") : "比赛周时间待官方确认"}</time>
          <output>{formatCountdown(moment.startTime, now)}</output>
          <small>{moment.isTimeConfirmed ? "当地时间倒计时" : "距离比赛周开始"}</small>
        </aside>
      </section>

      <section className={styles.content} data-section={section}>
        {section === "overview" ? <>
          <div className={styles.metricStrip}>{metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
          <div className={styles.summaryGrid}>
            <article><span>比赛周状态</span><strong>{moment.label}</strong><p>{moment.isTimeConfirmed ? "已将下一场确认的赛段显示为赛道当地时间。" : "赛历已确认；单独赛段时间仍待官方发布。"}</p><button type="button" onClick={() => setSection("sessions")}>查看完整日程 <span aria-hidden="true">→</span></button></article>
            <article><span>赛道天气</span><strong>数据待接入</strong><p>没有可靠的赛道天气源时，不展示模拟温度、降雨概率或风速。</p></article>
            <RaceOutlookPanel report={outlook} />
          </div>
        </> : null}
        {section === "sessions" ? <SessionTimeline race={race} /> : null}
        {section === "records" ? <div className={styles.emptyGrid}><EmptyState label="最快圈与杆位" detail="历史纪录仍待连接独立、可复核的数据源。" /><EmptyState label="胜场统计" detail="不以未经核验的静态样例展示车手或车队纪录。" /></div> : null}
        {section === "history" ? <div className={styles.emptyGrid}><EmptyState label="历届冠军" detail="尚未发布经过来源核对的冠军资料。" /><EmptyState label="经典比赛" detail="编辑内容尚未发布。" /></div> : null}
      </section>

      <footer className={styles.footer}><span>赛事数据来源 / {race.source}</span><span>赛道技术标记 / 仅官方图纸核验后显示</span></footer>
    </main>
  );
}
