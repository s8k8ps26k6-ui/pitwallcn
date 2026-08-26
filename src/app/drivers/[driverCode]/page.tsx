import Link from "next/link";
import { BackNavigation } from "@/components/back-navigation";
import styles from "@/app/data-pages.module.css";
import { getDriverStandings } from "@/lib/standings-service";

export const dynamic = "force-dynamic";

export default async function DriverDetailPage({ params }: { params: Promise<{ driverCode: string }> }) {
  const { driverCode } = await params;
  const code = driverCode.toUpperCase();
  const standings = await getDriverStandings();
  const driver = standings.drivers.find((item) => item.code === code);

  return (
    <main className={styles.page}>
      <div className={styles.backRow}>
        <BackNavigation className={styles.back} fallbackHref="/drivers" fallbackLabel="返回车手" />
      </div>

      {driver ? (
        <>
          <header className={styles.pageHead}>
            <div>
              <h1 className={styles.title}>{driver.name}</h1>
              <p className={styles.lede}>当前赛季可核验的身份、车队与排名资料。</p>
            </div>
            <p className={styles.source}>{driver.sourceLabel}</p>
          </header>

          <section className={styles.profileHero} aria-label={`${driver.name} 赛季资料`}>
            <div>
              <p className={styles.profileCode}>{driver.code}</p>
              <p className={styles.journalLead}>{driver.team}</p>
            </div>
            <div className={styles.profileFacts}>
              <div className={styles.profileFact}><span>车号</span><strong>#{driver.number}</strong></div>
              <div className={styles.profileFact}><span>积分榜</span><strong>P{driver.position}</strong></div>
              <div className={styles.profileFact}><span>赛季积分</span><strong>{driver.points}</strong></div>
              <div className={styles.profileFact}><span>分站胜场</span><strong>{driver.wins}</strong></div>
            </div>
          </section>

        </>
      ) : (
        <section className={styles.empty}>
          <h1 className={styles.emptyTitle}>无法确认车手 {code}</h1>
          <p>{standings.source === "unavailable" ? "当前赛季车手数据源暂不可用。" : "当前赛季数据中没有找到这个车手代码。"}</p>
          <Link className={styles.back} href="/drivers">返回车手名录</Link>
        </section>
      )}
    </main>
  );
}
