import Link from "next/link";
import { getWeatherBySession, getWeatherSelectionData } from "@/lib/weather-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type WeatherSearchParams = {
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
  if (normalized.includes("sprint qualifying")) return "冲刺排位赛";
  if (normalized.includes("sprint shootout")) return "冲刺排位赛";
  if (normalized.includes("sprint")) return "冲刺赛";
  if (normalized.includes("qualifying")) return "排位赛";
  if (normalized === "race" || normalized.includes("race")) return "正赛";
  if (normalized.includes("practice 1") || normalized.includes("free practice 1")) return "第一次自由练习赛";
  if (normalized.includes("practice 2") || normalized.includes("free practice 2")) return "第二次自由练习赛";
  if (normalized.includes("practice 3") || normalized.includes("free practice 3")) return "第三次自由练习赛";
  if (normalized.includes("practice")) return "自由练习赛";
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

function sourceLabel(source: string) {
  if (source === "openf1") return "OPENF1";
  if (source === "openf1-waiting") return "WAITING DATA";
  if (source === "openf1-error") return "OPENF1 WAITING";
  if (source === "openf1-empty") return "OPENF1 EMPTY";
  return "API READY";
}

function getBarWidth(value: number | null, max: number) {
  if (value === null || !Number.isFinite(value)) return "0%";
  return `${Math.min(Math.max((value / max) * 100, 4), 100)}%`;
}

export default async function WeatherPage({ searchParams }: { searchParams?: WeatherSearchParams }) {
  const selection = await getWeatherSelectionData();
  const requestedSession = parseSessionKey(searchParams?.session);
  const selectedSessionKey = requestedSession ?? selection.defaultSessionKey;

  const selectedMeeting = selection.meetings.find((meeting) =>
    meeting.sessions.some((session) => session.sessionKey === selectedSessionKey)
  );
  const selectedSession = selectedMeeting?.sessions.find((session) => session.sessionKey === selectedSessionKey);
  const weather = selectedSessionKey ? await getWeatherBySession(selectedSessionKey) : { points: [], summary: { latest: null, sampleCount: 0, averageTrackTemperature: "--", maxTrackTemperature: "--", minTrackTemperature: "--", maxWindSpeed: "--", rainySamples: 0 }, source: "openf1-waiting" as const };

  const selectedMeetingName = selectedMeeting ? translateMeetingName(selectedMeeting.meetingName) : null;
  const selectedSessionName = selectedSession ? translateSessionName(selectedSession.sessionName) : null;
  const latest = weather.summary.latest;
  const recentPoints = weather.points.slice(-72).reverse();
  const trendPoints = weather.points.slice(-24);
  const quickSessions = selectedMeeting?.sessions.slice(0, 8) ?? [];

  const summaryCards = [
    { label: "采样数量", value: weather.summary.sampleCount ? `${weather.summary.sampleCount}` : "--", hint: "OpenF1 返回记录" },
    { label: "赛道温度", value: latest?.trackTemperature ?? "--", hint: `均值 ${weather.summary.averageTrackTemperature}` },
    { label: "空气温度", value: latest?.airTemperature ?? "--", hint: "最新记录" },
    { label: "最大风速", value: weather.summary.maxWindSpeed, hint: `雨量样本 ${weather.summary.rainySamples}` }
  ];

  return (
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>

      <section className="motion-fade-up rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Weather Center</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">赛道天气</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              展示 OpenF1 天气数据，包括赛道温度、空气温度、湿度、气压、降雨、风向与风速。适合判断轮胎窗口和赛道状态变化。
            </p>
          </div>
          <div className="w-fit rounded-full border border-cyan-300/50 bg-black/60 px-3 py-1 text-xs font-semibold text-cyan-200 shadow-[0_0_24px_rgba(103,232,249,0.14)]">
            WEATHER FEED · {sourceLabel(weather.source)}
          </div>
        </div>
      </section>

      <section id="weather-session-selector" className="card scroll-mt-6 motion-fade-up motion-delay-1 space-y-3">
        <div>
          <p className="eyebrow">Weekend / Session</p>
          <h2 className="mt-1 text-lg font-semibold text-white">选择比赛周末与赛段</h2>
          <p className="mt-1 text-sm text-zinc-400">
            当前：{selectedMeetingName ? `${selectedMeetingName} · ${selectedSessionName ?? "自动选择"}` : "等待 OpenF1 返回天气赛段"}
          </p>
          <p className="mt-1 text-xs text-zinc-600">数据标识：{selectedSessionKey ?? "暂无"}</p>
        </div>

        <form action="/weather#weather-session-selector" className="grid gap-3 sm:grid-cols-[1fr_auto]" method="get">
          <select
            className="rounded-xl border border-zinc-800 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-cyan-300"
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
          <button className="rounded-xl border border-zinc-800 bg-black/40 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-cyan-300 hover:text-cyan-200" type="submit">
            查看天气
          </button>
        </form>

        {quickSessions.length ? (
          <div className="flex flex-wrap gap-2 border-t border-zinc-900 pt-3">
            {quickSessions.map((session) => {
              const isActive = session.sessionKey === selectedSessionKey;
              return (
                <Link
                  key={session.sessionKey}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${isActive ? "border-cyan-300 bg-cyan-300/10 text-cyan-200" : "border-zinc-800 bg-black/30 text-zinc-300 hover:border-cyan-300 hover:text-cyan-200"}`}
                  href={`/weather?session=${session.sessionKey}#weather-session-selector`}
                >
                  {translateSessionName(session.sessionName)}
                  <span className="ml-2 font-mono text-xs text-zinc-500">{formatSessionTime(session.sessionStart)}</span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </section>

      {weather.points.length ? (
        <>
          <section className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm leading-6 text-cyan-100">
            当前赛段共读取到 {weather.summary.sampleCount} 条天气采样；下方表格显示最近 {recentPoints.length} 条。部分历史赛段由 OpenF1 返回的天气样本可能不是完整官方逐分钟记录。
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((item) => (
              <article key={item.label} className="rounded-2xl border border-zinc-800 bg-black/25 p-4 shadow-lg shadow-black/10">
                <p className="race-code">{item.label}</p>
                <p className="mt-2 font-mono text-2xl font-bold text-white">{item.value}</p>
                <p className="mt-1 text-xs text-zinc-500">{item.hint}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
            <article className="card motion-fade-up space-y-4">
              <div>
                <p className="eyebrow">Latest Sample</p>
                <h2 className="mt-1 text-lg font-semibold text-white">最新天气记录</h2>
                <p className="mt-1 text-sm text-zinc-500">更新时间：{latest?.time ?? "--"}</p>
              </div>
              <div className="grid gap-3 text-sm">
                {[
                  ["赛道温度", latest?.trackTemperature ?? "--"],
                  ["空气温度", latest?.airTemperature ?? "--"],
                  ["湿度", latest?.humidity ?? "--"],
                  ["气压", latest?.pressure ?? "--"],
                  ["降雨", latest?.rainLabel ?? "--"],
                  ["风向", latest?.windDirection ?? "--"],
                  ["风速", latest?.windSpeed ?? "--"]
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black/25 px-3 py-2">
                    <span className="text-zinc-500">{label}</span>
                    <span className="font-mono font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="card motion-fade-up space-y-4">
              <div>
                <p className="eyebrow">Track Temperature Trend</p>
                <h2 className="mt-1 text-lg font-semibold text-white">最近赛道温度</h2>
                <p className="mt-1 text-sm text-zinc-500">最高 {weather.summary.maxTrackTemperature} · 最低 {weather.summary.minTrackTemperature}</p>
              </div>
              <div className="space-y-2">
                {trendPoints.map((point) => (
                  <div key={point.date} className="grid grid-cols-[3.5rem_1fr_4rem] items-center gap-3 text-xs">
                    <span className="font-mono text-zinc-500">{point.time}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
                      <div className="h-full rounded-full bg-cyan-300/70" style={{ width: getBarWidth(point.trackTemperatureValue, 65) }} />
                    </div>
                    <span className="text-right font-mono text-zinc-300">{point.trackTemperature}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="card motion-fade-up overflow-hidden p-0">
            <div className="border-b border-zinc-800 bg-black/25 px-4 py-3">
              <p className="eyebrow">Weather Table</p>
              <h2 className="mt-1 text-lg font-semibold text-white">天气采样记录</h2>
              <p className="mt-1 text-xs text-zinc-500">表格默认显示最近 {recentPoints.length} 条记录。OpenF1 历史赛段可能缺少完整字段或只返回部分采样。</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-950/60 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <tr>
                    {['时间', '赛道温度', '空气温度', '湿度', '气压', '降雨', '风向', '风速'].map((title) => (
                      <th key={title} className="px-4 py-3">{title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentPoints.map((point) => (
                    <tr key={point.date} className="border-b border-zinc-900 transition hover:bg-white/[0.03]">
                      <td className="px-4 py-4 font-mono text-zinc-500">{point.time}</td>
                      <td className="px-4 py-4 font-mono text-cyan-200">{point.trackTemperature}</td>
                      <td className="px-4 py-4 font-mono text-zinc-300">{point.airTemperature}</td>
                      <td className="px-4 py-4 font-mono text-zinc-300">{point.humidity}</td>
                      <td className="px-4 py-4 font-mono text-zinc-400">{point.pressure}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.16em] ${point.rainfall ? "border-neonAmber/40 bg-neonAmber/10 text-neonAmber" : "border-pitGreen/40 bg-pitGreen/10 text-pitGreen"}`}>
                          {point.rainLabel}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-zinc-400">{point.windDirection}</td>
                      <td className="px-4 py-4 font-mono text-zinc-300">{point.windSpeed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-zinc-800 bg-black/20 p-5 text-sm leading-6 text-zinc-400">
          <p className="font-semibold text-zinc-200">该赛段暂无天气数据。</p>
          <p className="mt-1">比赛尚未开始，或该赛段暂未产生可用的天气采样记录。</p>
        </section>
      )}
    </main>
  );
}
