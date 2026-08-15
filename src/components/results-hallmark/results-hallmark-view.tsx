/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5 */
import Link from "next/link";
import { getResultsBySession, getResultsSelectionData } from "@/lib/results-service";
import styles from "./results-hallmark.module.css";
import tune from "./results-title-tune.module.css";

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
  if (source === "openf1") return "OpenF1";
  if (source === "openf1-waiting") return "等待数据";
  if (source === "openf1-error") return "OpenF1 暂不可用";
  return "API";
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
  const locationLine = selectedMeeting
    ? [selectedMeeting.location, selectedMeeting.country, "2026"].filter(Boolean).join(" · ")
    : "2026 FORMULA 1";

  return (
    <main className={`${styles.page} ${tune.pageTypography}`}>
      <div className={styles.backdrop} aria-hidden="true" />

      <header className={`${styles.masthead} ${tune.masthead}`}>
        <Link className={`${styles.brand} ${tune.brand}`} href="/" aria-label="返回 LAPMETRY 首页">
          LAPMETRY
        </Link>
        <div className={`${styles.mastheadActions} ${tune.mastheadActions}`}>
          <span className={`${styles.seasonMark} ${tune.seasonMark}`}>2026 FORMULA 1</span>
          <Link className={`${styles.textLink} ${tune.mastheadLink} ${tune.secondaryLink}`} href="/results">当前版本</Link>
          <Link className={`${styles.textLink} ${tune.mastheadLink}`} href="/race-weekend">单站复盘</Link>
        </div>
      </header>

      <section className={`${styles.identity} ${tune.identityStage}`} aria-labelledby="results-preview-title">
        <div className={styles.identityCopy}>
          <p className={tune.locationLine}>{locationLine}</p>
          <h1 id="results-preview-title" className={tune.eventTitle}>{selectedMeetingName}</h1>
          <div className={tune.sessionHeading}>
            <p className={tune.sessionTitle}>{selectedSessionName}成绩</p>
            <p className={tune.sessionDate}>{selectedSession ? formatSessionTime(selectedSession.sessionStart) : "等待赛段时间"}</p>
          </div>
        </div>
      </section>

      <section className={`${styles.sessionControl} ${tune.sessionBar}`} aria-label="切换赛段">
        {quickSessions.length ? (
          <nav className={`${styles.quickSessions} ${tune.primarySessions}`} aria-label="当前比赛周末赛段">
            {quickSessions.map((session) => {
              const active = session.sessionKey === selectedSessionKey;
              return (
                <Link
                  key={session.sessionKey}
                  className={`${styles.quickSession} ${tune.primarySession}`}
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

        <details className={tune.otherSessions}>
          <summary>选择其他比赛 / 赛段</summary>
          <form action="/preview/results-hallmark#classification" className={`${styles.sessionForm} ${tune.compactForm}`} method="get">
            <label className={styles.selectLabel}>
              <span>比赛 / 赛段</span>
              <select
                className={`${styles.select} ${tune.sessionSelect}`}
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
            <button className={`${styles.submitButton} ${tune.actionButton}`} type="submit" disabled={!selection.meetings.length}>
              切换
            </button>
          </form>
        </details>
      </section>

      <section id="classification" className={`${styles.classification} ${tune.classification}`} aria-labelledby="classification-title">
        <header className={`${styles.classificationHeader} ${tune.classificationHeader}`}>
          <div>
            <h2 id="classification-title">正式排名</h2>
            <p>{selectedMeetingName} · {selectedSessionName}</p>
          </div>
          <p className={`${styles.sessionStamp} ${tune.sourceStamp}`}>
            {sourceLabel(result.source)}{selectedSessionKey ? ` · SESSION ${selectedSessionKey}` : ""}
          </p>
        </header>

        {result.rows.length ? (
          <ol className={`${styles.resultList} ${tune.resultList}`}>
            {result.rows.map((row, index) => (
              <li
                key={`${row.position}-${row.driver}`}
                className={`${styles.resultRow} ${tune.resultRow}`}
                data-podium={index < 3 ? String(index + 1) : undefined}
                data-status={statusTone(row.status)}
              >
                <span className={`${styles.position} ${tune.position}`}>{String(row.position).padStart(2, "0")}</span>
                <div className={`${styles.driverCell} ${tune.driverCell}`}>
                  <strong>{row.driver}</strong>
                  <span>{row.team}</span>
                </div>
                <div className={`${styles.metricCell} ${tune.metricCell}`}>
                  <span>时间 / 差距</span>
                  <strong>{row.timeOrGap}</strong>
                </div>
                <div className={`${styles.metricCell} ${tune.metricCell}`}>
                  <span>完成圈数</span>
                  <strong>{row.completedLaps}</strong>
                </div>
                <span className={`${styles.status} ${tune.status}`} data-tone={statusTone(row.status)}>{row.status}</span>
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

      <footer className={`${styles.footer} ${tune.footer}`}>
        <span>Hallmark preview · Results only</span>
        <span>沿用现有 LAPMETRY Results service；未新增模拟指标。</span>
      </footer>
    </main>
  );
}
