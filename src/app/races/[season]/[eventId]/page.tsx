import { notFound } from "next/navigation";
import { RaceDetailView } from "@/components/race-detail/race-detail-view";
import { getRaceByEventId, getSeasonRaces } from "@/lib/atlas/race-detail";

type RaceDetailPageProps = {
  params: Promise<{ season: string; eventId: string }>;
};

export function generateStaticParams() {
  return getSeasonRaces().map((race) => ({
    season: String(race.season),
    eventId: race.eventId,
  }));
}

export async function generateMetadata({ params }: RaceDetailPageProps) {
  const { season, eventId } = await params;
  const race = season === "2026" ? getRaceByEventId(eventId) : null;
  return {
    title: race ? `${race.race.name} | Race Week Control` : "Race Week Control",
  };
}

export default async function RaceDetailPage({ params }: RaceDetailPageProps) {
  const { season, eventId } = await params;
  if (season !== "2026") notFound();
  const race = getRaceByEventId(eventId);
  if (!race) notFound();

  return <RaceDetailView race={race} />;
}
