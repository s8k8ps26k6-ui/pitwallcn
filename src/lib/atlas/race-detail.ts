import {
  getGrandPrixEvents2026,
  getSeasonCalendarEntries2026,
  type GrandPrixSession,
} from "./events-2026";
import { getCircuitForRace, type CircuitRegistryEntry } from "./circuit-registry";
import {
  getSeason2026,
  getSeasonRaceSelection2026,
  type SeasonRace,
  type SeasonSelectionPhase,
} from "./season-2026";

export type CalendarDisplayStatus =
  | "live"
  | "next"
  | "completed"
  | "future"
  | "cancelled"
  | "rescheduled"
  | "replacement";

export type UnifiedRace = {
  season: 2026;
  eventId: string;
  circuitId: string;
  race: SeasonRace;
  circuit: CircuitRegistryEntry | undefined;
  sessions: readonly GrandPrixSession[];
  source: string;
};

export type RaceMoment = {
  label: string;
  startTime: string;
  isTimeConfirmed: boolean;
  kind: "session" | "weekend";
};

const COUNTRY_CODES: Record<string, string> = {
  Australia: "AU",
  China: "CN",
  Japan: "JP",
  "United States": "US",
  Canada: "CA",
  Monaco: "MC",
  Spain: "ES",
  Austria: "AT",
  "United Kingdom": "GB",
  Belgium: "BE",
  Hungary: "HU",
  Netherlands: "NL",
  Italy: "IT",
  Azerbaijan: "AZ",
  Singapore: "SG",
  Mexico: "MX",
  Brazil: "BR",
  Qatar: "QA",
  "United Arab Emirates": "AE",
};

const REGULAR_SESSION_LABELS = [
  "Practice 1",
  "Practice 2",
  "Practice 3",
  "Qualifying",
  "Race",
] as const;

const SPRINT_SESSION_LABELS = [
  "Practice 1",
  "Sprint Qualifying",
  "Sprint",
  "Qualifying",
  "Race",
] as const;

function isoAtWeekendStart(race: SeasonRace) {
  return `${race.startDate}T00:00:00.000Z`;
}

export function getSeasonRaces(now = new Date()): UnifiedRace[] {
  const races = getSeason2026(now);
  const eventMap = new Map(
    getGrandPrixEvents2026(races).map((event) => [event.eventId, event]),
  );
  const calendarEntries = getSeasonCalendarEntries2026(races);

  return calendarEntries.map((entry) => {
    const race = races.find((candidate) => candidate.id === entry.circuitId);
    if (!race) {
      throw new Error(`Missing 2026 race data for circuit ${entry.circuitId}`);
    }
    const event = eventMap.get(entry.eventId);

    return {
      season: entry.season,
      eventId: entry.eventId,
      circuitId: entry.circuitId,
      race,
      circuit: getCircuitForRace(race, races),
      sessions: event?.sessions ?? entry.sessions,
      source: entry.source,
    };
  });
}

export function getCurrentSeasonRace(now = new Date()) {
  const selection = getSeasonRaceSelection2026(now);
  const races = getSeasonRaces(now);
  return {
    phase: selection.phase,
    race:
      races.find((candidate) => candidate.race.id === selection.race.id) ??
      races[races.length - 1],
  };
}

export function getRaceByEventId(eventId: string, now = new Date()) {
  return getSeasonRaces(now).find((race) => race.eventId === eventId) ?? null;
}

export function getCountryCode(country: string) {
  return COUNTRY_CODES[country] ?? country.slice(0, 2).toUpperCase();
}

export function getCountryFlag(country: string) {
  return getCountryCode(country)
    .split("")
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join("");
}

export function getSessionLabel(
  session: GrandPrixSession,
  index: number,
  isSprint: boolean,
) {
  const labels = isSprint ? SPRINT_SESSION_LABELS : REGULAR_SESSION_LABELS;
  return labels[index] ?? session.name ?? `Session ${index + 1}`;
}

export function getPrimaryRaceMoment(race: UnifiedRace, now = new Date()): RaceMoment {
  const confirmedSessions = race.sessions
    .map((session, index) => ({ session, index }))
    .filter(({ session }) => session.isTimeConfirmed)
    .sort(
      (a, b) =>
        Date.parse(a.session.startTime) - Date.parse(b.session.startTime),
    );
  const nextSession = confirmedSessions.find(
    ({ session }) => Date.parse(session.startTime) >= now.getTime(),
  );

  if (nextSession) {
    return {
      label: getSessionLabel(
        nextSession.session,
        nextSession.index,
        race.race.isSprint,
      ),
      startTime: nextSession.session.startTime,
      isTimeConfirmed: true,
      kind: "session",
    };
  }

  return {
    label: "Race weekend",
    startTime: isoAtWeekendStart(race.race),
    isTimeConfirmed: false,
    kind: "weekend",
  };
}

export function getCalendarDisplayStatus(
  race: UnifiedRace,
  phase: SeasonSelectionPhase,
  currentEventId: string,
): CalendarDisplayStatus {
  if (race.race.status === "cancelled") return "cancelled";
  if (race.race.status === "rescheduled") return "rescheduled";
  if (race.race.status === "replacement") return "replacement";
  if (race.race.status === "completed") return "completed";
  if (race.eventId === currentEventId && phase === "current") return "live";
  if (race.eventId === currentEventId && phase !== "off-season") return "next";
  return "future";
}

export function formatRaceDateRange(race: UnifiedRace, locale = "en-GB") {
  const start = new Date(`${race.race.startDate}T12:00:00.000Z`);
  const end = new Date(`${race.race.endDate}T12:00:00.000Z`);
  const format = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    })
      .format(date)
      .toUpperCase();

  return `${format(start)} — ${format(end)}`;
}

export function formatLocalDateTime(
  iso: string,
  timeZone: string | undefined,
  locale = "en-GB",
) {
  const date = new Date(iso);
  if (!timeZone || Number.isNaN(date.getTime())) return "TIME TBC";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  })
    .format(date)
    .toUpperCase();
}

export function getStatusLabel(status: CalendarDisplayStatus) {
  const labels: Record<CalendarDisplayStatus, string> = {
    live: "LIVE WEEKEND",
    next: "NEXT",
    completed: "COMPLETED",
    future: "UPCOMING",
    cancelled: "CANCELLED",
    rescheduled: "RESCHEDULED",
    replacement: "REPLACEMENT",
  };
  return labels[status];
}
