import type { SeasonRace } from "./season-2026";

export type GrandPrixEvent = {
  eventId: string;
  name: string;
  country: string;
  region: SeasonRace["region"];
};

export type SeasonCalendarEntry = {
  season: 2026;
  round: number;
  eventId: string;
  circuitId: string;
  startDate: string;
  endDate: string;
  isSprint: boolean;
  status: SeasonRace["status"];
  source: string;
};

export function getGrandPrixEvents2026(races: readonly SeasonRace[]) {
  return races.map<GrandPrixEvent>((race) => ({
    eventId: race.eventId ?? `${race.id}-gp-2026`,
    name: race.name,
    country: race.country,
    region: race.region,
  }));
}

export function getSeasonCalendarEntries2026(
  races: readonly SeasonRace[],
): SeasonCalendarEntry[] {
  return races.map((race) => ({
    season: 2026,
    round: race.round,
    eventId: race.eventId ?? `${race.id}-gp-2026`,
    circuitId: race.circuitId ?? race.id,
    startDate: race.startDate,
    endDate: race.endDate,
    isSprint: race.isSprint,
    status: race.status,
    source: "src/lib/atlas/season-2026.ts",
  }));
}
