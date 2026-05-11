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
  flag?: string;
  lap_number?: number;
  message?: string;
  category?: string;
};

export type RaceControlSelectorMeeting = {
  meetingKey: number;
  meetingName: string;
  location: string;
  country: string;
  sessions: Array<{ sessionKey: number; sessionName: string; sessionStart: string }>;
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

async function getCurrentYearMeetingsWithSessions(): Promise<RaceControlSelectorMeeting[]> {
  const year = new Date().getUTCFullYear();
  const meetings = await fetchOpenF1Meetings(year);
  const sortedMeetings = [...meetings].sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime());
  const recent = sortedMeetings.slice(0, 6);

  const withSessions = await Promise.all(recent.map(async (meeting) => {
    const sessions = await fetchOpenF1Sessions(meeting.meeting_key);
    const sortedSessions = sessions
      .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
      .map((session) => ({ sessionKey: session.session_key, sessionName: session.session_name, sessionStart: session.date_start }));

    return {
      meetingKey: meeting.meeting_key,
      meetingName: meeting.meeting_name,
      location: meeting.location,
      country: meeting.country_name,
      sessions: sortedSessions
    };
  }));

  return withSessions.filter((meeting) => meeting.sessions.length > 0);
}

export async function getRaceControlSelectionData() {
  try {
    const meetings = await getCurrentYearMeetingsWithSessions();
    if (!meetings.length) throw new Error("No meeting sessions available");

    for (const meeting of meetings) {
      for (const session of meeting.sessions) {
        const rows = await fetchRaceControlBySession(session.sessionKey);
        if (rows.length > 0) {
          return { meetings, defaultSessionKey: session.sessionKey, source: "openf1" as const };
        }
      }
    }

    throw new Error("No race control in recent sessions");
  } catch {
    return { meetings: [], defaultSessionKey: null, source: "mock" as const };
  }
}

export async function getRaceControlFeedBySession(sessionKey: number) {
  try {
    const feed = await fetchRaceControlBySession(sessionKey);
    const normalized = normalizeRaceControl(feed).slice(-40).reverse();
    if (!normalized.length) throw new Error("No race control data");
    return { data: normalized, source: "openf1" as const };
  } catch {
    return { data: mockRaceControl, source: "mock" as const };
  }
}

export async function getRaceControlFeed() {
  const selection = await getRaceControlSelectionData();
  if (selection.defaultSessionKey) {
    return getRaceControlFeedBySession(selection.defaultSessionKey);
  }
  return { data: mockRaceControl, source: "mock" as const };
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
  return getRaceControlFeed();
}
