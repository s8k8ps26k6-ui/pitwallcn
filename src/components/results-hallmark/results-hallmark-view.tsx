/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5 */
import Link from "next/link";
import { getResultsBySession, getResultsSelectionData } from "@/lib/results-service";
import styles from "./results-hallmark.module.css";
import titleStyles from "./results-title-tune.module.css";

type ResultsHallmarkSearchParams = {
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
    timeZone: "Asia/Shanghai",
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
    [/Abu Dhabi Grand Prix/i, "阿布扎比大奖赛"],
  ];

  return replacements.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    name,
  );
}

function sourceLabel(source: string) {
  if (source === "openf1") return "OPENF1";
  if (source === "openf1-waiting") return "WAITING DATA";
  if (source === "openf1-error") return "OPENF1 WAITING";
  return "API READY";
}

function statusTone(status: string) {
  if (status === "完赛") return "complete";
  if (status === "退赛") return "retired";
  return "exception";
}

export async function ResultsHallmarkView({
  searchParams,
}: {
  searchParams: Promise<ResultsHallmarkSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const selection = await getResultsSelectionData();
  const requestedSession = parseSessionKey(resolvedSearchParams.session);
  const selectedSessionKey = requestedSession ?? selection.defaultSessionKey;

  const selectedMeeting = selection.meetings.find((meeting) =>
    meeting.sessions.some((session) => session.sessionKey === selectedSessionKey),
  );
  const selectedSession = selectedMeeting?.sessions.find(
    (session) => session.sessionKey === selectedSessionKey,
  );

  const result = selectedSessionKey
    ? await getResultsBySession(selectedSessionKey)
    : { rows: [], source: "openf1-waiting" as const };

  const selectedMeetingName = selectedMeeting
    ? translateMeetingName(selectedMeeting.meetingName)
    : "等待可用比赛";
  const selectedSessionName = selectedSession
    ? translateSessionName(selectedSession.sessionName)
    : "等待赛段";
  const quickSessions = [...(selectedMeeting?.sessions ?? [])].sort((a, b) => {
    const priority = { qualifying: 0, sprint: 1, race: 2 } as const;
    return priority[a.category] - priority[b.category];
  });
  const finishedCount = result.rows.filter((row) => row.status === "完赛").length;
  const exceptionCount = result.rows.filter((row) => row.status !== "完赛").length;

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true" />

      <header className={styles.masthead}>
        <Link className={styles.brand} href="/" aria-label="返回 LAPMETRY 首页">
          LAPMETRY
        </Link>
        <div className={styles.mastheadActions}>
          <span className={styles.seasonMark}>2026 FORMULA 1</span>
          <Link className={styles.textLink} href="/results">
            当前版本
          </Link>
          <Link className={styles.textLink} href="/race-weekend">
            单站复盘
          </Link>
        </div>
      </header>

      <section className={styles.identity} aria-labelledby="results-preview-title">
        <div className={styles.identityCopy}>
          <h1 id="results-preview-title" className={titleStyles.title}>比赛结果</h1>
          <p className={styles.eventName}>{selectedMeetingName}</p>
          <p className={styles.sessionName}>{selectedSessionName}</p>
        </div>
        <dl className={`${styles.dataStrip} ${titleStyles.openDataStrip}`} aria-label="当前成绩数据概况">
          <div>
            <dt>记录</dt>
            <dd>{result.rows.length || "—"}</dd>
          </div>
          <div>
            <dt>完赛</dt>
            <dd>{result.rows.length ? finishedCount : "—"}</dd>
          </div>
          <div>
            <dt>异常</dt>
            <dd>{result.rows.length ? exceptionCount : "—"}</dd>
          </div>
          <div>
            <dt>数据源</dt>
            <dd>{sourceLabel(result.source)}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.sessionControl} aria-label="切换比赛与赛段">
        <form action="/preview/results-hallmark#classification" className={styles.sessionForm} method="get">
          <label className={styles.selectLabel}>
            <span>比赛 / 赛段</span>
            <select
              className={`${styles.select} ${titleStyles.sessionSelect}`}
              defaultValue={selectedSessionKey ?? ""}
              name="session"
              disabled={!selection.meetings.length}
            >
              {!selectedSessionKey ? <option value="">自动选择最新可用赛段</option> : null}
              {selection.meetings.map((meeting) => (
                <optgroup
                  key={meeting.meetingKey}
                  label={`${translateMeetingName(meeting.meetingName)} · ${meeting.country} · ${meeting.location}`}
                >
                  {meeting.sessions.map((session) => (
                    <option key={session.sessionKey} value={session.sessionKey}>
                      {translateSessionName(session.sessionName)} · {formatSessionTime(session.sessionStart)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <button className={`${styles.submitButton} ${titleStyles.actionButton}`} type="submit" disabled={!selection.meetings.length}>
            更新成绩
          </button>
        </form>

        {quickSessions.length ? (
          <nav className={styles.quickSessions} aria-label="当前比赛周末赛段">
            {quickSessions.map((session) => {
              const active = session.sessionKey === selectedSessionKey;
              return (
                <Link
                  key={session.sessionKey}
                  className={styles.quickSession}
                  data-active={active}
                  href={`/preview/results-hallmark?session=${session.sessionKey}#classification`}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{translateSessionName(session.sessionName)}</span>
                  <small>{formatSessionTime(session.sessionStart)}</small>
                </Link>
              );
            })}
          </nav>
        ) : null}
      </section>

      <section id="classification" className={styles.classification} aria-labelledby="classification-title">
        <header className={styles.classificationHeader}>
          <div>
            <h2 id="classification-title">Classification</h2>
            <p>同一份成绩只展示一次；领奖台、时间差与状态直接在排名中建立层级。</p>
          </div>
          <p className={styles.sessionStamp}>
            {selectedSessionKey ? `SESSION ${selectedSessionKey}` : "NO SESSION"}
          </p>
        </header>

        {result.rows.length ? (
          <ol className={styles.resultList}>
            {result.rows.map((row, index) => (
              <li
                key={`${row.position}-${row.driver}`}
                className={styles.resultRow}
                data-podium={index < 3 ? String(index + 1) : undefined}
                data-status={statusTone(row.status)}
              >
                <span className={styles.position}>{String(row.position).padStart(2, "0")}</span>
                <div className={styles.driverCell}>
                  <strong>{row.driver}</strong>
                  <span>{row.team}</span>
                </div>
                <div className={styles.metricCell}>
                  <span>时间 / 差距</span>
                  <strong>{row.timeOrGap}</strong>
                </div>
                <div className={styles.metricCell}>
                  <span>完成圈数</span>
                  <strong>{row.completedLaps}</strong>
                </div>
                <span className={styles.status} data-tone={statusTone(row.status)}>
                  {row.status}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <div className={styles.emptyState}>
            <strong>该赛段暂无成绩数据</strong>
            <p>比赛尚未开始，或 OpenF1 暂未返回可核验的成绩记录。</p>
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        <span>Hallmark preview · Results only</span>
        <span>数据来自现有 LAPMETRY Results service；未新增模拟指标。</span>
      </footer>
    </main>
  );
}
