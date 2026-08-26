import { DriverIndex } from "@/components/driver-index";
import styles from "@/app/data-pages.module.css";
import { getDriverStandings } from "@/lib/standings-service";

export const dynamic = "force-dynamic";

export default async function DriversPage() {
  const standings = await getDriverStandings();

  return (
    <main className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>车手名录</h1>
          <p className={styles.lede}>按车队浏览当前赛季车手，并进入其赛季资料。</p>
        </div>
        <p className={`${styles.source} ${standings.source === "jolpica" ? "" : styles.sourceDanger}`}>{standings.sourceLabel}</p>
      </header>

      {standings.drivers.length ? (
        <DriverIndex drivers={standings.drivers} />
      ) : (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>车手名录数据暂不可用</h2>
          <p>车手页现在与当前赛季排名源共用车手和车队身份数据。请求失败时不会回落到旧 Mock 名单。</p>
        </section>
      )}
    </main>
  );
}
