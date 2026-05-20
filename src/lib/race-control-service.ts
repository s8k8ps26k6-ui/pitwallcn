import type { RaceControlMessage } from "@/lib/types";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";
const MAX_SELECTOR_MEETINGS = 4;

type OpenF1Meeting = {
  meeting_key: number;
  meeting_name: string;
  location: string;
  country_name: string;
  date_start: string;
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

export type RaceControlSelectorSession = {
  sessionKey: number;
  sessionName: string;
  sessionStart: string;
};

export type RaceControlSelectorMeeting = {
  meetingKey: number;
  meetingName: string;
  location: string;
  country: string;
  sessions: RaceControlSelectorSession[];
};

function buildOpenF1Url(path: string, params: Record<string, string | number>) {
  const url = new URL(`${OPENF1_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  return url.toString();
}

async function fetchOpenF1<T>(path: string, params: Record<string, string | number>) {
  const response = await fetch(buildOpenF1Url(path, params), { next: { revalidate: 120 } });
  if (!response.ok) throw new Error(`OpenF1 request failed: ${response.status}`);
  return (await response.json()) as T;
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

function mapRaceControlCategory(row: OpenF1RaceControl): RaceControlMessage["category"] {
  const text = `${row.category ?? ""} ${row.flag ?? ""} ${row.message ?? ""}`.toUpperCase();

  if (text.includes("SAFETY") || text.includes("VSC")) return "SAFETY_CAR";
  if (text.includes("FLAG") || text.includes("YELLOW") || text.includes("GREEN") || text.includes("RED") || text.includes("CHEQUERED")) return "FLAG";
  if (text.includes("INCIDENT") || text.includes("INVESTIGAT") || text.includes("TRACK LIMIT") || text.includes("COLLISION") || text.includes("NOTED")) return "INCIDENT";
  return "NOTICE";
}

function translateRaceControlMessage(message: string) {
  let result = message.trim();

  const replacements: Array<[RegExp, string]> = [
    [/^CHEQUERED FLAG$/i, "方格旗，赛段结束"],
    [/^GREEN FLAG$/i, "绿旗，赛道恢复正常"],
    [/^YELLOW FLAG$/i, "黄旗，赛道存在危险"],
    [/^DOUBLE YELLOW FLAG$/i, "双黄旗，赛道存在严重危险"],
    [/^RED FLAG$/i, "红旗，赛段暂停"],
    [/^BLUE FLAG$/i, "蓝旗，后方快车接近"],
    [/VIRTUAL SAFETY CAR DEPLOYED/i, "虚拟安全车已部署"],
    [/VIRTUAL SAFETY CAR ENDING/i, "虚拟安全车即将结束"],
    [/VIRTUAL SAFETY CAR ENDED/i, "虚拟安全车已结束"],
    [/SAFETY CAR DEPLOYED/i, "安全车已部署"],
    [/SAFETY CAR IN THIS LAP/i, "安全车本圈进站"],
    [/DRS ENABLED/i, "DRS 已启用"],
    [/DRS DISABLED/i, "DRS 已关闭"],
    [/PIT EXIT OPEN/i, "维修区出口开放"],
    [/PIT EXIT CLOSED/i, "维修区出口关闭"],
    [/SESSION STARTED/i, "赛段开始"],
    [/SESSION RESUMED/i, "赛段恢复"],
    [/SESSION SUSPENDED/i, "赛段暂停"],
    [/SESSION ENDED/i, "赛段结束"],
    [/TRACK LIMITS/i, "赛道边界"],
    [/INCIDENT NOTED/i, "事件已记录"],
    [/NO FURTHER INVESTIGATION/i, "无需进一步调查"],
    [/INVESTIGATION/i, "调查中"],
    [/LAP TIME DELETED/i, "单圈成绩被删除"],
    [/TIME DELETED/i, "成绩被删除"],
    [/NOTED/i, "已记录"],
    [/CARS (\d+) AND (\d+)/gi, "$1 号车与 $2 号车"],
    [/CAR (\d+)/gi, "$1 号车"],
    [/TURN (\d+)/gi, "第 $1 弯"],
    [/LAP (\d+)/gi, "第 $1 圈"],
    [/DEBRIS/i, "赛道碎片"],
    [/STOPPED ON TRACK/i, "停在赛道上"],
    [/OFF TRACK/i, "驶离赛道"],
    [/UNSAFE RELEASE/i, "不安全释放"],
    [/SPEEDING IN THE PIT LANE/i, "维修区超速"],
    [/CAUSING A COLLISION/i, "造成碰撞"],
    [/IMPEDING/i, "阻挡其他车辆"]
  ];

  replacements.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });

  return result;
}

function normalizeRaceControl(rows: OpenF1RaceControl[]): RaceControlMessage[] {
  return rows
    .filter((row) => row.message)
    .sort((a, b) => new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime())
    .slice(-40)
    .reverse()
    .map((row, index) => ({
      id: `${row.session_key ?? "session"}-${row.date ?? "row"}-${index}`,
      timestamp: formatRaceControlTimestamp(row.date),
      date: row.date,
      category: mapRaceControlCategory(row),
      flag: row.flag,
      lapNumber: row.lap_number,
      scope: row.scope,
      message: translateRaceControlMessage(row.message ?? "Race control message")
    }));
}

async function buildMeetingSelection(meeting: OpenF1Meeting, now: number): Promise<RaceControlSelectorMeeting | null> {
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

export async function getRaceControlSelectionData() {
  const now = Date.now();
  const currentYear = new Date().getUTCFullYear();
  const candidateYears = [currentYear, currentYear - 1, currentYear - 2].filter((year) => year >= 2023);
  const meetingsWithSessions: RaceControlSelectorMeeting[] = [];

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
    meetingsWithSessions.push(...meetingSelections.filter((meeting): meeting is RaceControlSelectorMeeting => meeting !== null));

    if (meetingsWithSessions.length >= MAX_SELECTOR_MEETINGS) break;
  }

  return {
    meetings: meetingsWithSessions.slice(0, MAX_SELECTOR_MEETINGS),
    defaultSessionKey: meetingsWithSessions[0]?.sessions[0]?.sessionKey ?? null,
    source: meetingsWithSessions.length ? "openf1" as const : "openf1-empty" as const
  };
}

export async function getRaceControlFeedBySession(sessionKey: number) {
  try {
    const rows = await fetchOpenF1<OpenF1RaceControl[]>("/race_control", { session_key: sessionKey });
    return {
      data: normalizeRaceControl(rows),
      source: "openf1" as const,
      sessionName: `Session ${sessionKey}`
    };
  } catch {
    return {
      data: [],
      source: "openf1-error" as const,
      sessionName: `Session ${sessionKey}`
    };
  }
}

export async function getRaceControlFeed() {
  try {
    const rows = await fetchOpenF1<OpenF1RaceControl[]>("/race_control", { session_key: "latest" });
    return {
      data: normalizeRaceControl(rows),
      source: "openf1" as const,
      sessionName: "Latest session"
    };
  } catch {
    return {
      data: [],
      source: "openf1-error" as const,
      sessionName: "OpenF1 unavailable"
    };
  }
}
