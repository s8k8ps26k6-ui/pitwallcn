import { BackNavigation } from "@/components/back-navigation";
import { DataSessionSelector } from "@/components/data-session-selector";
import { RaceWeekendReturnLink } from "@/components/race-weekend-return-link";
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
      <div className={styles.backRow}>
        <BackNavigation className={styles.back} fallbackHref="/race-weekend" fallbackLabel="返回比赛周" />
        <RaceWeekendReturnLink session={resolved.session} />
      </div>

      <header className={styles.pageHead}>
        <div>
          <p className={styles.routeCode}>LAP ANALYSIS / TELEMETRY WORKBENCH</p>
          <h1 className={styles.title}>圈速分析</h1>
          <p className={styles.lede}>左侧用于快速比较车手，右侧保留完整圈速与分段矩阵。车手不再被包装成三张卡片，更不会在卡片内部继续套指标卡。</p>
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
              <h2 className={styles.sheetTitle}>Driver comparison</h2>
              <p className={styles.sheetNote}>按最快圈排序的快速视图。</p>
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
              <h2 className={styles.sheetTitle} id="lap-matrix-title">Lap matrix</h2>
              <p className={styles.sheetNote}>Best、Latest、三个分段、圈数和 stint 在同一矩阵内比较。</p>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>POS</th><th>Driver</th><th>Best</th><th>Latest</th><th>Laps</th><th>Gap</th><th>S1</th><th>S2</th><th>S3</th><th>Stint</th></tr></thead>
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
