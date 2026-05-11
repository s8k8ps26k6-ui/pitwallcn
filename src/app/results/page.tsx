import Link from "next/link";
import { getResultsBySession, getResultsSelectionData } from "@/lib/results-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ResultsSearchParams = {
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

function sourceLabel(source: string) {
  if (source === "openf1") return "OPENF1";
  if (source === "openf1-waiting") return "WAITING DATA";
  if (source === "openf1-error") return "OPENF1 WAITING";
  return "API READY";
}

function statusClass(status: string) {
  if (status === "完赛") return "border-pitGreen/40 bg-pitGreen/10 text-pitGreen";
  if (status === "DNF") return "border-neonAmber/40 bg-neonAmber/10 text-neonAmber";
  return "border-neonRed/40 bg-neonRed/10 text-neonRed";
}

export default async function ResultsPage({ searchParams }: { searchParams?: ResultsSearchParams }) {
  const selection = await getResultsSelectionData();
  const requestedSession = parseSessionKey(searchParams?.session);
  const selectedSessionKey = requestedSession ?? selection.defaultSessionKey;

  const selectedMeeting = selection.meetings.find((meeting) =>
    meeting.sessions.some((session) => session.sessionKey === selectedSessionKey)
  );
  const selectedSession = selectedMeeting?.sessions.find((session) => session.sessionKey === selectedSessionKey);

  const result = selectedSessionKey ? await getResultsBySession(selectedSessionKey) : { rows: [], source: "openf1-waiting" as const };
  const source = sourceLabel(result.source);
  const selectedMeetingName = selectedMeeting ? translateMeetingName(selectedMeeting.meetingName) : null;
  const selectedSessionName = selectedSession ? translateSessionName(selectedSession.sessionName) : null;
  const podiumRows = result.rows.slice(0, 3);

  return (
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>

      <section className="motion-fade-up rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Results Center</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">比赛结果</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              单独展示排位赛、冲刺赛与正赛成绩。数据来自 OpenF1 session_result，不混入圈速分析页面。
            </p>
          </div>
          <div className="w-fit rounded-full border border-pitGreen/50 bg-black/60 px-3 py-1 text-xs font-semibold text-pitGreen shadow-[0_0_24px_rgba(25,243,139,0.14)]">
            SESSION RESULT · {source}
          </div>
        </div>
      </section>

      <section id="results-session-selector" className="card scroll-mt-6 motion-fade-up motion-delay-1 space-y-3">
        <div>
          <p className="eyebrow">Weekend / Session</p>
          <h2 className="mt-1 text-lg font-semibold text-white">选择比赛周末与赛段</h2>
          <p className="mt-1 text-sm text-zinc-400">
            当前：{selectedMeetingName ? `${selectedMeetingName} · ${selectedSessionName ?? "自动选择"}` : "等待 OpenF1 返回成绩赛段"}
          </p>
          <p className="mt-1 text-xs text-zinc-600">数据标识：{selectedSessionKey ?? "暂无"}</p>
        </div>

        <form action="/results#results-session-selector" className="grid gap-3 sm:grid-cols-[1fr_auto]" method="get">
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
            查看成绩
          </button>
        </form>
      </section>

      {result.rows.length ? (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            {podiumRows.map((item) => (
              <article key={item.driver} className="card motion-fade-up">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-3xl font-bold text-white">{item.position}</span>
                  <span className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.16em] ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-5 font-mono text-2xl font-bold text-white">{item.driver}</p>
                <p className="mt-1 text-sm text-zinc-500">{item.team}</p>
                <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                    <p className="race-code">Time / Gap</p>
                    <p className="mt-1 font-mono text-lg font-bold text-neonAmber">{item.timeOrGap}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                    <p className="race-code">Laps</p>
                    <p className="mt-1 font-mono text-lg font-bold text-white">{item.completedLaps}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="card motion-fade-up overflow-hidden p-0">
            <div className="border-b border-zinc-800 bg-black/25 px-4 py-3">
              <p className="eyebrow">Classification</p>
              <h2 className="mt-1 text-lg font-semibold text-white">成绩表</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-950/60 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <tr>
                    {['POS', 'Driver', 'Team', 'Time / Gap', 'Laps', 'Status'].map((title) => (
                      <th key={title} className="px-4 py-3">{title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.driver} className="border-b border-zinc-900 transition hover:bg-white/[0.03]">
                      <td className="px-4 py-4 font-mono text-zinc-500">{row.position}</td>
                      <td className="px-4 py-4 font-mono text-white">{row.driver}</td>
                      <td className="px-4 py-4 text-zinc-400">{row.team}</td>
                      <td className="px-4 py-4 font-mono text-neonAmber">{row.timeOrGap}</td>
                      <td className="px-4 py-4 font-mono text-zinc-300">{row.completedLaps}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.16em] ${statusClass(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-zinc-800 bg-black/20 p-5 text-sm leading-6 text-zinc-400">
          <p className="font-semibold text-zinc-200">该赛段暂无成绩数据。</p>
          <p className="mt-1">比赛尚未开始，或该赛段暂未产生可用的成绩记录。</p>
        </section>
      )}
    </main>
  );
}
