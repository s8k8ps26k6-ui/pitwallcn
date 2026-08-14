import type { SeasonRace } from "./season-2026";
import { officialRaceCalendar2026 } from "../race-calendar";

export type GrandPrixSession = {
  name: string;
  startTime: string;
  isTimeConfirmed?: boolean;
};

export type GrandPrixEvent = {
  eventId: string;
  name: string;
  country: string;
  region: SeasonRace["region"];
  sessions: readonly GrandPrixSession[];
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
  sessions: readonly GrandPrixSession[];
};

const CALENDAR_ID_ALIASES: Record<string, string> = {
  madrid: "2026-spain-madrid",
  "sao-paulo": "2026-brazil",
};

function getLocalCalendarEntry(race: SeasonRace) {
  const calendarId = CALENDAR_ID_ALIASES[race.id] ?? `2026-${race.id}`;
  return officialRaceCalendar2026.find((entry) => entry.id === calendarId);
}

function getSessions(race: SeasonRace): readonly GrandPrixSession[] {
  return getLocalCalendarEntry(race)?.sessions.map((session) => ({
    name: session.name,
    startTime: session.startTime,
    isTimeConfirmed: session.isTimeConfirmed,
  })) ?? [];
}

export function getGrandPrixEvents2026(races: readonly SeasonRace[]) {
  return races.map<GrandPrixEvent>((race) => ({
    eventId: race.eventId ?? `${race.id}-gp-2026`,
    name: race.name,
    country: race.country,
    region: race.region,
    sessions: getSessions(race),
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
    sessions: getSessions(race),
  }));
}
