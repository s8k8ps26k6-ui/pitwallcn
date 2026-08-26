import Link from "next/link";
import styles from "@/app/data-pages.module.css";
import type { LiveTimingSnapshot } from "@/lib/types";

export function LiveTimingTable({ snapshot }: { snapshot: LiveTimingSnapshot }) {
  return (
    <section className={styles.liveDeck} aria-labelledby="live-title">
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title} id="live-title">实时计时</h1>
          <p className={styles.lede}>仅在接入可验证数据源后显示排名、差距和圈速。</p>
        </div>
        <p className={`${styles.source} ${styles.sourceDanger}`}>数据源未连接</p>
      </header>

      <section className={styles.timingBoard} aria-labelledby="timing-board-title">
        <div className={styles.timingBoardMeta}>
          <span id="timing-board-title">计时数据</span>
          <span>未验证</span>
        </div>
        <div className={styles.timingColumns} aria-hidden="true">
          <span>名次</span><span>车手</span><span>差距</span><span>最近圈</span>
        </div>
        <div className={styles.timingBlank}>
          <p className={styles.timingBlankCode}>数据源不可用</p>
          <h2>计时数据源未连接</h2>
          <p>{snapshot.message} 接入可验证的实时源后，排位、差距和圈速会在此处出现。</p>
        </div>
      </section>

      <nav className={styles.liveRoutes} aria-label="已记录赛段数据">
        <p className={styles.liveRoutesLabel}>已记录数据</p>
        <Link className={styles.liveRoute} href="/race-control">
          <span><strong>赛会控制</strong><small>旗语、调查与官方通知</small></span>
          <span aria-hidden="true" className={styles.liveRouteArrow}>→</span>
        </Link>
        <Link className={styles.liveRoute} href="/results">
          <span><strong>比赛结果</strong><small>已生成赛段的分类表</small></span>
          <span aria-hidden="true" className={styles.liveRouteArrow}>→</span>
        </Link>
      </nav>
    </section>
  );
}
