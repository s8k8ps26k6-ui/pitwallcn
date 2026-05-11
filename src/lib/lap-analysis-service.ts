const OPENF1_BASE_URL = "https://api.openf1.org/v1";

type OpenF1Meeting = {
  meeting_key: number;
  meeting_name: string;
  location: string;
  country_name: string;
  date_start: string;
};

type OpenF1Session = {
  session_key: number;
  meeting_key: number;
  session_name: string;
  date_start: string;
};

type OpenF1Lap = { driver_number: number; lap_number: number; lap_duration?: number };
type OpenF1Stint = { driver_number: number; stint_number?: number; compound?: string; lap_start?: number; lap_end?: number };
type OpenF1Position = { driver_number: number; position?: number; date?: string };
type OpenF1Interval = { driver_number: number; date?: string; interval?: string; gap_to_leader?: string };

export type LapAnalysisSelectionMeeting = {
  meetingKey: number;
  meetingName: string;
  location: string;
  country: string;
  sessions: Array<{ sessionKey: number; sessionName: string; sessionStart: string }>;
};

export type LapAnalysisRow = {
  driver: string;
  bestLap: string;
  latestLap: string;
  laps: number;
  lastKnownPosition: string;
  gap: string;
  stint: string;
};

async function fetchJson<T>(path: string, revalidate = 60): Promise<T> {
  const response = await fetch(`${OPENF1_BASE_URL}${path}`, { next: { revalidate } });
  if (!response.ok) throw new Error(`OpenF1 request failed: ${response.status}`);
  return (await response.json()) as T;
}

function formatLap(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds)) return "--";
  const min = Math.floor(seconds / 60);
  const sec = (seconds % 60).toFixed(3).padStart(6, "0");
  return `${min}:${sec}`;
}

function toDriverCode(driverNumber: number): string {
  return String(driverNumber);
}

export async function getLapAnalysisSelectionData() {
  const year = new Date().getUTCFullYear();
  const meetings = await fetchJson<OpenF1Meeting[]>(`/meetings?year=${year}`, 300);
  const sortedMeetings = [...meetings].sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime()).slice(0, 6);

  const withSessions = await Promise.all(sortedMeetings.map(async (meeting) => {
    const sessions = await fetchJson<OpenF1Session[]>(`/sessions?meeting_key=${meeting.meeting_key}`, 300);
    return {
      meetingKey: meeting.meeting_key,
      meetingName: meeting.meeting_name,
      location: meeting.location,
      country: meeting.country_name,
      sessions: sessions
        .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
        .map((s) => ({ sessionKey: s.session_key, sessionName: s.session_name, sessionStart: s.date_start }))
    };
  }));

  const meetingsWithSessions = withSessions.filter((m) => m.sessions.length > 0);
  let defaultSessionKey: number | null = null;

  for (const meeting of meetingsWithSessions) {
    for (const session of meeting.sessions) {
      const laps = await fetchJson<OpenF1Lap[]>(`/laps?session_key=${session.sessionKey}&lap_number>=1`, 60);
      if (laps.length > 0) {
        defaultSessionKey = session.sessionKey;
        break;
      }
    }
    if (defaultSessionKey) break;
  }

  return { meetings: meetingsWithSessions, defaultSessionKey };
}

export async function getLapAnalysisBySession(sessionKey: number): Promise<{ rows: LapAnalysisRow[]; source: "OPENF1" | "OPENF1 WAITING" }> {
  const [laps, stints, positions, intervals] = await Promise.all([
    fetchJson<OpenF1Lap[]>(`/laps?session_key=${sessionKey}`),
    fetchJson<OpenF1Stint[]>(`/stints?session_key=${sessionKey}`),
    fetchJson<OpenF1Position[]>(`/position?session_key=${sessionKey}`),
    fetchJson<OpenF1Interval[]>(`/intervals?session_key=${sessionKey}`)
  ]);

  if (!laps.length) {
    return { rows: [], source: "OPENF1 WAITING" };
  }

  const byDriver = new Map<number, LapAnalysisRow>();

  for (const lap of laps) {
    const existing = byDriver.get(lap.driver_number) ?? {
      driver: toDriverCode(lap.driver_number),
      bestLap: "--",
      latestLap: "--",
      laps: 0,
      lastKnownPosition: "--",
      gap: "--",
      stint: "--"
    };

    existing.laps = Math.max(existing.laps, lap.lap_number);
    existing.latestLap = formatLap(lap.lap_duration);

    if (lap.lap_duration && (existing.bestLap === "--" || lap.lap_duration < Number(existing.bestLap.replace(":", "")))) {
      existing.bestLap = formatLap(lap.lap_duration);
    }

    byDriver.set(lap.driver_number, existing);
  }

  for (const stint of stints) {
    const item = byDriver.get(stint.driver_number);
    if (item) {
      const range = stint.lap_start && stint.lap_end ? `${stint.lap_start}-${stint.lap_end}` : "--";
      item.stint = `${stint.compound ?? "未知"} ${range}`;
    }
  }

  for (const pos of positions) {
    const item = byDriver.get(pos.driver_number);
    if (item && pos.position) item.lastKnownPosition = `P${pos.position}`;
  }

  for (const itv of intervals) {
    const item = byDriver.get(itv.driver_number);
    if (item) item.gap = itv.interval ?? itv.gap_to_leader ?? "--";
  }

  return { rows: [...byDriver.values()].sort((a, b) => a.driver.localeCompare(b.driver)), source: "OPENF1" };
}

export const lapAnalysisDemoRows: LapAnalysisRow[] = [
  { driver: "1", bestLap: "1:33.622", latestLap: "1:33.918", laps: 18, lastKnownPosition: "P1", gap: "LEADER", stint: "MEDIUM 1-18" },
  { driver: "4", bestLap: "1:33.800", latestLap: "1:34.004", laps: 18, lastKnownPosition: "P2", gap: "+1.4", stint: "MEDIUM 1-18" }
];
