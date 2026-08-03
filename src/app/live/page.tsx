import { BackNavigation } from "@/components/back-navigation";
import { LiveTimingTable } from "@/components/live-timing-table";
import { mockLiveTiming } from "@/lib/mockData";

export default function LivePage() {
  return (
    <main className="space-y-4">
      <BackNavigation className="race-code inline-flex min-h-10 items-center rounded-xl border border-zinc-800 bg-black/30 px-3 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" fallbackHref="/" fallbackLabel="返回主页" />
      <LiveTimingTable initialData={mockLiveTiming} />
    </main>
  );
}
