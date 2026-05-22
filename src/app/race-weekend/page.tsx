import Link from "next/link";
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
  return "API READY";
}

function raceControlCategoryLabel(category: string) {
  if (category === "FLAG") return "旗语";
  if (category === "SAFETY_CAR") return "安全车";
  if (category === "INCIDENT") return "事件";
  return "通知";
}

function raceControlCategoryClass(category: string) {
  if (category === "FLAG") return "border-neonAmber/40 bg-neonAmber/10 text-neonAmber";
  if (category === "SAFETY_CAR") return "border-blue-400/40 bg-blue-400/10 text-blue-200";
  if (category === "INCIDENT") return "border-neonRed/40 bg-neonRed/10 text-neonRed";
  return "border-zinc-700 bg-zinc-900/60 text-zinc-300";
}

function getRaceControlIntensity(messageCount: number) {
  if (messageCount >= 24) return { value: "高压", hint: `${messageCount} 条赛控消息，赛段波动明显`, accent: "border-neonRed/40 bg-neonRed/10 text-neonRed" };
  if (messageCount >= 10) return { value: "活跃", hint: `${messageCount} 条赛控消息，值得回看赛控`, accent: "border-neonAmber/40 bg-neonAmber/10 text-neonAmber" };
  if (messageCount > 0) return { value: "平稳", hint: `${messageCount} 条赛控消息`, accent: "border-pitGreen/40 bg-pitGreen/10 text-pitGreen" };
  return { value: "等待", hint: "暂无赛控消息", accent: "border-zinc-700 bg-zinc-900/60 text-zinc-300" };
}

function getTrackWindow(trackTemperature?: number | null) {
  if (trackTemperature === null || trackTemperature === undefined || !Number.isFinite(trackTemperature)) {
    return { value: "--", hint: "等待赛道温度", accent: "border-zinc-700 bg-zinc-900/60 text-zinc-300" };
  }

  if (trackTemperature >= 48) return { value: "高温", hint: "轮胎热管理压力偏高", accent: "border-neonRed/40 bg-neonRed/10 text-neonRed" };
  if (trackTemperature >= 38) return { value: "偏热", hint: "轮胎窗口可能更敏感", accent: "border-neonAmber/40 bg-neonAmber/10 text-neonAmber" };
  if (trackTemperature <= 22) return { value: "偏冷", hint: "暖胎和升温可能更关键", accent: "border-cyan-300/40 bg-cyan-300/10 text-cyan-200" };
  return { value: "常规", hint: "赛道温度处于常规区间", accent: "border-pitGreen/40 bg-pitGreen/10 text-pitGreen" };
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

function CompactDetail({ title, eyebrow, summary, href, children }: { title: string; eyebrow: string; summary: string; href: string; children: JSX.Element }) {
  return (
    <details className="group overflow-hidden rounded-2xl border border-zinc-800 bg-black/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 transition hover:bg-white/[0.03]">
        <span>
          <span className="race-code block text-zinc-500">{eyebrow}</span>
          <span className="mt-1 block font-semibold text-white">{title}</span>
          <span className="mt-1 block text-xs text-zinc-500">{summary}</span>
        </span>
        <span className="font-mono text-lg text-zinc-500 transition group-open:rotate-90 group-hover:text-neonAmber">›</span>
      </summary>
      <div className="border-t border-zinc-800 p-4">
        <Link className="race-code mb-4 inline-flex text-zinc-500 transition hover:text-neonAmber" href={href}>
          打开完整页面 →
        </Link>
        {children}
      </div>
    </details>
  );
}

export default async function RaceWeekendPage({ searchParams }: { searchParams?: RaceWeekendSearchParams }) {
  const selection = await getResultsSelectionData();
  const requestedSession = parseSessionKey(searchParams?.session);
  const selectedSessionKey = requestedSession ?? selection.defaultSessionKey;

  const selectedMeeting = selection.meetings.find((meeting) =>
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
  const selectedSessionName = selectedSession ? translateSessionName(selectedSession.sessionName) : "自动选择";
  const winner = results.rows[0];
  const podium = results.rows.slice(0, 3);
  const fastestRows = lapAnalysis.rows.filter((row) => row.bestLap !== "--").slice(0, 5);
  const raceControlPreview = raceControl.data.slice(0, 6);
  const latestWeather = weather.summary.latest;
  const hasModuleWarning = [results.source, raceControl.source, lapAnalysis.source, weather.source].some((source) => source.includes("error"));
  const availableModuleCount = [results.rows.length, raceControl.data.length, lapAnalysis.rows.length, weather.summary.sampleCount].filter((count) => count > 0).length;
  const raceControlIntensity = getRaceControlIntensity(raceControl.data.length);
  const trackWindow = getTrackWindow(latestWeather?.trackTemperatureValue);
  const fastestReference = fastestRows[0];

  const summaryCards = [
    { label: "当前赛段", value: selectedSessionName, hint: selectedMeetingName },
    { label: "头名车手", value: winner?.driver ?? "--", hint: winner?.team ?? "等待成绩数据" },
    { label: "赛控消息", value: `${raceControl.data.length}`, hint: sourceBadge(raceControl.source) },
    { label: "天气采样", value: `${weather.summary.sampleCount}`, hint: latestWeather ? `最新 ${latestWeather.time}` : sourceBadge(weather.source) }
  ];

  const insightCards = [
    { label: "赛事节奏", value: raceControlIntensity.value, hint: raceControlIntensity.hint, accent: raceControlIntensity.accent },
    { label: "赛道窗口", value: trackWindow.value, hint: latestWeather ? `${latestWeather.trackTemperature} · ${trackWindow.hint}` : trackWindow.hint, accent: trackWindow.accent },
    { label: "速度参考", value: fastestReference?.driver ?? "--", hint: fastestReference ? `最快圈 ${fastestReference.bestLap}` : "等待圈速数据", accent: fastestReference ? "border-purple-400/40 bg-purple-400/10 text-purple-200" : "border-zinc-700 bg-zinc-900/60 text-zinc-300" },
    { label: "数据完整度", value: `${availableModuleCount}/4`, hint: "结果 / 赛控 / 圈速 / 天气", accent: availableModuleCount >= 3 ? "border-pitGreen/40 bg-pitGreen/10 text-pitGreen" : "border-neonAmber/40 bg-neonAmber/10 text-neonAmber" }
  ];

  const insightSummary = winner
    ? `${selectedSessionName} 当前摘要：${winner.driver} 位列成绩表首位，${raceControlIntensity.hint}，${latestWeather ? `最新赛道温度 ${latestWeather.trackTemperature}` : "天气数据等待中"}。`
    : `${selectedSessionName} 当前暂无完整成绩，已展示可用的赛控、圈速和天气模块。`;

  return (
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>

      <section className="motion-fade-up rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Race Weekend Recap</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">单站复盘</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              先给结论，再把详细表格收进下方折叠面板。移动端不用一直翻长页面。
            </p>
          </div>
          <div className="w-fit rounded-full border border-pitGreen/50 bg-black/60 px-3 py-1 text-xs font-semibold text-pitGreen shadow-[0_0_24px_rgba(25,243,139,0.14)]">
            RECAP · {sourceBadge(results.source)}
          </div>
        </div>
      </section>

      {hasModuleWarning ? (
        <section className="rounded-2xl border border-neonAmber/30 bg-neonAmber/10 p-4 text-sm leading-6 text-neonAmber">
          部分模块暂时未能及时返回数据。页面已先显示可用内容，稍后刷新可能恢复。
        </section>
      ) : null}

      <section id="recap-session-selector" className="card scroll-mt-6 motion-fade-up motion-delay-1 space-y-3">
        <div>
          <p className="eyebrow">Weekend / Session</p>
          <h2 className="mt-1 text-lg font-semibold text-white">选择复盘赛段</h2>
          <p className="mt-1 text-sm text-zinc-400">当前：{selectedMeetingName} · {selectedSessionName}</p>
          <p className="mt-1 text-xs text-zinc-600">数据标识：{selectedSessionKey ?? "暂无"}</p>
        </div>

        <form action="/race-weekend#recap-session-selector" className="grid gap-3 sm:grid-cols-[1fr_auto]" method="get">
          <select className="rounded-xl border border-zinc-800 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-neonAmber" defaultValue={selectedSessionKey ?? ""} name="session">
            {!selectedSessionKey ? <option value="">自动选择最新可用赛段</option> : null}
            {selection.meetings.map((meeting) => (
              <optgroup key={meeting.meetingKey} label={`${translateMeetingName(meeting.meetingName)} · ${meeting.country} · ${meeting.location}`}>
                {meeting.sessions.map((session) => (
                  <option key={session.sessionKey} value={session.sessionKey}>
                    {translateSessionName(session.sessionName)} · {formatSessionTime(session.sessionStart)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button className="rounded-xl border border-zinc-800 bg-black/40 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-neonAmber hover:text-neonAmber" type="submit">
            查看复盘
          </button>
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

      <section className="motion-fade-up motion-delay-2 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">GridDelta Intelligence</p>
            <h2 className="mt-2 text-2xl font-bold text-white">数据脉冲</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{insightSummary}</p>
          </div>
          <span className="w-fit rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-[0.65rem] font-bold tracking-[0.18em] text-cyan-200">
            RULE-BASED · NO MOCK
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {insightCards.map((item) => (
            <article key={item.label} className={`rounded-2xl border p-4 ${item.accent}`}>
              <p className="race-code opacity-80">{item.label}</p>
              <p className="mt-2 font-mono text-2xl font-bold text-white">{item.value}</p>
              <p className="mt-2 text-xs leading-5 opacity-80">{item.hint}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="motion-fade-up motion-delay-3 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Detailed Data</p>
            <h2 className="mt-1 text-xl font-bold text-white">详细数据</h2>
          </div>
          <p className="text-xs text-zinc-500">需要时再展开，减少长页面滚动。</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <CompactDetail eyebrow="Classification" title="成绩摘要" summary={podium.length ? `${podium.length} 位领奖台车手 · ${winner?.driver ?? "--"} 领跑` : "暂无成绩数据"} href={selectedSessionKey ? `/results?session=${selectedSessionKey}` : "/results"}>
            {podium.length ? (
              <div className="space-y-2">
                {podium.map((row) => (
                  <div key={row.driver} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-xl border border-zinc-800 bg-black/25 p-3">
                    <span className="font-mono text-lg font-bold text-white">{row.position}</span>
                    <span>
                      <span className="block font-mono font-semibold text-white">{row.driver}</span>
                      <span className="mt-0.5 block text-xs text-zinc-500">{row.team}</span>
                    </span>
                    <span className="font-mono text-sm font-semibold text-neonAmber">{row.timeOrGap}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-zinc-800 bg-black/25 p-4 text-sm leading-6 text-zinc-400">该赛段暂无成绩数据。</p>
            )}
          </CompactDetail>

          <CompactDetail eyebrow="Race Control" title="赛控重点" summary={raceControlPreview.length ? `${raceControl.data.length} 条消息 · 显示最近 ${raceControlPreview.length} 条` : "暂无赛控消息"} href={selectedSessionKey ? `/race-control?session=${selectedSessionKey}` : "/race-control"}>
            {raceControlPreview.length ? (
              <div className="space-y-2">
                {raceControlPreview.map((item) => (
                  <div key={item.id} className="rounded-xl border border-zinc-800 bg-black/25 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs text-zinc-500">{item.timestamp}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.14em] ${raceControlCategoryClass(item.category)}`}>{raceControlCategoryLabel(item.category)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{item.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-zinc-800 bg-black/25 p-4 text-sm leading-6 text-zinc-400">该赛段暂无赛控消息。</p>
            )}
          </CompactDetail>

          <CompactDetail eyebrow="Lap Analysis" title="圈速前五" summary={fastestRows.length ? `${fastestRows[0].driver} · ${fastestRows[0].bestLap}` : "暂无圈速数据"} href={selectedSessionKey ? `/lap-analysis?session=${selectedSessionKey}` : "/lap-analysis"}>
            {fastestRows.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-zinc-800 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    <tr>{['车手', '最快圈', '位置', '差距', 'stint'].map((title) => <th key={title} className="px-3 py-2">{title}</th>)}</tr>
                  </thead>
                  <tbody>
                    {fastestRows.map((row) => (
                      <tr key={row.driver} className="border-b border-zinc-900">
                        <td className="px-3 py-3 font-mono text-white">{row.driver}</td>
                        <td className="px-3 py-3 font-mono text-neonAmber">{row.bestLap}</td>
                        <td className="px-3 py-3 font-mono text-zinc-400">{row.position}</td>
                        <td className="px-3 py-3 font-mono text-zinc-400">{row.gap}</td>
                        <td className="px-3 py-3 text-zinc-400">{row.stint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-xl border border-zinc-800 bg-black/25 p-4 text-sm leading-6 text-zinc-400">该赛段暂无圈速数据。</p>
            )}
          </CompactDetail>

          <CompactDetail eyebrow="Weather" title="赛道天气" summary={latestWeather ? `${latestWeather.trackTemperature} · ${latestWeather.rainLabel} · ${latestWeather.windSpeed}` : "暂无天气数据"} href={selectedSessionKey ? `/weather?session=${selectedSessionKey}` : "/weather"}>
            {latestWeather ? (
              <div className="grid gap-2 text-sm">
                {[
                  ["赛道温度", latestWeather.trackTemperature],
                  ["空气温度", latestWeather.airTemperature],
                  ["湿度", latestWeather.humidity],
                  ["降雨", latestWeather.rainLabel],
                  ["风向", latestWeather.windDirection],
                  ["风速", latestWeather.windSpeed]
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black/25 px-3 py-2">
                    <span className="text-zinc-500">{label}</span>
                    <span className="font-mono font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-zinc-800 bg-black/25 p-4 text-sm leading-6 text-zinc-400">该赛段暂无天气数据。</p>
            )}
          </CompactDetail>
        </div>
      </section>
    </main>
  );
}
