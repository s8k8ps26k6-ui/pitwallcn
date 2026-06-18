import Link from "next/link";
import { RaceWeekendReturnLink } from "@/components/race-weekend-return-link";
import { getLapAnalysisBySession, getLapAnalysisSelectionData } from "@/lib/lap-analysis-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type LapAnalysisSearchParams = {
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
  return "API READY";
}

export default async function LapAnalysisPage({ searchParams }: { searchParams: Promise<LapAnalysisSearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const selection = await getLapAnalysisSelectionData();
  const requestedSession = parseSessionKey(resolvedSearchParams.session);
  const selectedSessionKey = requestedSession ?? selection.defaultSessionKey;

  const selectedMeeting = selection.meetings.find((meeting) =>
    meeting.sessions.some((session) => session.sessionKey === selectedSessionKey)
  );
  const selectedSession = selectedMeeting?.sessions.find((session) => session.sessionKey === selectedSessionKey);

  const result = selectedSessionKey ? await getLapAnalysisBySession(selectedSessionKey) : { rows: [], source: "openf1-waiting" as const };
  const source = sourceLabel(result.source);
  const selectedMeetingName = selectedMeeting ? translateMeetingName(selectedMeeting.meetingName) : null;
  const selectedSessionName = selectedSession ? translateSessionName(selectedSession.sessionName) : null;
  const topRows = result.rows.slice(0, 3);

  return (
    <main className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
          ← BACK TO HOME
        </Link>
        <RaceWeekendReturnLink session={resolvedSearchParams.session} />
      </div>

      <section className="motion-fade-up rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Lap Analysis</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">圈速分析</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              单独承载比赛中的圈速、分段、stint 与差距变化分析。可按 OpenF1 比赛周末和赛段筛选。
            </p>
          </div>
          <div className="w-fit rounded-full border border-pitGreen/50 bg-black/60 px-3 py-1 text-xs font-semibold text-pitGreen shadow-[0_0_24px_rgba(25,243,139,0.14)]">
            SESSION ANALYSIS · {source}
          </div>
        </div>
      </section>

      <section id="lap-session-selector" className="card scroll-mt-6 motion-fade-up motion-delay-1 space-y-3">
        <div>
          <p className="eyebrow">Session Selector</p>
          <h2 className="mt-1 text-lg font-semibold text-white">选择比赛与赛段</h2>
          <p className="mt-1 text-sm text-zinc-400">
            当前：{selectedMeetingName ? `${selectedMeetingName} · ${selectedSessionName ?? "自动选择"}` : "等待 OpenF1 返回赛段列表"}
          </p>
          <p className="mt-1 text-xs text-zinc-600">数据标识：{selectedSessionKey ?? "暂无"}</p>
        </div>

        <form action="/lap-analysis#lap-session-selector" className="grid gap-3 sm:grid-cols-[1fr_auto]" method="get">
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
            切换赛段
          </button>
        </form>
      </section>

      {result.rows.length ? (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            {topRows.map((item, index) => (
              <article key={item.driver} className={`card motion-fade-up motion-delay-${index + 2}`}>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-3xl font-bold text-white">{item.driver}</p>
                  <span className="rounded-full border border-neonAmber/40 bg-neonAmber/10 px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.16em] text-neonAmber">
                    {item.stint}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                    <p className="race-code">Laps</p>
                    <p className="mt-1 font-mono text-xl font-bold text-white">{item.laps}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                    <p className="race-code">Best</p>
                    <p className="mt-1 font-mono text-lg font-bold text-white">{item.bestLap}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                    <p className="race-code">Gap</p>
                    <p className="mt-1 font-mono text-xl font-bold text-white">{item.gap}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="card motion-fade-up motion-delay-5 overflow-hidden p-0">
            <div className="border-b border-zinc-800 bg-black/25 px-4 py-3">
              <p className="eyebrow">Lap Table</p>
              <h2 className="mt-1 text-lg font-semibold text-white">车手圈速概览</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-950/60 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <tr>
                    {['POS', 'Driver', 'Best', 'Latest', 'Laps', 'Gap', 'S1', 'S2', 'S3', 'Stint'].map((title) => (
                      <th key={title} className="px-4 py-3">{title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.driver} className="border-b border-zinc-900 transition hover:bg-white/[0.03]">
                      <td className="px-4 py-4 font-mono text-zinc-500">{row.position}</td>
                      <td className="px-4 py-4 font-mono text-white">{row.driver}</td>
                      <td className="px-4 py-4 font-mono text-neonRed">{row.bestLap}</td>
                      <td className="px-4 py-4 font-mono text-orange-300">{row.latestLap}</td>
                      <td className="px-4 py-4 font-mono text-zinc-300">{row.laps}</td>
                      <td className="px-4 py-4 font-mono text-neonAmber">{row.gap}</td>
                      <td className="px-4 py-4 font-mono text-zinc-400">{row.s1}</td>
                      <td className="px-4 py-4 font-mono text-zinc-400">{row.s2}</td>
                      <td className="px-4 py-4 font-mono text-zinc-400">{row.s3}</td>
                      <td className="px-4 py-4 font-mono text-zinc-400">{row.stint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-zinc-800 bg-black/20 p-5 text-sm leading-6 text-zinc-400">
          <p className="font-semibold text-zinc-200">该赛段暂无圈速数据。</p>
          <p className="mt-1">比赛尚未开始，或该赛段暂未产生可用的圈速记录。</p>
        </section>
      )}
    </main>
  );
}
