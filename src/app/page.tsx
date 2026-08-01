import { HomepageV3 } from "@/components/homepage-v3/homepage-v3";
import { getCurrentSeasonRace } from "@/lib/atlas/race-detail";

export default async function Home() {
  const current = getCurrentSeasonRace();

  return (
    <HomepageV3 race={current.race} phase={current.phase} />
  );
}
