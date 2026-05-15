const OPENF1_BASE_URL = "https://api.openf1.org/v1";

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
  session_type?: string;
  date_start: string;
};

type OpenF1SessionResult = {
  dnf?: boolean;
  dns?: boolean;
  dsq?: boolean;
  driver_number: number;
  duration?: number | Array<number | null> | null;
  gap_to_leader?: number | string | Array<number | string | null> | null;
  number_of_laps?: number | null;
  meeting_key?: number;
  position?: number | null;
  session_key?: number;
};

type OpenF1Driver = {
  driver_number: number;
  broadcast_name?: string;
  full_name?: string;
  name_acronym?: string;
  team_name?: string;
};

export type ResultsSelectorSession = {
  sessionKey: number;
  sessionName: string;
  sessionStart: string;
  category: "qualifying" | "sprint" | "race";
};

export type ResultsSelectorMeeting = {
  meetingKey: number;
  meetingName: string;
  location: string;
  country: string;
  sessions: ResultsSelectorSession[];
};

export type ResultsRow = {
  position: string;
  driverNumber: number;
  driver: string;
  driverName: string;
  team: string;
  timeOrGap: string;
  completedLaps: string;
  status: "完赛" | "退赛" | "未起步" | "取消成绩";
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

function getSessionCategory(sessionName: string): ResultsSelectorSession["category"] | null {
  const normalized = sessionName.toLowerCase().trim();

  if (normalized === "race") return "race";
  if (normalized === "sprint") return "sprint";
  if (normalized === "qualifying") return "qualifying";

  return null;
}

function sortSessionsByPriority(a: ResultsSelectorSession, b: ResultsSelectorSession) {
  const priority: Record<ResultsSelectorSession["category"], number> = {
    race: 0,
    sprint: 1,
    qualifying: 2
  };

  const priorityDiff = priority[a.category] - priority[b.category];
  if (priorityDiff !== 0) return priorityDiff;

  return new Date(b.sessionStart).getTime() - new Date(a.sessionStart).getTime();
}

function pickLastValue<T>(value?: T | T[] | null) {
  if (Array.isArray(value)) {
    const filtered = value.filter((item): item is T => item !== null && item !== undefined);
    return filtered.at(-1);
  }

  return value ?? undefined;
}

function formatSeconds(seconds?: number | null) {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return "--";

  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const remaining = (seconds % 60).toFixed(3).padStart(6, "0");
    return `${hours}:${minutes}:${remaining}`;
  }

  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remaining = (seconds % 60).toFixed(3).padStart(6, "0");
    return `${minutes}:${remaining}`;
  }

  return seconds.toFixed(3);
}

function formatGap(value?: number | string | null) {
  if (value === null || value === undefined) return "--";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "0") return "0";
    if (trimmed.startsWith("+") || trimmed.toLowerCase().includes("lap")) return trimmed;
    return `+${trimmed}`;
  }

  if (!Number.isFinite(value)) return "--";
  if (value === 0) return "0";
  return `+${value.toFixed(3)}`;
}

function hasNonZeroGap(value?: number | string | null) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "" && value.trim() !== "0";
  return Number.isFinite(value) && value !== 0;
}

function formatTimeOrGap(result: OpenF1SessionResult) {
  const gap = pickLastValue(result.gap_to_leader);
  const duration = pickLastValue(result.duration);

  if (hasNonZeroGap(gap)) return formatGap(gap);

  if (typeof duration === "number") return formatSeconds(duration);
  return "领先者";
}

function buildDriverInfoMap(drivers: OpenF1Driver[]) {
  const map = new Map<number, { name: string; team: string }>();

  for (const driver of drivers) {
    const name = driver.name_acronym || driver.broadcast_name || driver.full_name || fallbackDriverNames[driver.driver_number] || "DRIVER";
    map.set(driver.driver_number, {
      name,
      team: driver.team_name || "车队暂无"
    });
  }

  return map;
}

function getDriverInfo(driverNumber: number, driverInfo: Map<number, { name: string; team: string }>) {
  return driverInfo.get(driverNumber) ?? { name: fallbackDriverNames[driverNumber] ?? "DRIVER", team: "车队暂无" };
}

function getStatus(result: OpenF1SessionResult): ResultsRow["status"] {
  if (result.dsq) return "取消成绩";
  if (result.dns) return "未起步";
  if (result.dnf) return "退赛";
  return "完赛";
}

function sortResultsRows(a: ResultsRow, b: ResultsRow) {
  const aPosition = Number(a.position.replace("P", ""));
  const bPosition = Number(b.position.replace("P", ""));
  const positionDiff = (Number.isFinite(aPosition) ? aPosition : Number.POSITIVE_INFINITY) - (Number.isFinite(bPosition) ? bPosition : Number.POSITIVE_INFINITY);

  if (positionDiff !== 0) return positionDiff;
  return a.driverNumber - b.driverNumber;
}

export async function getResultsSelectionData() {
  const now = Date.now();
  const currentYear = new Date().getUTCFullYear();
  const candidateYears = [currentYear, currentYear - 1, currentYear - 2].filter((year) => year >= 2023);
  const meetingsWithSessions: ResultsSelectorMeeting[] = [];

  for (const year of candidateYears) {
    let meetings: OpenF1Meeting[] = [];

    try {
      meetings = await fetchOpenF1<OpenF1Meeting[]>("/meetings", { year });
    } catch {
      continue;
    }

    const recentMeetings = meetings
      .filter((meeting) => new Date(meeting.date_start).getTime() <= now)
      .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
      .slice(0, 6);

    for (const meeting of recentMeetings) {
      try {
        const sessions = await fetchOpenF1<OpenF1Session[]>("/sessions", { meeting_key: meeting.meeting_key });
        const availableSessions = sessions
          .map((session) => {
            const category = getSessionCategory(session.session_name);
            if (!session.session_key || !category || !session.date_start || new Date(session.date_start).getTime() > now) return null;

            return {
              sessionKey: Number(session.session_key),
              sessionName: session.session_name,
              sessionStart: session.date_start,
              category
            } satisfies ResultsSelectorSession;
          })
          .filter((session): session is ResultsSelectorSession => session !== null)
          .sort(sortSessionsByPriority);

        if (availableSessions.length) {
          meetingsWithSessions.push({
            meetingKey: meeting.meeting_key,
            meetingName: meeting.meeting_name,
            location: meeting.location,
            country: meeting.country_name,
            sessions: availableSessions
          });
        }
      } catch {
        continue;
      }
    }

    if (meetingsWithSessions.length >= 6) break;
  }

  let defaultSessionKey = meetingsWithSessions[0]?.sessions[0]?.sessionKey ?? null;

  for (const meeting of meetingsWithSessions) {
    for (const session of meeting.sessions) {
      try {
        const results = await fetchOpenF1<OpenF1SessionResult[]>("/session_result", { session_key: session.sessionKey });
        if (results.length) {
          defaultSessionKey = session.sessionKey;
          return { meetings: meetingsWithSessions, defaultSessionKey, source: "openf1" as const };
        }
      } catch {
        continue;
      }
    }
  }

  return { meetings: meetingsWithSessions, defaultSessionKey, source: "openf1" as const };
}

export async function getResultsBySession(sessionKey: number) {
  try {
    const [results, drivers] = await Promise.all([
      fetchOpenF1<OpenF1SessionResult[]>("/session_result", { session_key: sessionKey }),
      fetchOpenF1<OpenF1Driver[]>("/drivers", { session_key: sessionKey }).catch(() => [])
    ]);

    if (!results.length) return { rows: [], source: "openf1-waiting" as const };

    const driverInfo = buildDriverInfoMap(drivers);
    const rows = results.map((result) => {
      const driver = getDriverInfo(result.driver_number, driverInfo);
      return {
        position: result.position ? `P${result.position}` : "--",
        driverNumber: result.driver_number,
        driver: `${result.driver_number} ${driver.name}`,
        driverName: driver.name,
        team: driver.team,
        timeOrGap: formatTimeOrGap(result),
        completedLaps: result.number_of_laps === null || result.number_of_laps === undefined ? "--" : String(result.number_of_laps),
        status: getStatus(result)
      } satisfies ResultsRow;
    });

    return {
      rows: rows.sort(sortResultsRows),
      source: "openf1" as const
    };
  } catch {
    return { rows: [], source: "openf1-error" as const };
  }
}
