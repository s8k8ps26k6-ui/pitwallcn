import { getRaceControlFeedBySession, getRaceControlSelectionData } from "@/lib/f1-service";

const colors: Record<string, string> = {
  FLAG: "text-neonAmber",
  SAFETY_CAR: "text-pitGreen",
  INCIDENT: "text-neonRed",
  NOTICE: "text-zinc-100"
};

const categoryText: Record<string, string> = {
  FLAG: "旗语",
  SAFETY_CAR: "安全车",
  INCIDENT: "事故",
  NOTICE: "通知"
};

export default async function RaceControlPage({ searchParams }: { searchParams?: { session?: string } }) {
  const selection = await getRaceControlSelectionData();

  const selectedSessionParam = searchParams?.session;
  const selectedSessionKey = selectedSessionParam ? Number(selectedSessionParam) : selection.defaultSessionKey;
  const hasValidSelectedSession = Number.isFinite(selectedSessionKey ?? NaN);

  const feed = hasValidSelectedSession
    ? await getRaceControlFeedBySession(Number(selectedSessionKey))
    : { data: [], source: "mock" as const };

  const selectedMeeting = selection.meetings.find((meeting) =>
    meeting.sessions.some((session) => session.sessionKey === selectedSessionKey)
  );
  const selectedSession = selectedMeeting?.sessions.find((session) => session.sessionKey === selectedSessionKey);

  const messages = feed.data.length > 0 ? feed.data : [];

  return (
    <section className="card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">赛会控制</h2>
        <span className="text-xs text-zinc-500">数据来源：{feed.source === "openf1" ? "OPENF1" : "MOCK"}</span>
      </div>

      <form className="mb-4 grid gap-3 sm:grid-cols-2" method="get">
        <label className="text-sm text-zinc-300">
          比赛周末
          <select
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
            value={selectedMeeting?.meetingKey ?? ""}
            disabled
          >
            <option value="">自动选择</option>
            {selection.meetings.map((meeting) => (
              <option key={meeting.meetingKey} value={meeting.meetingKey}>
                {meeting.meetingName}（{meeting.country}·{meeting.location}）
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-zinc-300">
          赛段
          <select
            name="session"
            defaultValue={selectedSessionKey ?? ""}
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
          >
            {!selectedSessionKey && <option value="">自动选择最新可用赛段</option>}
            {selection.meetings.flatMap((meeting) =>
              meeting.sessions.map((session) => (
                <option key={session.sessionKey} value={session.sessionKey}>
                  {meeting.meetingName} · {session.sessionName}
                </option>
              ))
            )}
          </select>
        </label>

        <button type="submit" className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 hover:border-neonAmber hover:text-neonAmber sm:col-span-2 sm:w-fit">
          切换赛段
        </button>
      </form>

      <p className="mb-3 text-xs text-zinc-400">
        当前周末：{selectedMeeting ? `${selectedMeeting.meetingName}（${selectedMeeting.country}·${selectedMeeting.location}）` : "无可用 OpenF1 周末，已使用 Mock"}
        <br />
        当前赛段：{selectedSession ? selectedSession.sessionName : "未选择（自动）"}
      </p>

      <ul className="space-y-2">
        {messages.map((msg) => (
          <li key={msg.id} className="rounded border border-zinc-800 p-3">
            <div className="flex items-center justify-between text-xs text-zinc-400"><span>{msg.timestamp}</span><span className={colors[msg.category]}>{categoryText[msg.category]}</span></div>
            <p className="mt-1 text-sm">{msg.message}</p>
            {(msg.flag || typeof msg.lapNumber === "number") && (
              <p className="mt-1 text-xs text-zinc-500">{msg.flag ? `旗语：${msg.flag}` : ""}{msg.flag && typeof msg.lapNumber === "number" ? " · " : ""}{typeof msg.lapNumber === "number" ? `圈数：${msg.lapNumber}` : ""}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
