import styles from "./loading.module.css";

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="正在载入赛事数据"
      aria-live="polite"
      className={styles.loadingShell}
      role="status"
    >
      <div className={styles.loadingFrame}>
        <div className={styles.loadingHead}>
          <span className={styles.status}>正在载入赛事数据…</span>
          <span className={styles.source}>等待数据源</span>
        </div>
        <div className={styles.loadingColumns} aria-hidden="true">
          <span>位置</span>
          <span>数据</span>
          <span>状态</span>
        </div>
        <div className={styles.loadingRows} aria-hidden="true">
          <span /><span /><span />
          <span /><span /><span />
          <span /><span /><span />
        </div>
      </div>
    </section>
  );
}
