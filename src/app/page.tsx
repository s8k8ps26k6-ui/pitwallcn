import { HomepageV3 } from "@/components/homepage-v3/homepage-v3";

export const dynamic = "force-dynamic";
import {
  getCurrentSeasonRace,
  getSeasonRaces,
  type UnifiedRace,
} from "@/lib/atlas/race-detail";

export default function Home() {
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
    <HomepageV3
      race={current.race}
      phase={current.phase}
      raceRail={raceRail}
    />
  );
}
