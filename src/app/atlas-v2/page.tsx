import type { Metadata } from "next";
import { SeasonAtlas } from "@/components/atlas-v2/season-atlas";

export const metadata: Metadata = {
  title: "2026 Season Atlas",
  description: "GridDelta CN interactive 2026 Formula 1 season globe.",
};

export default function AtlasV2Page() {
  return <SeasonAtlas />;
}
