import { SeasonCalendar } from "@/components/season-calendar/season-calendar";
import { getCurrentSeasonRace, getSeasonRaces } from "@/lib/atlas/race-detail";

export const metadata = {
  title: "2026 赛季赛历",
  description: "LAPMETRY 2026 Formula 1 season calendar.",
};

export default function SchedulePage() {
  const current = getCurrentSeasonRace();
  const races = getSeasonRaces();

  return (
    <SeasonCalendar
      races={races}
      currentEventId={current.race.eventId}
      phase={current.phase}
    />
  );
}
