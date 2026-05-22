import Link from "next/link";
import { getLapAnalysisBySession } from "@/lib/lap-analysis-service";
import { getRaceControlFeedBySession } from "@/lib/race-control-service";
import { getResultsBySession, getResultsSelectionData } from "@/lib/results-service";
import { getWeatherBySession } from "@/lib/weather-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RaceWeekendSearchParams = {
  session?: string;
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
        getResultsBySession(selectedSessionKey),
        getRaceControlFeedBySession(selectedSessionKey),
        getLapAnalysisBySession(selectedSessionKey),
        getWeatherBySession(selectedSessionKey)
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

  const summaryCards = [
    { label: "当前赛段", value: selectedSessionName, hint: selectedMeetingName },
    { label: "头名车手", value: winner?.driver ?? "--", hint: winner?.team ?? "等待成绩数据" },
    { label: "赛控消息", value: `${raceControl.data.length}`, hint: sourceBadge(raceControl.source) },
    { label: "天气采样", value: `${weather.summary.sampleCount}`, hint: latestWeather ? `最新 ${latestWeather.time}` : sourceBadge(weather.source) }
  ];

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
              把比赛结果、赛控消息、圈速分析和赛道天气放在同一个页面里，快速复盘一个赛段的关键数据。
            </p>
          </div>
          <div className="w-fit rounded-full border border-pitGreen/50 bg-black/60 px-3 py-1 text-xs font-semibold text-pitGreen shadow-[0_0_24px_rgba(25,243,139,0.14)]">
            RECAP · {sourceBadge(results.source)}
          </div>
        </div>
      </section>

      <section id="recap-session-selector" className="card scroll-mt-6 motion-fade-up motion-delay-1 space-y-3">
        <div>
          <p className="eyebrow">Weekend / Session</p>
          <h2 className="mt-1 text-lg font-semibold text-white">选择复盘赛段</h2>
          <p className="mt-1 text-sm text-zinc-400">
            当前：{selectedMeetingName} · {selectedSessionName}
          </p>
          <p className="mt-1 text-xs text-zinc-600">数据标识：{selectedSessionKey ?? "暂无"}</p>
        </div>

        <form action="/race-weekend#recap-session-selector" className="grid gap-3 sm:grid-cols-[1fr_auto]" method="get">
          <select
            className="rounded-xl border border-zinc-800 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-neonAmber"
            defaultValue={selectedSessionKey ?? ""}
            name="session"
          >
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

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="card motion-fade-up space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Classification</p>
              <h2 className="mt-1 text-xl font-bold text-white">成绩摘要</h2>
            </div>
            <Link className="race-code text-zinc-500 transition hover:text-neonAmber" href={selectedSessionKey ? `/results?session=${selectedSessionKey}` : "/results"}>
              详细结果 →
            </Link>
          </div>

          {podium.length ? (
            <div className="space-y-3">
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
        </article>

        <article className="card motion-fade-up space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Race Control</p>
              <h2 className="mt-1 text-xl font-bold text-white">赛控重点</h2>
            </div>
            <Link className="race-code text-zinc-500 transition hover:text-neonAmber" href={selectedSessionKey ? `/race-control?session=${selectedSessionKey}` : "/race-control"}>
              完整赛控 →
            </Link>
          </div>

          {raceControlPreview.length ? (
            <div className="space-y-3">
              {raceControlPreview.map((item) => (
                <div key={item.id} className="rounded-xl border border-zinc-800 bg-black/25 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs text-zinc-500">{item.timestamp}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.14em] ${raceControlCategoryClass(item.category)}`}>
                      {raceControlCategoryLabel(item.category)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{item.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-zinc-800 bg-black/25 p-4 text-sm leading-6 text-zinc-400">该赛段暂无赛控消息。</p>
          )}
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="card motion-fade-up space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Lap Analysis</p>
              <h2 className="mt-1 text-xl font-bold text-white">圈速前五</h2>
            </div>
            <Link className="race-code text-zinc-500 transition hover:text-neonAmber" href={selectedSessionKey ? `/lap-analysis?session=${selectedSessionKey}` : "/lap-analysis"}>
              圈速分析 →
            </Link>
          </div>

          {fastestRows.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-800 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <tr>
                    {['车手', '最快圈', '位置', '差距', 'stint'].map((title) => (
                      <th key={title} className="px-3 py-2">{title}</th>
                    ))}
                  </tr>
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
        </article>

        <article className="card motion-fade-up space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Weather</p>
              <h2 className="mt-1 text-xl font-bold text-white">赛道天气</h2>
            </div>
            <Link className="race-code text-zinc-500 transition hover:text-neonAmber" href={selectedSessionKey ? `/weather?session=${selectedSessionKey}` : "/weather"}>
              天气详情 →
            </Link>
          </div>

          {latestWeather ? (
            <div className="grid gap-3 text-sm">
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
        </article>
      </section>
    </main>
  );
}
