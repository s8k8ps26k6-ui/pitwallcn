import Link from "next/link";
import { BackNavigation } from "@/components/back-navigation";
import styles from "@/app/data-pages.module.css";
import { getDriverStandings } from "@/lib/standings-service";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const standings = await getDriverStandings();
  const available = standings.source === "jolpica";

  return (
    <main className={styles.page}>
      <div className={styles.backRow}>
        <BackNavigation className={styles.back} fallbackHref="/" fallbackLabel="返回主页" />
      </div>
      <header className={styles.pageHead}>
        <div>
          <p className={styles.routeCode}>SEASON / CHAMPIONSHIP LADDER</p>
          <h1 className={styles.title}>积分榜</h1>
          <p className={styles.lede}>车手和车队使用同一赛季排名源。页面不再把车手名录中的手填数字重排成“实时积分”。</p>
        </div>
        <p className={`${styles.source} ${available ? "" : styles.sourceDanger}`}>{standings.sourceLabel}</p>
      </header>

      {available ? (
        <section className={styles.workbench} aria-label="2026 F1 赛季积分榜">
          <section aria-labelledby="driver-ladder-title">
            <div className={styles.sheetHead}>
              <h2 className={styles.sheetTitle} id="driver-ladder-title">车手冠军榜</h2>
              <p className={styles.sheetNote}>积分相同时维持数据源返回顺序。</p>
            </div>
            <div className={styles.ladder}>
              {standings.drivers.map((driver) => (
                <Link className={styles.ladderRow} href={driver.href} key={driver.code}>
                  <span className={styles.position}>P{driver.position}</span>
                  <div><strong>{driver.code} · {driver.name}</strong><p>{driver.team} · {driver.wins} 胜</p></div>
                  <strong className={styles.ladderPoints}>{driver.points}</strong>
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="constructor-ladder-title">
            <div className={styles.sheetHead}>
              <h2 className={styles.sheetTitle} id="constructor-ladder-title">车队冠军榜</h2>
              <p className={styles.sheetNote}>车队积分来自同一 Jolpica 当前赛季快照。</p>
            </div>
            <div className={styles.ladder}>
              {standings.constructors.map((team) => (
                <article className={styles.ladderRow} key={team.team}>
                  <span className={styles.position}>P{team.position}</span>
                  <div><strong>{team.team}</strong><p>{team.drivers.join(" / ") || "车手映射待返回"}</p></div>
                  <strong className={styles.ladderPoints}>{team.points}</strong>
                </article>
              ))}
            </div>
          </section>
        </section>
      ) : (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>当前赛季积分源暂不可用</h2>
          <p>请求失败时 LAPMETRY 不会回落到手填积分。稍后重新打开页面即可重新请求 Jolpica F1。</p>
          <Link className={styles.back} href="/drivers">查看车手名录</Link>
        </section>
      )}
    </main>
  );
}
