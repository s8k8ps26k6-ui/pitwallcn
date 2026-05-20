const OPENF1_BASE_URL = "https://api.openf1.org/v1";
const MAX_SELECTOR_MEETINGS = 4;

type OpenF1Meeting = {
  meeting_key: number;
  meeting_name: string;
  location: string;
  country_name: string;
  date_start: string;
};

type OpenF1Session = {
  session_key?: number;
  meeting_key?: number;
  session_name: string;
  date_start: string;
};

type OpenF1Lap = {
  driver_number: number;
  lap_number: number;
  lap_duration?: number;
  duration_sector_1?: number;
  duration_sector_2?: number;
  duration_sector_3?: number;
};

type OpenF1Stint = {
  driver_number: number;
  stint_number?: number;
  compound?: string;
  lap_start?: number;
  lap_end?: number;
};

type OpenF1Position = {
  driver_number: number;
  position?: number;
  date?: string;
};

type OpenF1Interval = {
  driver_number: number;
  interval?: string;
  gap_to_leader?: string;
  date?: string;
};

type OpenF1Driver = {
  driver_number: number;
  broadcast_name?: string;
  full_name?: string;
  name_acronym?: string;
};

export type LapAnalysisSelectorSession = {
  sessionKey: number;
  sessionName: string;
  sessionStart: string;
};

export type LapAnalysisSelectorMeeting = {
  meetingKey: number;
  meetingName: string;
  location: string;
  country: string;
  sessions: LapAnalysisSelectorSession[];
};

export type LapAnalysisRow = {
  driverNumber: number;
  driver: string;
  driverName: string;
  bestLap: string;
  latestLap: string;
  laps: number;
  position: string;
  gap: string;
  stint: string;
  s1: string;
  s2: string;
  s3: string;
};

const fallbackDriverNames: Record<number, string> = {
  1: "VER",
  4: "NOR",
  5: "BOR",
  6: "HAD",
  7: "DOO",
  10: "GAS",
  12: "ANT",
  14: "ALO",
  16: "LEC",
  18: "STR",
  22: "TSU",
  23: "ALB",
  27: "HUL",
  30: "LAW",
  31: "OCO",
  44: "HAM",
  55: "SAI",
  63: "RUS",
  81: "PIA",
  87: "BEA"
};

async function fetchOpenF1<T>(path: string, params: Record<string, string | number>) {
  const url = new URL(`${OPENF1_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));

  const response = await fetch(url.toString(), { next: { revalidate: 120 } });
  if (!response.ok) throw new Error(`OpenF1 request failed: ${response.status}`);
  return (await response.json()) as T;
}

function formatLapTime(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return "--";
  const minutes = Math.floor(seconds / 60);
  const rest = (seconds % 60).toFixed(3).padStart(6, "0");
  return `${minutes}:${rest}`;
}

function formatSector(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return "--";
  return seconds.toFixed(3);
}

function compareLapTime(a: string, b: string) {
  if (a === "--") return false;
  if (b === "--") return true;

  const toSeconds = (value: string) => {
    const [minutes, seconds] = value.split(":");
    return Number(minutes) * 60 + Number(seconds);
  };

  return toSeconds(a) < toSeconds(b);
}

function getPositionNumber(position: string) {
  const parsed = Number(position.replace("P", ""));
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function sortLapAnalysisRows(a: LapAnalysisRow, b: LapAnalysisRow) {
  const positionDiff = getPositionNumber(a.position) - getPositionNumber(b.position);
  if (positionDiff !== 0) return positionDiff;

  const lapDiff = b.laps - a.laps;
  if (lapDiff !== 0) return lapDiff;

  return a.driverNumber - b.driverNumber;
}

function buildDriverNameMap(drivers: OpenF1Driver[]) {
  const map = new Map<number, string>();

  for (const driver of drivers) {
    const name = driver.name_acronym || driver.broadcast_name || driver.full_name;
    if (name) map.set(driver.driver_number, name);
  }

  return map;
}

function getDriverName(driverNumber: number, driverNames: Map<number, string>) {
  return driverNames.get(driverNumber) ?? fallbackDriverNames[driverNumber] ?? "DRIVER";
}

async function buildMeetingSelection(meeting: OpenF1Meeting, now: number): Promise<LapAnalysisSelectorMeeting | null> {
  try {
    const sessions = await fetchOpenF1<OpenF1Session[]>("/sessions", { meeting_key: meeting.meeting_key });
    const availableSessions = sessions
      .filter((session) => session.session_key && session.session_name && session.date_start && new Date(session.date_start).getTime() <= now)
      .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
      .map((session) => ({
        sessionKey: Number(session.session_key),
        sessionName: session.session_name,
        sessionStart: session.date_start
      }));

    if (!availableSessions.length) return null;

    return {
      meetingKey: meeting.meeting_key,
      meetingName: meeting.meeting_name,
      location: meeting.location,
      country: meeting.country_name,
      sessions: availableSessions
    };
  } catch {
    return null;
  }
}

export async function getLapAnalysisSelectionData() {
  const now = Date.now();
  const currentYear = new Date().getUTCFullYear();
  const candidateYears = [currentYear, currentYear - 1, currentYear - 2].filter((year) => year >= 2023);
  const meetingsWithSessions: LapAnalysisSelectorMeeting[] = [];

  for (const year of candidateYears) {
    let meetings: OpenF1Meeting[] = [];

    try {
      meetings = await fetchOpenF1<OpenF1Meeting[]>("/meetings", { year });
    } catch {
      continue;
    }

    const remainingSlots = Math.max(MAX_SELECTOR_MEETINGS - meetingsWithSessions.length, 0);
    const recentMeetings = meetings
      .filter((meeting) => new Date(meeting.date_start).getTime() <= now)
      .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
      .slice(0, remainingSlots || MAX_SELECTOR_MEETINGS);

    const meetingSelections = await Promise.all(recentMeetings.map((meeting) => buildMeetingSelection(meeting, now)));
    meetingsWithSessions.push(...meetingSelections.filter((meeting): meeting is LapAnalysisSelectorMeeting => meeting !== null));

    if (meetingsWithSessions.length >= MAX_SELECTOR_MEETINGS) break;
  }

  return {
    meetings: meetingsWithSessions.slice(0, MAX_SELECTOR_MEETINGS),
    defaultSessionKey: meetingsWithSessions[0]?.sessions[0]?.sessionKey ?? null,
    source: "openf1" as const
  };
}

export async function getLapAnalysisBySession(sessionKey: number) {
  try {
    const [laps, stints, positions, intervals, drivers] = await Promise.all([
      fetchOpenF1<OpenF1Lap[]>("/laps", { session_key: sessionKey }),
      fetchOpenF1<OpenF1Stint[]>("/stints", { session_key: sessionKey }).catch(() => []),
      fetchOpenF1<OpenF1Position[]>("/position", { session_key: sessionKey }).catch(() => []),
      fetchOpenF1<OpenF1Interval[]>("/intervals", { session_key: sessionKey }).catch(() => []),
      fetchOpenF1<OpenF1Driver[]>("/drivers", { session_key: sessionKey }).catch(() => [])
    ]);

    if (!laps.length) return { rows: [], source: "openf1-waiting" as const };

    const rows = new Map<number, LapAnalysisRow>();
    const driverNames = buildDriverNameMap(drivers);

    for (const lap of laps) {
      const latestLap = formatLapTime(lap.lap_duration);
      const driverName = getDriverName(lap.driver_number, driverNames);
      const existing = rows.get(lap.driver_number) ?? {
        driverNumber: lap.driver_number,
        driver: `${lap.driver_number} ${driverName}`,
        driverName,
        bestLap: "--",
        latestLap: "--",
        laps: 0,
        position: "--",
        gap: "--",
        stint: "--",
        s1: "--",
        s2: "--",
        s3: "--"
      };

      existing.laps = Math.max(existing.laps, lap.lap_number);
      existing.latestLap = latestLap;
      existing.s1 = formatSector(lap.duration_sector_1);
      existing.s2 = formatSector(lap.duration_sector_2);
      existing.s3 = formatSector(lap.duration_sector_3);

      if (compareLapTime(latestLap, existing.bestLap)) {
        existing.bestLap = latestLap;
      }

      rows.set(lap.driver_number, existing);
    }

    for (const stint of stints) {
      const row = rows.get(stint.driver_number);
      if (!row) continue;
      const range = stint.lap_start && stint.lap_end ? `${stint.lap_start}-${stint.lap_end}` : "--";
      row.stint = `${stint.compound ?? "UNKNOWN"} ${range}`;
    }

    for (const position of positions) {
      const row = rows.get(position.driver_number);
      if (row && position.position) row.position = `P${position.position}`;
    }

    for (const interval of intervals) {
      const row = rows.get(interval.driver_number);
      if (row) row.gap = interval.interval ?? interval.gap_to_leader ?? "--";
    }

    return {
      rows: [...rows.values()].sort(sortLapAnalysisRows),
      source: "openf1" as const
    };
  } catch {
    return { rows: [], source: "openf1-error" as const };
  }
}
