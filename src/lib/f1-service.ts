import { mockLiveTiming, mockRaceControl } from "@/lib/mockData";
import { findNextRaceFromCalendar, officialRaceCalendar2026 } from "@/lib/race-calendar";
import { RaceWeekend, ScheduleSession } from "@/lib/types";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";

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
  session_name: string;
  date_start: string;
};

function isoOrFallback(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

async function fetchOpenF1Meetings(year: number): Promise<OpenF1Meeting[]> {
  const response = await fetch(`${OPENF1_BASE_URL}/meetings?year=${year}`, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`OpenF1 meetings failed: ${response.status}`);
  return (await response.json()) as OpenF1Meeting[];
}

async function fetchOpenF1Sessions(meetingKey: number): Promise<OpenF1Session[]> {
  const response = await fetch(`${OPENF1_BASE_URL}/sessions?meeting_key=${meetingKey}`, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`OpenF1 sessions failed: ${response.status}`);
  return (await response.json()) as OpenF1Session[];
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
  const text = `${meeting.meeting_name} ${meeting.location} ${meeting.country_name} ${meeting.circuit_short_name}`.toLowerCase();
  const localHints = [localRace.location, localRace.country, localRace.circuitName, localRace.raceName].map((value) => value.toLowerCase());
  return dateClose || localHints.some((hint) => hint && text.includes(hint));
}

async function enrichRaceWithOpenF1Sessions(localRace: RaceWeekend): Promise<RaceWeekend | null> {
  const year = new Date(localRace.startDate).getUTCFullYear();
  const meetings = await fetchOpenF1Meetings(year);
  const meeting = meetings.find((item) => isSameRace(localRace, item));
  if (!meeting) return null;

  const sessions = await fetchOpenF1Sessions(meeting.meeting_key);
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
  const now = new Date();
  const localSchedule = officialRaceCalendar2026;
  const localNextRace = findNextRaceFromCalendar(now, localSchedule);

  try {
    const enrichedNextRace = await enrichRaceWithOpenF1Sessions(localNextRace);
    if (!enrichedNextRace) throw new Error("OpenF1 sessions unavailable for next race");

    const schedule = localSchedule.map((race) => (race.id === localNextRace.id ? enrichedNextRace : race));
    return { schedule, nextRace: enrichedNextRace, source: "local+openf1" as const };
  } catch {
    return { schedule: localSchedule, nextRace: localNextRace, source: "local" as const };
  }
}

export async function getStandings() {
  return {
    drivers: [{ position: 1, driver: "VER", points: 168 }],
    constructors: [{ position: 1, team: "Red Bull", points: 287 }],
    source: process.env.F1_DATA_SOURCE ?? "mock"
  };
}

export async function getLiveTiming() {
  return { data: mockLiveTiming, source: process.env.F1_DATA_SOURCE ?? "mock" };
}

export async function getRaceControl() {
  return { data: mockRaceControl, source: process.env.F1_DATA_SOURCE ?? "mock" };
}
