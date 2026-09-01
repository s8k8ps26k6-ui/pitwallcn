import type { Metadata } from "next";
import {
  RaceWeekView,
  type SelectedSessionContext,
} from "@/components/race-week/race-week-view";
import {
  getCurrentSeasonRace,
  getPrimaryRaceMoment,
} from "@/lib/atlas/race-detail";
import { getEventTheme } from "@/lib/event-theme";
import { getLiveTiming } from "@/lib/f1-service";
import { parseSessionKey } from "@/lib/f1-labels";
import { getLapAnalysisBySession } from "@/lib/lap-analysis-service";
import { getRaceControlFeedBySession } from "@/lib/race-control-service";
import {
  getResultsBySession,
  getResultsSelectionData,
} from "@/lib/results-service";
import { getWeatherBySession } from "@/lib/weather-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Race Week",
  description:
    "LAPMETRY Race Week：以真实赛历、Session、Timing、天气与赛会控制数据构成的赛事工作场。",
};

const DATA_TIMEOUT_MS = 6500;

type RaceWeekendSearchParams = {
  session?: string;
};

const fallbackSelection = {
  meetings: [],
  defaultSessionKey: 0,
  source: "openf1-empty" as const,
};

const fallbackResults = {
  rows: [],
  source: "openf1-error" as const,
};

const fallbackRaceControl = {
  data: [],
  source: "openf1-error" as const,
  sessionName: "OpenF1 unavailable",
};

const fallbackLapAnalysis = {
  rows: [],
  source: "openf1-error" as const,
};

const fallbackWeather = {
  points: [],
  summary: {
    latest: null,
    sampleCount: 0,
    averageTrackTemperature: "—",
    maxTrackTemperature: "—",
    minTrackTemperature: "—",
    maxWindSpeed: "—",
    rainySamples: 0,
  },
  source: "openf1-error" as const,
};

async function withTimeout<T>(promise: Promise<T>, fallback: T) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeout = setTimeout(() => resolve(fallback), DATA_TIMEOUT_MS);
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function findSelectedSession(
  sessionKey: number | null,
  selection: Awaited<ReturnType<typeof getResultsSelectionData>>,
): SelectedSessionContext | null {
  if (!sessionKey) return null;

  for (const meeting of selection.meetings) {
    const session = meeting.sessions.find(
      (candidate) => candidate.sessionKey === sessionKey,
    );
    if (session) return { meeting, session };
  }

  return null;
}

export default async function RaceWeekendPage({
  searchParams,
}: {
  searchParams: Promise<RaceWeekendSearchParams>;
}) {
  const now = new Date();
  const { race, phase } = getCurrentSeasonRace(now);
  const resolved = await searchParams;
  const requestedSessionKey = parseSessionKey(resolved.session);
  const selection = await withTimeout(
    getResultsSelectionData(),
    fallbackSelection,
  );
  const selected = findSelectedSession(requestedSessionKey, selection);
  const liveTiming = await getLiveTiming();

  const [results, raceControl, lapAnalysis, weather] = selected
    ? await Promise.all([
        withTimeout(
          getResultsBySession(selected.session.sessionKey),
          fallbackResults,
        ),
        withTimeout(
          getRaceControlFeedBySession(selected.session.sessionKey),
          fallbackRaceControl,
        ),
        withTimeout(
          getLapAnalysisBySession(selected.session.sessionKey),
          fallbackLapAnalysis,
        ),
        withTimeout(
          getWeatherBySession(selected.session.sessionKey),
          fallbackWeather,
        ),
      ])
    : [
        fallbackResults,
        fallbackRaceControl,
        fallbackLapAnalysis,
        fallbackWeather,
      ];

  return (
    <RaceWeekView
      lapAnalysis={lapAnalysis}
      liveTiming={liveTiming}
      moment={getPrimaryRaceMoment(race, now)}
      nowIso={now.toISOString()}
      phase={phase}
      race={race}
      raceControl={raceControl}
      requestedSessionKey={requestedSessionKey}
      results={results}
      selected={selected}
      selection={selection}
      theme={getEventTheme(race.race.id)}
      weather={weather}
    />
  );
}
