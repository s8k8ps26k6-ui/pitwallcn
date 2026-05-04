import { LiveTimingTable } from "@/components/live-timing-table";
import { mockLiveTiming } from "@/lib/mockData";

export default function LivePage() {
  return <LiveTimingTable initialData={mockLiveTiming} />;
}
