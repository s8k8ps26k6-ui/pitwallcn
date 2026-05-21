const OPENF1_BASE_URL = "https://api.openf1.org/v1";
const MAX_SELECTOR_MEETINGS = 8;

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

type OpenF1Weather = {
  air_temperature?: number | null;
  date?: string;
  humidity?: number | null;
  meeting_key?: number;
  pressure?: number | null;
  rainfall?: number | boolean | null;
  session_key?: number;
  track_temperature?: number | null;
  wind_direction?: number | null;
  wind_speed?: number | null;
};

export type WeatherSelectorSession = {
  sessionKey: number;
  sessionName: string;
  sessionStart: string;
};

export type WeatherSelectorMeeting = {
  meetingKey: number;
  meetingName: string;
  location: string;
  country: string;
  sessions: WeatherSelectorSession[];
};

export type WeatherPoint = {
  date: string;
  time: string;
  airTemperature: string;
  airTemperatureValue: number | null;
  trackTemperature: string;
  trackTemperatureValue: number | null;
  humidity: string;
  humidityValue: number | null;
  pressure: string;
  rainfall: boolean;
  rainLabel: "有雨" | "无雨";
  windDirection: string;
  windDirectionValue: number | null;
  windSpeed: string;
  windSpeedValue: number | null;
};

export type WeatherSummary = {
  latest: WeatherPoint | null;
  sampleCount: number;
  averageTrackTemperature: string;
  maxTrackTemperature: string;
  minTrackTemperature: string;
  maxWindSpeed: string;
  rainySamples: number;
};

async function fetchOpenF1<T>(path: string, params: Record<string, string | number>) {
  const url = new URL(`${OPENF1_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));

  const response = await fetch(url.toString(), { next: { revalidate: 120 } });
  if (!response.ok) throw new Error(`OpenF1 request failed: ${response.status}`);
  return (await response.json()) as T;
}

function formatTime(date?: string) {
  if (!date) return "--:--";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "--:--";

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai"
  }).format(parsed);
}

function formatNumber(value?: number | null, suffix = "", digits = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "--";
  return `${value.toFixed(digits)}${suffix}`;
}

function formatPercentage(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "--";
  return `${Math.round(value)}%`;
}

function formatPressure(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "--";
  return `${value.toFixed(1)} mbar`;
}

function formatWindDirection(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "--";

  const directions = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
  const index = Math.round((((value % 360) + 360) % 360) / 45) % directions.length;
  return `${directions[index]} ${Math.round(value)}°`;
}

function isRainfall(value?: number | boolean | null) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return false;
}

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeWeather(rows: OpenF1Weather[]) {
  return rows
    .filter((row) => row.date)
    .sort((a, b) => new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime())
    .slice(-240)
    .map((row) => {
      const rainfall = isRainfall(row.rainfall);

      return {
        date: row.date ?? "",
        time: formatTime(row.date),
        airTemperature: formatNumber(row.air_temperature, "°C"),
        airTemperatureValue: row.air_temperature ?? null,
        trackTemperature: formatNumber(row.track_temperature, "°C"),
        trackTemperatureValue: row.track_temperature ?? null,
        humidity: formatPercentage(row.humidity),
        humidityValue: row.humidity ?? null,
        pressure: formatPressure(row.pressure),
        rainfall,
        rainLabel: rainfall ? "有雨" : "无雨",
        windDirection: formatWindDirection(row.wind_direction),
        windDirectionValue: row.wind_direction ?? null,
        windSpeed: formatNumber(row.wind_speed, " m/s"),
        windSpeedValue: row.wind_speed ?? null
      } satisfies WeatherPoint;
    });
}

function buildWeatherSummary(points: WeatherPoint[]): WeatherSummary {
  const trackTemperatures = points
    .map((point) => point.trackTemperatureValue)
    .filter((value): value is number => value !== null && Number.isFinite(value));
  const windSpeeds = points
    .map((point) => point.windSpeedValue)
    .filter((value): value is number => value !== null && Number.isFinite(value));

  const averageTrack = average(trackTemperatures);
  const maxTrack = trackTemperatures.length ? Math.max(...trackTemperatures) : null;
  const minTrack = trackTemperatures.length ? Math.min(...trackTemperatures) : null;
  const maxWind = windSpeeds.length ? Math.max(...windSpeeds) : null;

  return {
    latest: points.at(-1) ?? null,
    sampleCount: points.length,
    averageTrackTemperature: formatNumber(averageTrack, "°C"),
    maxTrackTemperature: formatNumber(maxTrack, "°C"),
    minTrackTemperature: formatNumber(minTrack, "°C"),
    maxWindSpeed: formatNumber(maxWind, " m/s"),
    rainySamples: points.filter((point) => point.rainfall).length
  };
}

async function buildMeetingSelection(meeting: OpenF1Meeting, now: number): Promise<WeatherSelectorMeeting | null> {
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

export async function getWeatherSelectionData() {
  const now = Date.now();
  const currentYear = new Date().getUTCFullYear();
  const candidateYears = [currentYear, currentYear - 1, currentYear - 2].filter((year) => year >= 2023);
  const meetingsWithSessions: WeatherSelectorMeeting[] = [];

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
    meetingsWithSessions.push(...meetingSelections.filter((meeting): meeting is WeatherSelectorMeeting => meeting !== null));

    if (meetingsWithSessions.length >= MAX_SELECTOR_MEETINGS) break;
  }

  return {
    meetings: meetingsWithSessions.slice(0, MAX_SELECTOR_MEETINGS),
    defaultSessionKey: meetingsWithSessions[0]?.sessions[0]?.sessionKey ?? null,
    source: meetingsWithSessions.length ? "openf1" as const : "openf1-empty" as const
  };
}

export async function getWeatherBySession(sessionKey: number) {
  try {
    const rows = await fetchOpenF1<OpenF1Weather[]>("/weather", { session_key: sessionKey });
    const points = normalizeWeather(rows);

    if (!points.length) {
      return { points: [], summary: buildWeatherSummary([]), source: "openf1-waiting" as const };
    }

    return {
      points,
      summary: buildWeatherSummary(points),
      source: "openf1" as const
    };
  } catch {
    return { points: [], summary: buildWeatherSummary([]), source: "openf1-error" as const };
  }
}
