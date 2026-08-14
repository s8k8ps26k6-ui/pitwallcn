"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { getCurrentSeasonRace, getPrimaryRaceMoment } from "@/lib/atlas/race-detail";
import { hasRaceOutlook } from "@/lib/race-outlook-availability";
import styles from "./mobile-race-dock.module.css";

function countdown(iso: string, now: Date) {
  const ms = Math.max(0, Date.parse(iso) - now.getTime());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms / 3_600_000) % 24);
  const minutes = Math.floor((ms / 60_000) % 60);
  return `${days}天 ${String(hours).padStart(2, "0")}时 ${String(minutes).padStart(2, "0")}分`;
}

export function MobileRaceDock() {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const selection = useMemo(() => getCurrentSeasonRace(now), [now]);
  const moment = useMemo(() => getPrimaryRaceMoment(selection.race, now), [selection.race, now]);
  const showOutlook = hasRaceOutlook(selection.race);

  useEffect(() => {
    let timer: number | undefined;
    const sync = () => {
      if (timer) window.clearInterval(timer);
      setNow(new Date());
      if (!document.hidden) timer = window.setInterval(() => setNow(new Date()), 60_000);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div className={styles.dock} data-open={open}>
      {open ? (
        <section className={styles.pulseSheet} aria-label="赛事脉搏">
          <div className={styles.sheetHeader}>
            <div>
              <p>赛事脉搏</p>
              <strong>{selection.race.race.name}</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="关闭赛事脉搏">×</button>
          </div>
          <div className={styles.pulseGrid}>
            <div><span>下一 Session</span><strong>{moment.label}</strong></div>
            <div><span>倒计时</span><strong>{countdown(moment.startTime, now)}</strong></div>
            <div className={styles.emptyWeather}><span>赛道天气</span><strong>可靠天气源待接入</strong></div>
          </div>
          <p className={styles.sheetNote}>比赛进行时，这里将显示旗帜状态、Live Timing 可用性与数据更新时间。</p>
        </section>
      ) : null}
      <nav className={styles.bar} aria-label="赛事快捷坞">
        <button type="button" className={styles.dockItem} onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          <span aria-hidden="true">◌</span><small>赛事脉搏</small>
        </button>
        <Link className={styles.dockItem} href={"/news" as Route}><span aria-hidden="true">≡</span><small>F1 资讯</small></Link>
        {showOutlook ? (
          <Link className={styles.dockItem} href={`/races/${selection.race.season}/${selection.race.eventId}/outlook` as Route}>
            <span aria-hidden="true">✦</span><small>AI 推演</small>
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
