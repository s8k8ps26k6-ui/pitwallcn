import Link from "next/link";
import type { UrlObject } from "url";
import { RecapDrawerNav } from "@/components/recap-drawer-nav";
import { getLapAnalysisBySession } from "@/lib/lap-analysis-service";
import { getRaceControlFeedBySession } from "@/lib/race-control-service";
import { getResultsBySession, getResultsSelectionData } from "@/lib/results-service";
import { getWeatherBySession } from "@/lib/weather-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const RECAP_MODULE_TIMEOUT_MS = 6500;

type RaceWeekendSearchParams = {
  session?: string;
};

const manualFallbackMeetings = [
  {
    meetingKey: -11249,
    meetingName: "OpenF1 历史可用赛段",
    location: "Manual fallback",
    country: "OpenF1",
    sessions: [
      {
        sessionKey: 11249,
        sessionName: "Race",
        sessionStart: "2024-01-01T00:00:00Z",
        category: "race" as const
      }
    ]
  }
];

const fallbackResults = { rows: [], source: "openf1-error" as const };
const fallbackRaceControl = { data: [], source: "openf1-error" as const, sessionName: "OpenF1 timeout" };
const fallbackLapAnalysis = { rows: [], source: "openf1-error" as const };
const fallbackWeather = {
  points: [],
  summary: {
    latest: null,
    sampleCount: 0,
    averageTrackTemperature: "--",
    maxTrackTemperature: "--",
    minTrackTemperature: "--",
    maxWindSpeed: "--",
    rainySamples: 0
  },
  source: "openf1-error" as const
};

function parseSessionKey(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatSessionTime(iso: string) {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "时间未知";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai"
  }).format(parsed);
}

function translateSessionName(name: string) {
  const normalized = name.toLowerCase();
  if (normalized === "qualifying") return "排位赛";
  if (normalized === "sprint") return "冲刺赛";
  if (normalized === "race") return "正赛";
  return name;
}

function translateMeetingName(name: string) {
  const replacements: Array<[RegExp, string]> = [
    [/Australian Grand Prix/i, "澳大利亚大奖赛"],
    [/Chinese Grand Prix/i, "中国大奖赛"],
    [/Japanese Grand Prix/i, "日本大奖赛"],
    [/Miami Grand Prix/i, "迈阿密大奖赛"],
    [/Canadian Grand Prix/i, "加拿大大奖赛"],
    [/Monaco Grand Prix/i, "摩纳哥大奖赛"],
    [/Spanish Grand Prix/i, "西班牙大奖赛"],
    [/Austrian Grand Prix/i, "奥地利大奖赛"],
    [/British Grand Prix/i, "英国大奖赛"],
    [/Belgian Grand Prix/i, "比利时大奖赛"],
    [/Hungarian Grand Prix/i, "匈牙利大奖赛"],
    [/Dutch Grand Prix/i, "荷兰大奖赛"],
    [/Italian Grand Prix/i, "意大利大奖赛"],
    [/Azerbaijan Grand Prix/i, "阿塞拜疆大奖赛"],
    [/Singapore Grand Prix/i, "新加坡大奖赛"],
    [/United States Grand Prix/i, "美国大奖赛"],
    [/Mexico City Grand Prix/i, "墨西哥城大奖赛"],
    [/Sao Paulo Grand Prix/i, "圣保罗大奖赛"],
    [/Las Vegas Grand Prix/i, "拉斯维加斯大奖赛"],
    [/Qatar Grand Prix/i, "卡塔尔大奖赛"],
    [/Abu Dhabi Grand Prix/i, "阿布扎比大奖赛"]
  ];

  return replacements.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), name);
}

function sourceBadge(source: string) {
  if (source === "openf1") return "OPENF1";
  if (source.includes("waiting")) return "WAITING DATA";
  if (source.includes("error")) return "OPENF1 WAITING";
  if (source.includes("empty")) return "MANUAL MODE";
  return "API READY";
}

type ModulePath = "/results" | "/race-control" | "/lap-analysis" | "/weather";

function sessionHref(sessionKey: number | null) {
  return sessionKey ? `?session=${sessionKey}` : "";
}

function moduleHref(pathname: ModulePath, sessionKey: number | null): UrlObject {
  return sessionKey ? { pathname, query: { session: String(sessionKey) } } : { pathname };
}

async function withRecapTimeout<T>(promise: Promise<T>, fallback: T) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeout = setTimeout(() => resolve(fallback), RECAP_MODULE_TIMEOUT_MS);
      })
    ]);
  } catch {
    return fallback;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export default async function RaceWeekendPage({ searchParams }: { searchParams: Promise<RaceWeekendSearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const selection = await getResultsSelectionData();
  const selectorMeetings = selection.meetings.length ? selection.meetings : manualFallbackMeetings;
  const requestedSession = parseSessionKey(resolvedSearchParams.session);
  const selectedSessionKey = requestedSession ?? selectorMeetings[0]?.sessions[0]?.sessionKey ?? null;

  const selectedMeeting = selectorMeetings.find((meeting) =>
    meeting.sessions.some((session) => session.sessionKey === selectedSessionKey)
  );
  const selectedSession = selectedMeeting?.sessions.find((session) => session.sessionKey === selectedSessionKey);

  const [results, raceControl, lapAnalysis, weather] = selectedSessionKey
    ? await Promise.all([
        withRecapTimeout(getResultsBySession(selectedSessionKey), fallbackResults),
        withRecapTimeout(getRaceControlFeedBySession(selectedSessionKey), fallbackRaceControl),
        withRecapTimeout(getLapAnalysisBySession(selectedSessionKey), fallbackLapAnalysis),
        withRecapTimeout(getWeatherBySession(selectedSessionKey), fallbackWeather)
      ])
    : [
        { rows: [], source: "openf1-waiting" as const },
        { data: [], source: "openf1-waiting" as const, sessionName: "Waiting session" },
        { rows: [], source: "openf1-waiting" as const },
        {
          points: [],
          summary: {
            latest: null,
            sampleCount: 0,
            averageTrackTemperature: "--",
            maxTrackTemperature: "--",
            minTrackTemperature: "--",
            maxWindSpeed: "--",
            rainySamples: 0
          },
          source: "openf1-waiting" as const
        }
      ];

  const selectedMeetingName = selectedMeeting ? translateMeetingName(selectedMeeting.meetingName) : "等待可用大奖赛";
  const selectedSessionName = selectedSession ? translateSessionName(selectedSession.sessionName) : "手动选择";
  const selectedSessionParam = sessionHref(selectedSessionKey);
  const winner = results.rows[0];
  const fastestLap = lapAnalysis.rows.find((row) => row.bestLap !== "--");
  const latestWeather = weather.summary.latest;
  const hasModuleWarning = [results.source, raceControl.source, lapAnalysis.source, weather.source].some((source) => source.includes("error"));
  const availableModuleCount = [results.rows.length, raceControl.data.length, lapAnalysis.rows.length, weather.summary.sampleCount].filter((count) => count > 0).length;

  const summaryCards = [
    { label: "当前赛段", value: selectedSessionName, hint: selectedMeetingName },
    { label: "数据完整度", value: `${availableModuleCount}/4`, hint: "结果 / 赛控 / 圈速 / 天气" },
    { label: "头名车手", value: winner?.driver ?? "--", hint: winner?.team ?? sourceBadge(results.source) },
    { label: "赛控消息", value: `${raceControl.data.length}`, hint: sourceBadge(raceControl.source) }
  ];

  const moduleCards = [
    {
      id: "results",
      eyebrow: "Results",
      title: "成绩榜单",
      description: winner ? `${winner.driver} 当前位列成绩表首位。` : "查看完整完赛顺位、车队与时间差。",
      meta: `${results.rows.length} 条记录`,
      href: moduleHref("/results", selectedSessionKey)
    },
    {
      id: "race-control",
      eyebrow: "Race Control",
      title: "赛控记录",
      description: raceControl.data[0]?.message ?? "查看旗语、安全车、事故和官方赛控通知。",
      meta: `${raceControl.data.length} 条消息`,
      href: moduleHref("/race-control", selectedSessionKey)
    },
    {
      id: "lap-analysis",
      eyebrow: "Lap Analysis",
      title: "圈速分析",
      description: fastestLap ? `${fastestLap.driver} 最快圈 ${fastestLap.bestLap}。` : "查看车手最快圈、stint 与差距。",
      meta: `${lapAnalysis.rows.length} 位车手`,
      href: moduleHref("/lap-analysis", selectedSessionKey)
    },
    {
      id: "weather",
      eyebrow: "Weather",
      title: "赛道天气",
      description: latestWeather ? `最新赛道温度 ${latestWeather.trackTemperature}。` : "查看温度、湿度、风向和降雨采样。",
      meta: `${weather.summary.sampleCount} 个采样`,
      href: moduleHref("/weather", selectedSessionKey)
    }
  ];

  const drawerLinks = [
    { href: "#overview", label: "总览", hint: `${availableModuleCount}/4 模块可用` },
    { href: "#recap-session-selector", label: "选择赛段", hint: selectedSessionKey ? `Session ${selectedSessionKey}` : "手动输入" },
    { href: moduleHref("/results", selectedSessionKey), label: "成绩", hint: `${results.rows.length} 条记录` },
    { href: moduleHref("/race-control", selectedSessionKey), label: "赛控", hint: `${raceControl.data.length} 条消息` },
    { href: moduleHref("/lap-analysis", selectedSessionKey), label: "圈速", hint: fastestLap?.bestLap ?? "等待数据" },
    { href: moduleHref("/weather", selectedSessionKey), label: "天气", hint: latestWeather?.trackTemperature ?? "等待数据" }
  ];

  return (
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        Back to home
      </Link>

      <section id="overview" className="scroll-mt-6 motion-fade-up rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Race Weekend Hub</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">单站复盘导航</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              先选择赛段，再进入成绩、赛控、圈速或天气详情。此页只保留摘要和入口，避免长页面堆叠。
            </p>
          </div>
          <div className="w-fit rounded-full border border-pitGreen/50 bg-black/60 px-3 py-1 text-xs font-semibold text-pitGreen shadow-[0_0_24px_rgba(25,243,139,0.14)]">
            HUB · {sourceBadge(results.source)}
          </div>
        </div>
      </section>

      <RecapDrawerNav items={drawerLinks} currentLabel={selectedSessionName} currentHint={selectedMeetingName} />

      {hasModuleWarning ? (
        <section className="rounded-2xl border border-neonAmber/30 bg-neonAmber/10 p-4 text-sm leading-6 text-neonAmber">
          部分模块暂时未能及时返回数据。你仍可进入各模块详情页查看可用内容。
        </section>
      ) : null}

      <section id="recap-session-selector" className="card scroll-mt-24 motion-fade-up motion-delay-1 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Session Selector</p>
            <h2 className="mt-1 text-xl font-bold text-white">选择复盘赛段</h2>
          </div>
          <p className="text-sm text-zinc-500">当前：{selectedMeetingName} · {selectedSessionName}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {selectorMeetings.map((meeting) => (
            <div key={meeting.meetingKey} className="rounded-2xl border border-zinc-800 bg-black/25 p-3">
              <p className="text-sm font-semibold text-white">{translateMeetingName(meeting.meetingName)}</p>
              <p className="mt-1 text-xs text-zinc-500">{meeting.location} · {meeting.country}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {meeting.sessions.map((session) => {
                  const active = session.sessionKey === selectedSessionKey;
                  return (
                    <Link
                      key={session.sessionKey}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "border-neonAmber bg-neonAmber/10 text-neonAmber"
                          : "border-zinc-800 bg-black/30 text-zinc-400 hover:border-neonAmber/70 hover:text-neonAmber"
                      }`}
                      href={{ pathname: "/race-weekend", query: { session: String(session.sessionKey) } }}
                    >
                      {translateSessionName(session.sessionName)} · {formatSessionTime(session.sessionStart)}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.label} className="motion-fade-up rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <p className="race-code text-zinc-500">{card.label}</p>
            <p className="mt-3 truncate text-2xl font-bold text-white">{card.value}</p>
            <p className="mt-2 truncate text-sm text-zinc-500">{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="card motion-fade-up motion-delay-2 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Module Entry Cards</p>
            <h2 className="mt-1 text-xl font-bold text-white">进入详情模块</h2>
          </div>
          <p className="text-sm text-zinc-500">所有入口会带上当前 session 参数。</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {moduleCards.map((module) => (
            <Link
              key={module.id}
              className="group rounded-2xl border border-zinc-800 bg-black/25 p-4 transition hover:-translate-y-0.5 hover:border-neonAmber/70 hover:bg-white/[0.04]"
              href={module.href}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{module.eyebrow}</p>
                  <h3 className="mt-2 text-xl font-bold text-white group-hover:text-neonAmber">{module.title}</h3>
                </div>
                <span className="race-code rounded-full border border-zinc-800 px-3 py-1 text-zinc-500">{module.meta}</span>
              </div>
              <p className="mt-4 min-h-12 text-sm leading-6 text-zinc-400">{module.description}</p>
              <span className="race-code mt-4 inline-flex text-neonAmber">打开模块</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-black/20 p-4 text-sm leading-6 text-zinc-500">
        需要直达详情？使用菜单按钮打开左侧导航，或直接点击上方模块卡片。
        {selectedSessionParam ? ` 当前链接参数：${selectedSessionParam}` : " 当前暂无可用 session 参数。"}
      </section>
    </main>
  );
}
