import { mockLiveTiming, mockRaceControl, mockSchedule } from "@/lib/mockData";
import { RaceWeekend } from "@/lib/types";

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

function normalizeMeeting(meeting: OpenF1Meeting, sessions: OpenF1Session[]): RaceWeekend {
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
  const raceSession = sortedSessions.find((s) => s.session_name.includes("Race"));
  const fallbackTarget = sortedSessions.at(-1)?.date_start ?? meeting.date_start;

  return {
    id: `openf1-${meeting.meeting_key}`,
    raceName: meeting.meeting_name,
    country: meeting.country_name,
    location: meeting.location,
    circuitName: meeting.circuit_short_name,
    startDate: isoOrFallback(meeting.date_start, new Date().toISOString()),
    endDate: isoOrFallback(meeting.date_end ?? fallbackTarget, meeting.date_start),
    countdownTarget: isoOrFallback(raceSession?.date_start ?? fallbackTarget, meeting.date_start),
    sessions: sortedSessions.map((s) => ({ name: s.session_name, startTime: isoOrFallback(s.date_start, meeting.date_start) }))
  };
}

function findNextRace(schedule: RaceWeekend[], now: Date): RaceWeekend {
  const sorted = [...schedule].sort((a, b) => new Date(a.countdownTarget).getTime() - new Date(b.countdownTarget).getTime());
  return sorted.find((item) => new Date(item.countdownTarget).getTime() >= now.getTime()) ?? sorted[0];
}

export async function getScheduleCalendar() {
  const now = new Date();
  const currentYear = now.getUTCFullYear();

  try {
    const meetings = await fetchOpenF1Meetings(currentYear);
    if (!meetings.length) throw new Error("No meetings returned");

    const weekends = await Promise.all(
      meetings.map(async (meeting) => {
        const sessions = await fetchOpenF1Sessions(meeting.meeting_key);
        return normalizeMeeting(meeting, sessions);
      })
    );

    const usable = weekends.filter((w) => w.sessions.length > 0);
    if (!usable.length) throw new Error("No sessions available");

    return { schedule: usable, nextRace: findNextRace(usable, now), source: "openf1" as const };
  } catch {
    const fallback = [...mockSchedule];
    return { schedule: fallback, nextRace: findNextRace(fallback, now), source: "mock" as const };
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
