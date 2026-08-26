import Link from "next/link";
import type { UrlObject } from "url";
import { DataSessionSelector } from "@/components/data-session-selector";
import styles from "@/app/data-pages.module.css";
import { parseSessionKey, sourceLabel, translateMeetingName, translateSessionName } from "@/lib/f1-labels";
import { getLapAnalysisBySession } from "@/lib/lap-analysis-service";
import { getRaceControlFeedBySession } from "@/lib/race-control-service";
import { getResultsBySession, getResultsSelectionData } from "@/lib/results-service";
import { getWeatherBySession } from "@/lib/weather-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MODULE_TIMEOUT_MS = 6500;
type RaceWeekendSearchParams = { session?: string };
type ModulePath = "/results" | "/race-control" | "/lap-analysis" | "/weather";

const fallbackResults = { rows: [], source: "openf1-error" as const };
const fallbackRaceControl = { data: [], source: "openf1-error" as const, sessionName: "OpenF1 timeout" };
const fallbackLapAnalysis = { rows: [], source: "openf1-error" as const };
const fallbackWeather = {
  points: [],
  summary: { latest: null, sampleCount: 0, averageTrackTemperature: "—", maxTrackTemperature: "—", minTrackTemperature: "—", maxWindSpeed: "—", rainySamples: 0 },
  source: "openf1-error" as const
};

function moduleHref(pathname: ModulePath, sessionKey: number | null): UrlObject {
  return sessionKey ? { pathname, query: { session: String(sessionKey) } } : { pathname };
}

async function withTimeout<T>(promise: Promise<T>, fallback: T) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => { timeout = setTimeout(() => resolve(fallback), MODULE_TIMEOUT_MS); })
    ]);
  } catch {
    return fallback;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export default async function RaceWeekendPage({ searchParams }: { searchParams: Promise<RaceWeekendSearchParams> }) {
  const resolved = await searchParams;
  const selection = await getResultsSelectionData();
  const selectedSessionKey = parseSessionKey(resolved.session) ?? selection.defaultSessionKey;
  const selectedMeeting = selection.meetings.find((meeting) =>
    meeting.sessions.some((session) => session.sessionKey === selectedSessionKey)
  );
  const selectedSession = selectedMeeting?.sessions.find((session) => session.sessionKey === selectedSessionKey);

  const [results, raceControl, lapAnalysis, weather] = selectedSessionKey
    ? await Promise.all([
        withTimeout(getResultsBySession(selectedSessionKey), fallbackResults),
        withTimeout(getRaceControlFeedBySession(selectedSessionKey), fallbackRaceControl),
        withTimeout(getLapAnalysisBySession(selectedSessionKey), fallbackLapAnalysis),
        withTimeout(getWeatherBySession(selectedSessionKey), fallbackWeather)
      ])
    : [
        { rows: [], source: "openf1-waiting" as const },
        { data: [], source: "openf1-waiting" as const, sessionName: "Waiting session" },
        { rows: [], source: "openf1-waiting" as const },
        { ...fallbackWeather, source: "openf1-waiting" as const }
      ];

  const meetingName = selectedMeeting ? translateMeetingName(selectedMeeting.meetingName) : null;
  const sessionName = selectedSession ? translateSessionName(selectedSession.sessionName) : null;
  const winner = results.rows[0];
  const fastestLap = lapAnalysis.rows.find((row) => row.bestLap !== "—" && row.bestLap !== "--");
  const latestWeather = weather.summary.latest;
  const available = [results.rows.length, raceControl.data.length, lapAnalysis.rows.length, weather.summary.sampleCount].filter(Boolean).length;

  const modules = [
    {
      title: "比赛结果",
      description: winner ? `${winner.driver} 位列当前分类表首位。` : "查看完赛顺位、车队与时间差。",
      meta: `${results.rows.length} 条记录 · ${sourceLabel(results.source)}`,
      href: moduleHref("/results", selectedSessionKey)
    },
    {
      title: "赛会控制",
      description: raceControl.data[0]?.message ?? "查看旗语、安全车、调查和官方通知。",
      meta: `${raceControl.data.length} 条消息 · ${sourceLabel(raceControl.source)}`,
      href: moduleHref("/race-control", selectedSessionKey)
    },
    {
      title: "圈速分析",
      description: fastestLap ? `${fastestLap.driver} 最快圈 ${fastestLap.bestLap}。` : "比较最快圈、分段、差距与 stint。",
      meta: `${lapAnalysis.rows.length} 位车手 · ${sourceLabel(lapAnalysis.source)}`,
      href: moduleHref("/lap-analysis", selectedSessionKey)
    },
    {
      title: "赛道天气",
      description: latestWeather ? `最新赛道温度 ${latestWeather.trackTemperature}。` : "查看温度、湿度、风向和降雨采样。",
      meta: `${weather.summary.sampleCount} 条采样 · ${sourceLabel(weather.source)}`,
      href: moduleHref("/weather", selectedSessionKey)
    }
  ];

  return (
    <main className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>单站复盘</h1>
          <p className={styles.lede}>选择赛段后进入结果、赛控、圈速与天气。</p>
        </div>
        <p className={styles.source}>MODULES AVAILABLE · {available}/4</p>
      </header>

      <DataSessionSelector
        action="/race-weekend"
        anchor="race-weekend-session-selector"
        meetings={selection.meetings}
        selectedMeetingName={meetingName}
        selectedSessionKey={selectedSessionKey}
        selectedSessionName={sessionName}
        submitLabel="载入复盘"
      />

      {selectedSessionKey ? (
        <>
          <section className={styles.eventSummary} aria-label="复盘上下文">
            <span>大奖赛<strong>{meetingName ?? "—"}</strong></span>
            <span>赛段<strong>{sessionName ?? "—"}</strong></span>
            <span>Session ID<strong>{selectedSessionKey}</strong></span>
            <span>完整度<strong>{available}/4</strong></span>
          </section>

          <nav className={styles.moduleMap} aria-label="单站复盘模块">
            {modules.map((module, index) => (
              <Link className={styles.moduleLink} href={module.href} key={module.title}>
                <span className={styles.moduleIndex}>{String(index + 1).padStart(2, "0")}</span>
                <span><strong className={styles.moduleTitle}>{module.title}</strong><span className={styles.moduleDescription}>{module.description}</span></span>
                <span className={styles.moduleMeta}>{module.meta}</span>
              </Link>
            ))}
          </nav>
        </>
      ) : (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>当前没有可用于复盘的赛段</h2>
          <p>OpenF1 未返回可用赛段时，页面不会注入 2024 年手工 Session 作为 2026 产品的默认内容。</p>
        </section>
      )}
    </main>
  );
}
