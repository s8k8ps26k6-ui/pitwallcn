import { getScheduleCalendar } from "@/lib/f1-service";
import { ScheduleView } from "@/components/schedule-view";

export default async function SchedulePage() {
  const { schedule, nextRace, source } = await getScheduleCalendar();
  return <ScheduleView schedule={schedule} nextRace={nextRace} source={source} />;
}
