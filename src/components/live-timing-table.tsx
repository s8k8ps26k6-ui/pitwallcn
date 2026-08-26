import Link from "next/link";
import styles from "@/app/data-pages.module.css";
import type { LiveTimingSnapshot } from "@/lib/types";

export function LiveTimingTable({ snapshot }: { snapshot: LiveTimingSnapshot }) {
  return (
    <section aria-labelledby="live-title">
      <header className={styles.pageHead}>
        <div>
          <p className={styles.routeCode}>LIVE / SOURCE GATE</p>
          <h1 className={styles.title} id="live-title">实时计时</h1>
          <p className={styles.lede}>
            这个入口只会在存在可验证的实时数据源时展示排名、差距和圈速。当前没有接入，所以页面明确停在数据门禁状态。
          </p>
        </div>
        <p className={`${styles.source} ${styles.sourceDanger}`}>NOT LIVE · SOURCE NOT CONNECTED</p>
      </header>

      <div className={styles.journalLead}>
        <p>{snapshot.message}</p>
        <p>页面不会轮询模拟接口，也不会使用绿色脉冲、自动刷新时间或“Live”状态制造实时错觉。</p>
      </div>

      <section className={styles.sheet} aria-labelledby="live-available-title">
        <div className={styles.sheetHead}>
          <h2 className={styles.sheetTitle} id="live-available-title">目前可用的数据入口</h2>
          <p className={styles.sheetNote}>这些模块读取 OpenF1 的已产生记录，并各自公开数据状态。</p>
        </div>
        <div className={styles.moduleMap}>
          <Link className={styles.moduleLink} href="/race-control">
            <span className={styles.moduleIndex}>01</span>
            <span>
              <strong className={styles.moduleTitle}>赛会控制</strong>
              <span className={styles.moduleDescription}>查看旗语、安全车、调查和赛会通知时间线。</span>
            </span>
            <span className={styles.moduleMeta}>OPENF1 / RECORDED EVENTS</span>
          </Link>
          <Link className={styles.moduleLink} href="/results">
            <span className={styles.moduleIndex}>02</span>
            <span>
              <strong className={styles.moduleTitle}>比赛结果</strong>
              <span className={styles.moduleDescription}>读取已经生成的赛段分类结果。</span>
            </span>
            <span className={styles.moduleMeta}>OPENF1 / SESSION RESULT</span>
          </Link>
        </div>
      </section>
    </section>
  );
}
