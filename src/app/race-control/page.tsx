import Link from "next/link";
import {
  getRaceControlFeed,
  getRaceControlFeedBySession,
  getRaceControlSelectionData
} from "@/lib/f1-service";
import type { RaceControlMessage } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const categoryStyles: Record<RaceControlMessage["category"], string> = {
  FLAG: "border-neonAmber/40 bg-neonAmber/10 text-neonAmber",
  SAFETY_CAR: "border-pitGreen/40 bg-pitGreen/10 text-pitGreen",
  INCIDENT: "border-neonRed/40 bg-neonRed/10 text-neonRed",
  NOTICE: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300"
};

const categoryText: Record<RaceControlMessage["category"], string> = {
  FLAG: "FLAG",
  SAFETY_CAR: "SAFETY CAR",
  INCIDENT: "INCIDENT",
  NOTICE: "NOTICE"
};

const categoryName: Record<RaceControlMessage["category"], string> = {
  FLAG: "旗语",
  SAFETY_CAR: "安全车",
  INCIDENT: "事件记录",
  NOTICE: "通知"
};

type RaceControlSearchParams = {
  session?: string;
};

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

export default async function RaceControlPage({ searchParams }: { searchParams?: RaceControlSearchParams }) {
  const selection = await getRaceControlSelectionData();
  const requestedSession = searchParams?.session ? Number(searchParams.session) : null;
  const selectedSessionKey = Number.isFinite(requestedSession) ? requestedSession : selection.defaultSessionKey;

  const selectedMeeting = selection.meetings.find((meeting) =>
    meeting.sessions.some((session) => session.sessionKey === selectedSessionKey)
  );
  const selectedSession = selectedMeeting?.sessions.find((session) => session.sessionKey === selectedSessionKey);

  const feed = selectedSessionKey ? await getRaceControlFeedBySession(selectedSessionKey) : await getRaceControlFeed();
  const { data, source, sessionName } = feed;

  const summaryCards = [
    { label: "Messages", value: data.length.toString(), hint: "当前消息数" },
    { label: "Latest", value: data[0]?.timestamp ?? "--", hint: "最新更新时间" },
    { label: "Mode", value: source === "openf1" ? "OPENF1" : "MOCK", hint: selectedSession?.sessionName ?? sessionName ?? "数据源状态" }
  ];

  return (
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>

      <section className="motion-fade-up rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Race Control</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">赛会控制</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              FIA Race Control 消息流，集中展示旗语、安全车、事件记录与比赛控制通知。现在可按 OpenF1 比赛周末与赛段单独筛选。
            </p>
          </div>
          <div className="w-fit rounded-full border border-neonAmber/50 bg-black/60 px-3 py-1 text-xs font-semibold text-neonAmber shadow-[0_0_24px_rgba(255,176,32,0.14)]">
            <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-neonAmber shadow-[0_0_14px_rgba(255,176,32,0.9)]" aria-hidden="true" />
            CONTROL FEED · {source === "openf1" ? "OPENF1" : "MOCK"}
          </div>
        </div>
      </section>

      <section className="card motion-fade-up motion-delay-1 space-y-3">
        <div>
          <p className="eyebrow">Session Selector</p>
          <h2 className="mt-1 text-lg font-semibold text-white">选择比赛与赛段</h2>
          <p className="mt-1 text-sm text-zinc-400">
            当前：{selectedMeeting ? `${selectedMeeting.meetingName} · ${selectedSession?.sessionName ?? "自动选择"}` : "Mock fallback"}
          </p>
        </div>

        <form className="grid gap-3 sm:grid-cols-[1fr_auto]" method="get">
          <select
            className="rounded-xl border border-zinc-800 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-neonAmber"
            defaultValue={selectedSessionKey ?? ""}
            name="session"
          >
            {!selectedSessionKey ? <option value="">自动选择最新可用赛段</option> : null}
            {selection.meetings.map((meeting) => (
              <optgroup key={meeting.meetingKey} label={`${meeting.meetingName} · ${meeting.country} · ${meeting.location}`}>
                {meeting.sessions.map((session) => (
                  <option key={session.sessionKey} value={session.sessionKey}>
                    {session.sessionName} · {formatSessionTime(session.sessionStart)}
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

      <section className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((item, index) => (
          <article key={item.label} className={`card motion-fade-up motion-delay-${index + 2}`}>
            <p className="eyebrow">{item.label}</p>
            <p className="mt-3 font-mono text-3xl font-bold text-white">{item.value}</p>
            <p className="mt-1 text-sm text-zinc-400">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="card motion-fade-up motion-delay-5 overflow-hidden p-0">
        <div className="border-b border-zinc-800 bg-black/25 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Message Log</p>
              <h2 className="mt-1 text-lg font-semibold text-white">控制消息时间线</h2>
            </div>
            <span className="race-code">FIA STYLE</span>
          </div>
        </div>

        <ol className="space-y-0 p-3">
          {data.map((msg, index) => (
            <li key={msg.id} className="relative grid gap-3 border-l border-zinc-800 pb-5 pl-5 last:pb-0 sm:grid-cols-[6rem_1fr]">
              <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-neonRed shadow-[0_0_12px_rgba(255,46,46,0.7)]" aria-hidden="true" />
              <div className="font-mono text-xs text-zinc-500">
                <p>{msg.timestamp}</p>
                <p className="mt-1">#{String(data.length - index).padStart(2, "0")}</p>
              </div>
              <article className="rounded-xl border border-zinc-800 bg-black/25 p-3 transition hover:border-zinc-700 hover:bg-black/35">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.16em] ${categoryStyles[msg.category]}`}>
                    {categoryText[msg.category]}
                  </span>
                  <span className="text-xs text-zinc-500">{categoryName[msg.category]}</span>
                </div>
                <p className="text-sm leading-6 text-zinc-100">{msg.message}</p>
                {(msg.flag || typeof msg.lapNumber === "number" || msg.scope) ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    {[msg.flag ? `旗语：${msg.flag}` : null, typeof msg.lapNumber === "number" ? `圈数：${msg.lapNumber}` : null, msg.scope ? `范围：${msg.scope}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
