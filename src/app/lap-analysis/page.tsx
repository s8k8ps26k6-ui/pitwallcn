import { DataSessionSelector } from "@/components/data-session-selector";
import styles from "@/app/data-pages.module.css";
import { parseSessionKey, sourceLabel, translateMeetingName, translateSessionName } from "@/lib/f1-labels";
import { getLapAnalysisBySession, getLapAnalysisSelectionData } from "@/lib/lap-analysis-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type LapAnalysisSearchParams = { session?: string };

export default async function LapAnalysisPage({ searchParams }: { searchParams: Promise<LapAnalysisSearchParams> }) {
  const resolved = await searchParams;
  const selection = await getLapAnalysisSelectionData();
  const selectedSessionKey = parseSessionKey(resolved.session) ?? selection.defaultSessionKey;
  const selectedMeeting = selection.meetings.find((meeting) =>
    meeting.sessions.some((session) => session.sessionKey === selectedSessionKey)
  );
  const selectedSession = selectedMeeting?.sessions.find((session) => session.sessionKey === selectedSessionKey);
  const result = selectedSessionKey
    ? await getLapAnalysisBySession(selectedSessionKey)
    : { rows: [], source: "openf1-waiting" as const };
  const meetingName = selectedMeeting ? translateMeetingName(selectedMeeting.meetingName) : null;
  const sessionName = selectedSession ? translateSessionName(selectedSession.sessionName) : null;

  return (
    <main className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>圈速分析</h1>
          <p className={styles.lede}>比较车手最快圈、最近圈、分段与差距。</p>
        </div>
        <p className={styles.source}>{sourceLabel(result.source)}</p>
      </header>

      <DataSessionSelector
        action="/lap-analysis"
        anchor="lap-analysis-session-selector"
        meetings={selection.meetings}
        selectedMeetingName={meetingName}
        selectedSessionKey={selectedSessionKey}
        selectedSessionName={sessionName}
        submitLabel="载入分析"
      />

      {result.rows.length ? (
        <section className={styles.workbench} aria-label="圈速遥测工作台">
          <div>
            <div className={styles.sheetHead}>
              <h2 className={styles.sheetTitle}>车手对比</h2>
              <p className={styles.sheetNote}>按最快圈排序。</p>
            </div>
            <div className={styles.leaderboard}>
              {result.rows.map((row) => (
                <article className={styles.leaderRow} key={row.driver}>
                  <span className={styles.position}>P{row.position}</span>
                  <strong>{row.driver}</strong>
                  <div className={styles.leaderMetrics}>
                    <span>{row.bestLap}</span><span>{row.gap}</span><span>{row.stint}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <section className={styles.sheet} aria-labelledby="lap-matrix-title">
            <div className={styles.sheetHead}>
              <h2 className={styles.sheetTitle} id="lap-matrix-title">圈速矩阵</h2>
              <p className={styles.sheetNote}>最快圈、最近圈、三个分段、圈数和轮胎使用情况在同一矩阵内比较。</p>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>名次</th><th>车手</th><th>最快圈</th><th>最近圈</th><th>圈数</th><th>差距</th><th>S1</th><th>S2</th><th>S3</th><th>轮胎</th></tr></thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.driver}>
                      <td className={styles.position}>P{row.position}</td><td className={styles.mono}>{row.driver}</td>
                      <td className={styles.accentValue}>{row.bestLap}</td><td className={styles.mono}>{row.latestLap}</td>
                      <td className={styles.mono}>{row.laps}</td><td className={styles.mono}>{row.gap}</td>
                      <td className={styles.mono}>{row.s1}</td><td className={styles.mono}>{row.s2}</td><td className={styles.mono}>{row.s3}</td>
                      <td className={styles.mono}>{row.stint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      ) : (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>该赛段暂无圈速数据</h2>
          <p>比赛尚未开始，或 OpenF1 尚未产生可用圈速。页面不会显示示例车手或虚构差距。</p>
        </section>
      )}
    </main>
  );
}
