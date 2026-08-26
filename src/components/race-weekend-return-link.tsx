import { BackNavigation } from "@/components/back-navigation";
import styles from "@/app/data-pages.module.css";

/** Retains the legacy component surface while using the shared back semantics. */
export function RaceWeekendReturnLink({ session: _session }: { session?: string }) {
  void _session;
  return <BackNavigation
    className={styles.back}
    fallbackHref="/race-weekend"
    fallbackLabel="返回比赛周"
  />;
}
