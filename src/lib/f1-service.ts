import { mockLiveTiming, mockRaceControl } from "@/lib/mockData";
import { findNextRaceFromCalendar, officialRaceCalendar2026 } from "@/lib/race-calendar";
import { RaceControlMessage, RaceWeekend, ScheduleSession } from "@/lib/types";

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
  session_key?: number;
  session_name: string;
  date_start: string;
};

type OpenF1RaceControl = {
  category?: string;
  date?: string;
  flag?: string;
  lap_number?: number;
  message?: string;
  scope?: string;
  session_key?: number;
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

function buildOpenF1Url(path: string, params: Record<string, string | number>) {
  const url = new URL(`${OPENF1_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  return url.toString();
}

async function fetchRaceControlByUrl(url: string): Promise<OpenF1RaceControl[]> {
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) throw new Error(`OpenF1 race_control failed: ${response.status}`);
  return (await response.json()) as OpenF1RaceControl[];
}

async function fetchRaceControlBySession(sessionKey: number | "latest"): Promise<OpenF1RaceControl[]> {
  return fetchRaceControlByUrl(buildOpenF1Url("/race_control", { session_key: sessionKey }));
}

async function fetchRaceControlSince(dateIso: string): Promise<OpenF1RaceControl[]> {
  return fetchRaceControlByUrl(buildOpenF1Url("/race_control", { "date>=": dateIso }));
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

function mapRaceControlCategory(row: OpenF1RaceControl): RaceControlMessage["category"] {
  const text = `${row.category ?? ""} ${row.flag ?? ""} ${row.message ?? ""}`.toUpperCase();

  if (text.includes("SAFETY") || text.includes("VSC")) return "SAFETY_CAR";
  if (text.includes("FLAG") || text.includes("YELLOW") || text.includes("GREEN") || text.includes("RED") || text.includes("CHEQUERED")) return "FLAG";
  if (text.includes("INCIDENT") || text.includes("INVESTIGAT") || text.includes("TRACK LIMIT") || text.includes("COLLISION") || text.includes("NOTED")) return "INCIDENT";
  return "NOTICE";
}

function formatRaceControlTimestamp(date?: string) {
  if (!date) return "--:--:--";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "--:--:--";

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai"
  }).format(parsed);
}

function normalizeRaceControl(rows: OpenF1RaceControl[]): RaceControlMessage[] {
  return rows
    .filter((row) => row.message)
    .sort((a, b) => new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime())
    .slice(-30)
    .reverse()
    .map((row, index) => ({
      id: `${row.session_key ?? "session"}-${row.date ?? "row"}-${index}`,
      timestamp: formatRaceControlTimestamp(row.date),
      date: row.date,
      category: mapRaceControlCategory(row),
      flag: row.flag,
      lapNumber: row.lap_number,
      scope: row.scope,
      message: row.message ?? "Race control message"
    }));
}

async function findRecentSessions() {
  const now = Date.now();
  const currentYear = new Date().getUTCFullYear();
  const candidateYears = [currentYear, currentYear - 1].filter((year) => year >= 2023);
  const candidates: Array<OpenF1Session & { meetingDate: string }> = [];

  for (const year of candidateYears) {
    try {
      const meetings = await fetchOpenF1Meetings(year);
      const recentMeetings = meetings
        .filter((meeting) => new Date(meeting.date_start).getTime() <= now)
        .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
        .slice(0, 6);

      for (const meeting of recentMeetings) {
        const sessions = await fetchOpenF1Sessions(meeting.meeting_key);
        candidates.push(
          ...sessions
            .filter((session) => session.session_key && session.date_start && new Date(session.date_start).getTime() <= now)
            .map((session) => ({ ...session, meetingDate: meeting.date_start }))
        );
      }
    } catch {
      // Try the next available year/source before falling back to mock data.
    }
  }

  return candidates
    .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
    .slice(0, 12);
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

export async function getRaceControlFeed() {
  const attempts: Array<() => Promise<{ data: RaceControlMessage[]; sessionName: string }>> = [
    async () => {
      const feed = await fetchRaceControlBySession("latest");
      const normalized = normalizeRaceControl(feed);
      return { data: normalized, sessionName: "Latest session" };
    },
    async () => {
      const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString();
      const feed = await fetchRaceControlSince(since);
      const normalized = normalizeRaceControl(feed);
      return { data: normalized, sessionName: "Recent race control" };
    },
    async () => {
      const recentSessions = await findRecentSessions();

      for (const session of recentSessions) {
        if (!session.session_key) continue;
        const feed = await fetchRaceControlBySession(session.session_key);
        const normalized = normalizeRaceControl(feed);
        if (normalized.length) return { data: normalized, sessionName: session.session_name };
      }

      return { data: [], sessionName: "Historical sessions" };
    }
  ];

  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (result.data.length) return { ...result, source: "openf1" as const };
    } catch {
      // Continue to the next strategy.
    }
  }

  return { data: [...mockRaceControl].reverse(), source: "mock" as const, sessionName: "Mock session" };
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
