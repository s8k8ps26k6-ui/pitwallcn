import Link from "next/link";
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
    [/São Paulo Grand Prix/i, "圣保罗大奖赛"],
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

function moduleHref(path: string, sessionKey: number | null) {
  return sessionKey ? `${path}?session=${sessionKey}` : path;
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

export default async function RaceWeekendPage({ searchParams }: { searchParams?: RaceWeekendSearchParams }) {
  const selection = await getResultsSelectionData();
  const selectorMeetings = selection.meetings.length ? selection.meetings : manualFallbackMeetings;
  const requestedSession = parseSessionKey(searchParams?.session);
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
        { points: [], summary: { latest: null, sampleCount: 0, averageTrackTemperature: "--", maxTrackTemperature: "--", minTrackTemperature: "--", maxWindSpeed: "--", rainySamples: 0 }, source: "openf1-waiting" as const }
      ];

  const selectedMeetingName = selectedMeeting ? translateMeetingName(selectedMeeting.meetingName) : "等待可用大奖赛";
  const selectedSessionName = selectedSession ? translateSessionName(selectedSession.sessionName) : "手动选择";
  const winner = results.rows[0];
  const fastestLap = lapAnalysis.rows.find((row) => row.bestLap !== "--");
  const latestWeather = weather.summary.latest;
  const hasModuleWarning = [results.source, raceControl.source, lapAnalysis.source, weather.source].some((source) => source.includes("error"));
  const availableModuleCount = [results.rows.length, raceControl.data.length, lapAnalysis.rows.length, weather.summary.sampleCount].filter((count) => count > 0).length;

  const summaryCards = [
    { label: "当前赛段", value: selectedSessionName, hint: selectedMeetingName },
    { label: "数据完整度", value: `${availableModuleCount}/4`, hint: "结果 / 赛控 / 圈速 / 天气" },
    { label: "头名车手", value: winner?.driver ?? "--", hint: winner?.team ?? sourceBadge(results.source) },
    { label: "最新天气", value: latestWeather?.trackTemperature ?? "--", hint: latestWeather ? `采样 ${latestWeather.time}` : sourceBadge(weather.source) }
  ];

  const moduleCards = [
    {
      label: "比赛结果",
      eyebrow: "Results",
      href: moduleHref("/results", selectedSessionKey),
      stat: `${results.rows.length} 条记录`,
      description: winner ? `${winner.driver} 当前位列成绩表首位。打开完整页面查看所有车手、车队和时间差。` : "打开完整成绩页面查看当前赛段的分类结果。"
    },
    {
      label: "赛会控制",
      eyebrow: "Race Control",
      href: moduleHref("/race-control", selectedSessionKey),
      stat: `${raceControl.data.length} 条消息`,
      description: raceControl.data[0]?.message ?? "打开完整赛控页面查看旗语、安全车、事故和官方通知。"
    },
    {
      label: "圈速分析",
      eyebrow: "Lap Analysis",
      href: moduleHref("/lap-analysis", selectedSessionKey),
      stat: fastestLap?.bestLap ?? "等待圈速",
      description: fastestLap ? `${fastestLap.driver} 当前最快圈 ${fastestLap.bestLap}。打开完整页面比较所有车手。` : "打开完整圈速页面查看最快圈、stint 和差距。"
    },
    {
      label: "赛道天气",
      eyebrow: "Weather",
      href: moduleHref("/weather", selectedSessionKey),
      stat: `${weather.summary.sampleCount} 个采样`,
      description: latestWeather ? `最新赛道温度 ${latestWeather.trackTemperature}。打开完整页面查看温度、风速和降雨趋势。` : "打开完整天气页面查看赛道温度、空气温度、湿度和风速。"
    }
  ];

  const navLinks = [
    { href: "#overview", label: "总览", hint: `${availableModuleCount}/4 模块可用` },
    { href: "#recap-session-selector", label: "选择赛段", hint: selectedSessionKey ? `Session ${selectedSessionKey}` : "手动输入" },
    { href: moduleHref("/results", selectedSessionKey), label: "比赛结果", hint: `${results.rows.length} 条记录` },
    { href: moduleHref("/race-control", selectedSessionKey), label: "赛会控制", hint: `${raceControl.data.length} 条消息` },
    { href: moduleHref("/lap-analysis", selectedSessionKey), label: "圈速分析", hint: fastestLap?.bestLap ?? "等待圈速" },
    { href: moduleHref("/weather", selectedSessionKey), label: "赛道天气", hint: latestWeather?.trackTemperature ?? "等待天气" }
  ];

  return (
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>

      <section id="overview" className="scroll-mt-6 motion-fade-up rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Race Weekend Hub</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">单站复盘菜单</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              先选择比赛周末与赛段，再进入独立的结果、赛控、圈速或天气页面。这里保留简短摘要和模块入口，不再堆叠完整详情表格。
            </p>
          </div>
          <div className="w-fit rounded-full border border-pitGreen/50 bg-black/60 px-3 py-1 text-xs font-semibold text-pitGreen shadow-[0_0_24px_rgba(25,243,139,0.14)]">
            HUB · {sourceBadge(results.source)}
          </div>
        </div>
      </section>

      <RecapDrawerNav items={navLinks} currentLabel={selectedSessionName} currentHint={selectedMeetingName} />

      {hasModuleWarning ? (
        <section className="rounded-2xl border border-neonAmber/30 bg-neonAmber/10 p-4 text-sm leading-6 text-neonAmber">
          部分模块暂时未能及时返回数据。你仍可进入各模块独立页面查看可用内容。
        </section>
      ) : null}

      <section id="recap-session-selector" className="card scroll-mt-24 motion-fade-up motion-delay-1 space-y-3">
        <div>
          <p className="eyebrow">Weekend / Session</p>
          <h2 className="mt-1 text-lg font-semibold text-white">选择复盘赛段</h2>
          <p className="mt-1 text-sm text-zinc-400">当前：{selectedMeetingName} · {selectedSessionName}</p>
          <p className="mt-1 text-xs text-zinc-600">数据标识：{selectedSessionKey ?? "暂无"}</p>
        </div>

        <form action="/race-weekend#recap-session-selector" className="grid gap-3" method="get">
          <select className="w-full rounded-xl border border-zinc-800 bg-black/30 px-3 py-3 text-sm text-zinc-100 outline-none transition focus:border-neonAmber" defaultValue={selectedSessionKey ?? ""} name="session">
            {selectorMeetings.map((meeting) => (
              <optgroup key={meeting.meetingKey} label={`${translateMeetingName(meeting.meetingName)} · ${meeting.country} · ${meeting.location}`}>
                {meeting.sessions.map((session) => (
                  <option key={session.sessionKey} value={session.sessionKey}>
                    {translateSessionName(session.sessionName)} · Session {session.sessionKey} · {formatSessionTime(session.sessionStart)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              className="rounded-xl border border-zinc-800 bg-black/30 px-3 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-neonAmber"
              inputMode="numeric"
              name="session"
              placeholder="也可以手动输入 OpenF1 session_key"
              type="number"
            />
            <button className="rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-neonAmber hover:text-neonAmber" type="submit">
              更新菜单
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((item) => (
          <article key={item.label} className="rounded-2xl border border-zinc-800 bg-black/25 p-4 shadow-lg shadow-black/10">
            <p className="race-code">{item.label}</p>
            <p className="mt-2 truncate font-mono text-2xl font-bold text-white">{item.value}</p>
            <p className="mt-1 truncate text-xs text-zinc-500">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="card motion-fade-up motion-delay-2 space-y-4">
        <div>
          <p className="eyebrow">Race Weekend Modules</p>
          <h2 className="mt-1 text-xl font-bold text-white">打开独立模块页面</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">每个模块都是完整页面，当前 session 会随链接传递，方便查看后返回本菜单。</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {moduleCards.map((module) => (
            <a
              key={module.href}
              className="group rounded-2xl border border-zinc-800 bg-black/25 p-4 transition hover:-translate-y-0.5 hover:border-neonAmber/70 hover:bg-white/[0.04]"
              href={module.href}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{module.eyebrow}</p>
                  <h3 className="mt-2 text-xl font-bold text-white transition group-hover:text-neonAmber">{module.label}</h3>
                </div>
                <span className="race-code rounded-full border border-zinc-800 px-3 py-1 text-zinc-500">{module.stat}</span>
              </div>
              <p className="mt-4 min-h-12 text-sm leading-6 text-zinc-400">{module.description}</p>
              <span className="race-code mt-4 inline-flex text-neonAmber">进入完整页面 →</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
