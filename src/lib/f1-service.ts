import { mockLiveTiming, mockRaceControl, mockSchedule } from "@/lib/mockData";
import { RaceControlMessage, RaceWeekend } from "@/lib/types";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";

type OpenF1Meeting = {
  meeting_key: number;
  meeting_name: string;
  location: string;
  country_name: string;
  circuit_short_name: string;
  date_start: string;
  date_end?: string;
};

type OpenF1Session = {
  session_key: number;
  session_name: string;
  date_start: string;
};

type OpenF1RaceControl = {
  date?: string;
  driver_number?: number;
  flag?: string;
  lap_number?: number;
  message?: string;
  category?: string;
  scope?: string;
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

async function fetchRaceControlBySession(sessionKey: number): Promise<OpenF1RaceControl[]> {
  const response = await fetch(`${OPENF1_BASE_URL}/race_control?session_key=${sessionKey}`, { next: { revalidate: 30 } });
  if (!response.ok) throw new Error(`OpenF1 race_control failed: ${response.status}`);
  return (await response.json()) as OpenF1RaceControl[];
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

function mapCategory(input?: string): RaceControlMessage["category"] {
  const value = (input ?? "").toUpperCase();
  if (value.includes("SAFETY")) return "SAFETY_CAR";
  if (value.includes("FLAG")) return "FLAG";
  if (value.includes("INCIDENT") || value.includes("TRACK") || value.includes("COLLISION")) return "INCIDENT";
  return "NOTICE";
}

function normalizeRaceControl(rows: OpenF1RaceControl[]): RaceControlMessage[] {
  return rows
    .filter((row) => row.message)
    .map((row, index) => {
      const date = row.date ? new Date(row.date) : undefined;
      const timestamp = date && !Number.isNaN(date.getTime())
        ? date.toLocaleTimeString("zh-CN", { hour12: false })
        : "--:--:--";

      return {
        id: `${row.date ?? "row"}-${index}`,
        timestamp,
        date: row.date,
        category: mapCategory(row.category),
        flag: row.flag,
        lapNumber: row.lap_number,
        message: row.message ?? "赛会控制消息"
      };
    });
}

async function getLatestSessionKey(): Promise<number | null> {
  const year = new Date().getUTCFullYear();
  const meetings = await fetchOpenF1Meetings(year);
  if (!meetings.length) return null;

  const now = Date.now();
  const sortedMeetings = [...meetings].sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
  const chosenMeeting = sortedMeetings.find((meeting) => new Date(meeting.date_start).getTime() >= now) ?? sortedMeetings.at(-1);
  if (!chosenMeeting) return null;

  const sessions = await fetchOpenF1Sessions(chosenMeeting.meeting_key);
  if (!sessions.length) return null;

  const sortedSessions = [...sessions].sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
  const chosenSession = sortedSessions.find((session) => new Date(session.date_start).getTime() >= now) ?? sortedSessions.at(-1);
  return chosenSession?.session_key ?? null;
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

export async function getRaceControlFeed() {
  try {
    const sessionKey = await getLatestSessionKey();
    if (!sessionKey) throw new Error("No session key");

    const feed = await fetchRaceControlBySession(sessionKey);
    const normalized = normalizeRaceControl(feed).slice(-30).reverse();
    if (!normalized.length) throw new Error("No race control data");

    return { data: normalized, source: "openf1" as const };
  } catch {
    return { data: mockRaceControl, source: "mock" as const };
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
  return getRaceControlFeed();
}
