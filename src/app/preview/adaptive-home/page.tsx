import type { Metadata } from "next";
import { AdaptiveHomePreview } from "@/components/adaptive-home-preview/adaptive-home-preview";
import { MobileRaceDock } from "@/components/mobile-race-dock";
import {
  getCurrentSeasonRace,
  getSeasonRaces,
  type UnifiedRace,
} from "@/lib/atlas/race-detail";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AdaptiveViewport Preview",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdaptiveViewportPreviewPage() {
  const current = getCurrentSeasonRace();
  const season = getSeasonRaces();
  const currentIndex = season.findIndex(
    (candidate) => candidate.eventId === current.race.eventId,
  );
  const raceRail = [
    season[currentIndex - 1],
    current.race,
    season[currentIndex + 1],
  ].filter((candidate): candidate is UnifiedRace => Boolean(candidate));

  return (
    <>
      <AdaptiveHomePreview
        race={current.race}
        phase={current.phase}
        raceRail={raceRail}
      />
      <MobileRaceDock />
    </>
  );
}
