import Link from "next/link";
import { LiveTimingTable } from "@/components/live-timing-table";
import { getOpenF1LiveTiming } from "@/lib/live-timing-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LivePage() {
  const liveTiming = await getOpenF1LiveTiming();

  return (
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>
      <LiveTimingTable initialData={liveTiming.data} initialSource={liveTiming.source} sessionName={liveTiming.sessionName} />
    </main>
  );
}
