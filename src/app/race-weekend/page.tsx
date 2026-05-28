import Link from "next/link";
import { RecapDrawerNav } from "@/components/recap-drawer-nav";
import { getResultsSelectionData } from "@/lib/results-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RaceWeekendSearchParams = {
  session?: string;
};

const fallbackSessionKey = 11249;

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

async function safeGetSelectionData() {
  try {
    return await getResultsSelectionData();
  } catch {
    return {
      meetings: [],
      defaultSessionKey: null,
      source: "openf1-empty" as const
    };
  }
}

export default async function RaceWeekendPage({ searchParams }: { searchParams?: RaceWeekendSearchParams }) {
  const selection = await safeGetSelectionData();
  const requestedSession = parseSessionKey(searchParams?.session);
  const selectedSessionKey = requestedSession ?? selection.defaultSessionKey ?? fallbackSessionKey;
  const selectedMeeting = selection.meetings.find((meeting) => meeting.sessions.some((session) => session.sessionKey === selectedSessionKey));
  const selectedSession = selectedMeeting?.sessions.find((session) => session.sessionKey === selectedSessionKey);
  const selectedMeetingName = selectedMeeting ? translateMeetingName(selectedMeeting.meetingName) : "手动模式";
  const selectedSessionName = selectedSession ? translateSessionName(selectedSession.sessionName) : "手动赛段";
  const sourceLabel = selection.meetings.length ? "OPENF1" : "MANUAL MODE";
  const moduleHref = (path: string) => `${path}?session=${selectedSessionKey}`;

  const sectionLinks = [
    { href: "#overview", label: "总览", hint: "复盘入口" },
    { href: "#session", label: "选择赛段", hint: `Session ${selectedSessionKey}` },
    { href: moduleHref("/results"), label: "比赛结果", hint: "查看成绩详情" },
    { href: moduleHref("/race-control"), label: "赛控消息", hint: "查看赛会控制" },
    { href: moduleHref("/lap-analysis"), label: "圈速分析", hint: "查看圈速详情" },
    { href: moduleHref("/weather"), label: "赛道天气", hint: "查看天气详情" }
  ];

  const summaryCards = [
    { label: "当前赛段", value: selectedSessionName, hint: selectedMeetingName },
    { label: "数据模式", value: sourceLabel, hint: selection.meetings.length ? "赛段列表来自 OpenF1" : "可手动输入 session_key" },
    { label: "入口结构", value: "HUB", hint: "详情页独立进入" },
    { label: "当前 Session", value: `${selectedSessionKey}`, hint: "会传递给结果/赛控/圈速/天气页面" }
  ];

  const moduleCards = [
    { title: "比赛结果", code: "CLASSIFICATION", href: moduleHref("/results"), description: "查看完整成绩表、名次、差距、圈数和完赛状态。" },
    { title: "赛控消息", code: "RACE CONTROL", href: moduleHref("/race-control"), description: "查看旗语、安全车、赛道边界、调查和删除圈速等消息。" },
    { title: "圈速分析", code: "LAP ANALYSIS", href: moduleHref("/lap-analysis"), description: "查看最快圈、分段、位置、差距和 stint 信息。" },
    { title: "赛道天气", code: "WEATHER", href: moduleHref("/weather"), description: "查看赛道温度、空气温度、湿度、风速和降雨记录。" }
  ];

  return (
    <main className="space-y-4">
      <Link className="race-code inline-flex rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-zinc-400 transition hover:border-neonAmber hover:text-neonAmber" href="/">
        ← BACK TO HOME
      </Link>

      <section id="overview" className="scroll-mt-6 motion-fade-up rounded-2xl border border-zinc-800 bg-black/30 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Race Weekend Recap</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">单站复盘</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              这个页面改成复盘入口页：只保留总览、赛段选择和模块入口。结果、赛控、圈速、天气不再堆在一条长页面里。
            </p>
          </div>
          <div className="w-fit rounded-full border border-pitGreen/50 bg-black/60 px-3 py-1 text-xs font-semibold text-pitGreen shadow-[0_0_24px_rgba(25,243,139,0.14)]">
            RECAP · {sourceLabel}
          </div>
        </div>
      </section>

      <RecapDrawerNav items={sectionLinks} currentLabel={selectedSessionName} currentHint={selectedMeetingName} />

      <section id="session" className="card scroll-mt-24 motion-fade-up motion-delay-1 space-y-3">
        <div>
          <p className="eyebrow">Weekend / Session</p>
          <h2 className="mt-1 text-lg font-semibold text-white">选择复盘赛段</h2>
          <p className="mt-1 text-sm text-zinc-400">当前：{selectedMeetingName} · {selectedSessionName}</p>
          <p className="mt-1 text-xs text-zinc-600">数据标识：{selectedSessionKey}</p>
        </div>

        {selection.meetings.length ? (
          <form action="/race-weekend#session" className="grid gap-3" method="get">
            <select className="w-full rounded-xl border border-zinc-800 bg-black/30 px-3 py-3 text-sm text-zinc-100 outline-none transition focus:border-neonAmber" defaultValue={selectedSessionKey} name="session">
              {selection.meetings.map((meeting) => (
                <optgroup key={meeting.meetingKey} label={`${translateMeetingName(meeting.meetingName)} · ${meeting.country} · ${meeting.location}`}>
                  {meeting.sessions.map((session) => (
                    <option key={session.sessionKey} value={session.sessionKey}>
                      {translateSessionName(session.sessionName)} · Session {session.sessionKey} · {formatSessionTime(session.sessionStart)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button className="rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-neonAmber hover:text-neonAmber" type="submit">
              查看复盘
            </button>
          </form>
        ) : null}

        <form action="/race-weekend#session" className="grid gap-3 sm:grid-cols-[1fr_auto]" method="get">
          <input
            className="rounded-xl border border-zinc-800 bg-black/30 px-3 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-neonAmber"
            defaultValue={selectedSessionKey}
            inputMode="numeric"
            name="session"
            placeholder="手动输入 OpenF1 session_key"
            type="number"
          />
          <button className="rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-neonAmber hover:text-neonAmber" type="submit">
            手动查看
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

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {moduleCards.map((item) => (
          <Link key={item.href} className="group rounded-2xl border border-zinc-800 bg-black/25 p-4 transition hover:border-neonAmber/60 hover:bg-white/[0.03]" href={item.href}>
            <div className="flex items-center justify-between gap-3">
              <p className="race-code text-zinc-500">{item.code}</p>
              <span className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-neonAmber">→</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
            <p className="mt-4 truncate font-mono text-xs text-neonAmber">打开详情 →</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
