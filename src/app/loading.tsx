import styles from "./loading.module.css";

export default function Loading() {
  return (
    <main className={styles.loadingShell} aria-live="polite" aria-busy="true">
      <div className={styles.loadingFrame}>
        <span className={styles.brand}>LAPMETRY</span>
        <span className={styles.status}>正在切换赛事数据</span>
        <span className={styles.progress} aria-hidden="true" />
      </div>
    </main>
  );
}
