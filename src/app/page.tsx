import { CinematicHomepage } from "@/components/cinematic-homepage";
import { HomeIntroSequence } from "@/components/home-intro-sequence";
import { getScheduleCalendar } from "@/lib/f1-service";

function formatDateRange(startIso: string, endIso: string) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  });
  return `${formatter.format(new Date(startIso))} - ${formatter.format(new Date(endIso))}`;
}

function getScheduleSourceLabel(source: "local" | "local+openf1") {
  return source === "local+openf1"
    ? "Local calendar + OpenF1 sessions"
    : "Local official calendar";
}

export default async function Home() {
  const { nextRace, source } = await getScheduleCalendar();

  return (
    <main>
      <HomeIntroSequence />
      <CinematicHomepage
        nextRace={nextRace}
        sourceLabel={getScheduleSourceLabel(source)}
        dateRange={formatDateRange(nextRace.startDate, nextRace.endDate)}
      />
    </main>
  );
}
