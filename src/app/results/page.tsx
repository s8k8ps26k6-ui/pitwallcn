import { DataSessionSelector } from "@/components/data-session-selector";
import styles from "@/app/data-pages.module.css";
import { parseSessionKey, sourceLabel, translateMeetingName, translateSessionName } from "@/lib/f1-labels";
import { getResultsBySession, getResultsSelectionData } from "@/lib/results-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ResultsSearchParams = { session?: string };

function statusClass(status: string) {
  if (status === "完赛") return styles.status;
  if (status === "退赛") return `${styles.status} ${styles.statusWarn}`;
  return `${styles.status} ${styles.statusDanger}`;
}

export default async function ResultsPage({ searchParams }: { searchParams: Promise<ResultsSearchParams> }) {
  const resolved = await searchParams;
  const selection = await getResultsSelectionData();
  const selectedSessionKey = parseSessionKey(resolved.session) ?? selection.defaultSessionKey;
  const selectedMeeting = selection.meetings.find((meeting) =>
    meeting.sessions.some((session) => session.sessionKey === selectedSessionKey)
  );
  const selectedSession = selectedMeeting?.sessions.find((session) => session.sessionKey === selectedSessionKey);
  const result = selectedSessionKey
    ? await getResultsBySession(selectedSessionKey)
    : { rows: [], source: "openf1-waiting" as const };

  const meetingName = selectedMeeting ? translateMeetingName(selectedMeeting.meetingName) : null;
  const sessionName = selectedSession ? translateSessionName(selectedSession.sessionName) : null;

  return (
    <main className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>比赛结果</h1>
          <p className={styles.lede}>按赛段查看正式分类、差距与完赛状态。</p>
        </div>
        <p className={styles.source}>{sourceLabel(result.source)}</p>
      </header>

      <DataSessionSelector
        action="/results"
        anchor="results-session-selector"
        meetings={selection.meetings}
        selectedMeetingName={meetingName}
        selectedSessionKey={selectedSessionKey}
        selectedSessionName={sessionName}
        submitLabel="查看成绩"
      />

      {result.rows.length ? (
          <section className={styles.sheet} aria-labelledby="classification-title">
            <div className={styles.sheetHead}>
              <h2 className={styles.sheetTitle} id="classification-title">Classification</h2>
              <p className={styles.sheetNote}>OpenF1 部分历史赛段可能缺少车队、圈数或完整成绩字段。</p>
            </div>
            <div className={styles.mobileRows}>
              {result.rows.map((row) => (
                <article className={styles.mobileRow} key={`${row.position}-${row.driver}`}>
                  <span className={styles.position}>P{row.position}</span>
                  <div><strong>{row.driver}</strong><p>{row.team} · {row.completedLaps} 圈</p></div>
                  <div><strong className={styles.accentValue}>{row.timeOrGap}</strong><span className={statusClass(row.status)}>{row.status}</span></div>
                </article>
              ))}
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>名次</th><th>车手</th><th>车队</th><th>时间 / 差距</th><th>完成圈数</th><th>状态</th></tr></thead>
                <tbody>
                  {result.rows.map((row, index) => (
                    <tr data-rank={index + 1} key={`${row.position}-${row.driver}`}>
                      <td className={styles.position}>P{row.position}</td><td className={styles.mono}>{row.driver}</td><td>{row.team}</td>
                      <td className={styles.accentValue}>{row.timeOrGap}</td><td className={styles.mono}>{row.completedLaps}</td>
                      <td><span className={statusClass(row.status)}>{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
      ) : (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>该赛段暂无成绩数据</h2>
          <p>比赛尚未开始，或 OpenF1 尚未生成可用的赛段结果。页面不会补入模拟排名。</p>
        </section>
      )}
    </main>
  );
}
