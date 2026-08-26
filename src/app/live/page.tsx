import { LiveTimingTable } from "@/components/live-timing-table";
import { getLiveTiming } from "@/lib/f1-service";
import styles from "@/app/data-pages.module.css";

export const dynamic = "force-dynamic";

export default async function LivePage() {
  const snapshot = await getLiveTiming();

  return (
    <main className={`${styles.page} ${styles.livePage}`}>
      <LiveTimingTable snapshot={snapshot} />
    </main>
  );
}
