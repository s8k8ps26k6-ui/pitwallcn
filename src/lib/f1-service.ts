import "server-only";

import { mockLiveTiming } from "@/lib/mockData";
import { fetchOpenF1 } from "@/lib/openf1-client";
import { findNextRaceFromCalendar, officialRaceCalendar2026 } from "@/lib/race-calendar";
import { getRaceControlFeed } from "@/lib/race-control-service";
import { getDriverStandings } from "@/lib/standings-service";
import type { RaceWeekend, ScheduleSession } from "@/lib/types";

type OpenF1Meeting = {
  meeting_key: number;
  meeting_name: string;
  location: string;
  country_name: string;
  circuit_short_name: string;
  date_start: string;
  date_end?: string;
  year: number;
};

type OpenF1Session = {
  session_key?: number;
  session_name: string;
  date_start: string;
};

function isoOrFallback(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

function normalizeSessions(meeting: OpenF1Meeting, sessions: OpenF1Session[]): ScheduleSession[] {
  return [...sessions]
    .filter((session) => session.session_name && session.date_start)
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())
    .map((session) => ({
      name: session.session_name,
      startTime: isoOrFallback(session.date_start, meeting.date_start),
      isTimeConfirmed: true
    }));
}

function isSameRace(localRace: RaceWeekend, meeting: OpenF1Meeting) {
  const localStart = new Date(localRace.startDate).getTime();
  const meetingStart = new Date(meeting.date_start).getTime();
  const dateClose = Math.abs(localStart - meetingStart) < 1000 * 60 * 60 * 24 * 4;
  const meetingText = `${meeting.meeting_name} ${meeting.location} ${meeting.country_name} ${meeting.circuit_short_name}`.toLowerCase();
  const localHints = [localRace.location, localRace.country, localRace.circuitName, localRace.raceName].map((value) => value.toLowerCase());

  return dateClose || localHints.some((hint) => hint && meetingText.includes(hint));
}

async function enrichRaceWithOpenF1Sessions(localRace: RaceWeekend): Promise<RaceWeekend | null> {
  const year = new Date(localRace.startDate).getUTCFullYear();
  const meetings = await fetchOpenF1<OpenF1Meeting[]>("/meetings", { year });
  const meeting = meetings.find((item) => isSameRace(localRace, item));
  if (!meeting) return null;

  const sessions = await fetchOpenF1<OpenF1Session[]>("/sessions", {
    meeting_key: meeting.meeting_key
  });
  const normalizedSessions = normalizeSessions(meeting, sessions);
  if (!normalizedSessions.length) return null;

  const raceSession = normalizedSessions.find((session) => session.name.toLowerCase().includes("race"));

  return {
    ...localRace,
    sessions: normalizedSessions,
    countdownTarget: raceSession?.startTime ?? localRace.countdownTarget
  };
}

export async function getScheduleCalendar() {
  const localSchedule = officialRaceCalendar2026;
  const localNextRace = findNextRaceFromCalendar(new Date(), localSchedule);

  try {
    const enrichedNextRace = await enrichRaceWithOpenF1Sessions(localNextRace);
    if (!enrichedNextRace) throw new Error("OpenF1 sessions unavailable for next race");

    const schedule = localSchedule.map((race) =>
      race.id === localNextRace.id ? enrichedNextRace : race
    );

    return {
      schedule,
      nextRace: enrichedNextRace,
      source: "local+openf1" as const
    };
  } catch {
    return {
      schedule: localSchedule,
      nextRace: localNextRace,
      source: "local" as const
    };
  }
}

export async function getStandings() {
  return getDriverStandings();
}

export async function getLiveTiming() {
  return {
    data: mockLiveTiming,
    source: process.env.F1_DATA_SOURCE ?? "mock"
  };
}

export async function getRaceControl() {
  return getRaceControlFeed();
}
