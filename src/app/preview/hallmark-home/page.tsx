import { HallmarkHomePreview } from "@/components/hallmark-home-preview/hallmark-home-preview";
import {
  getCurrentSeasonRace,
  getSeasonRaces,
  type UnifiedRace,
} from "@/lib/atlas/race-detail";

export const dynamic = "force-dynamic";

export default function HallmarkHomePreviewPage() {
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
    <HallmarkHomePreview
      race={current.race}
      phase={current.phase}
      raceRail={raceRail}
    />
  );
}
