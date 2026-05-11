import { getLapAnalysisBySession, getLapAnalysisSelectionData, lapAnalysisDemoRows } from "@/lib/lap-analysis-service";

export default async function LapAnalysisPage({ searchParams }: { searchParams?: { session?: string } }) {
  let meetings = [] as Awaited<ReturnType<typeof getLapAnalysisSelectionData>>["meetings"];
  let defaultSessionKey: number | null = null;

  try {
    const selection = await getLapAnalysisSelectionData();
    meetings = selection.meetings;
    defaultSessionKey = selection.defaultSessionKey;
  } catch {
    meetings = [];
    defaultSessionKey = null;
  }

  const requestedSession = searchParams?.session ? Number(searchParams.session) : null;
  const sessionKey = Number.isFinite(requestedSession ?? NaN) ? requestedSession : defaultSessionKey;

  const selectedMeeting = meetings.find((m) => m.sessions.some((s) => s.sessionKey === sessionKey));
  const selectedSession = selectedMeeting?.sessions.find((s) => s.sessionKey === sessionKey);

  const result = sessionKey ? await getLapAnalysisBySession(sessionKey) : { rows: [], source: "OPENF1 WAITING" as const };

  return (
    <section className="card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">圈速分析</h2>
        <span className="text-xs text-zinc-500">数据来源：{result.source}</span>
      </div>

      <form method="get" className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-zinc-300">
          比赛周末
          <select className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100" disabled value={selectedMeeting?.meetingKey ?? ""}>
            <option value="">自动选择</option>
            {meetings.map((meeting) => (
              <option key={meeting.meetingKey} value={meeting.meetingKey}>{meeting.meetingName}（{meeting.country}·{meeting.location}）</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-zinc-300">
          赛段
          <select name="session" defaultValue={sessionKey ?? ""} className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100">
            {!sessionKey && <option value="">自动选择最新可用赛段</option>}
            {meetings.flatMap((meeting) => meeting.sessions.map((session) => (
              <option key={session.sessionKey} value={session.sessionKey}>{meeting.meetingName} · {session.sessionName}</option>
            )))}
          </select>
        </label>
        <button type="submit" className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 hover:border-neonAmber hover:text-neonAmber sm:col-span-2 sm:w-fit">切换赛段</button>
      </form>

      <p className="mb-3 text-xs text-zinc-400">当前周末：{selectedMeeting ? `${selectedMeeting.meetingName}（${selectedMeeting.country}·${selectedMeeting.location}）` : "未选择"}<br/>当前赛段：{selectedSession?.sessionName ?? "未选择"}</p>

      {result.source === "OPENF1 WAITING" ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-200">该赛段暂无圈速数据 / 等待比赛数据</p>
          <div>
            <p className="mb-2 text-xs text-zinc-500">演示样例</p>
            <ul className="space-y-2">
              {lapAnalysisDemoRows.map((row) => (
                <li key={row.driver} className="rounded border border-zinc-800 p-3 text-sm text-zinc-200">车手 {row.driver} · 最快 {row.bestLap} · 最新 {row.latestLap}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {result.rows.map((row) => (
            <li key={row.driver} className="rounded border border-zinc-800 p-3 text-sm">
              <div className="flex items-center justify-between text-zinc-100"><span>车手 {row.driver}</span><span>{row.lastKnownPosition}</span></div>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-400"><span>最快圈 {row.bestLap}</span><span>最新圈 {row.latestLap}</span><span>总圈数 {row.laps}</span><span>间隔 {row.gap}</span><span>{row.stint}</span></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
