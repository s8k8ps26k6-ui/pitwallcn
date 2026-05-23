import Link from "next/link";
import { LiveTimingTable } from "@/components/live-timing-table";
import { mockLiveTiming } from "@/lib/mockData";

export default function LivePage() {
  return (
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>
      <LiveTimingTable initialData={mockLiveTiming} />
    </main>
  );
}
