import type { RaceOutlookReport } from "@/lib/race-outlook-types";
import styles from "./race-outlook-panel.module.css";

export function RaceOutlookPanel({ report }: { report: RaceOutlookReport | null }) {
  if (!report) {
    return <article className={styles.empty}><span>AI Race Outlook</span><strong>暂不可用</strong><p>只有当前比赛周已接入并核验练习赛或排位赛数据后，才会生成阶段性报告。</p></article>;
  }

  return <article className={styles.panel}>
    <header><span>AI Race Outlook</span><small>{report.simulation ? "模拟验证" : "共享缓存报告"}</small></header>
    <strong>{report.summary}</strong>
    <dl>
      <div><dt>单圈速度</dt><dd>{report.oneLapPace}</dd></div>
      <div><dt>长距离</dt><dd>{report.longRunPace}</dd></div>
      <div><dt>策略风险</dt><dd>{report.tyreRisk}</dd></div>
      <div><dt>变量</dt><dd>{report.weatherOrSafetyCar}</dd></div>
    </dl>
    <footer>数据完整度：{report.dataCompleteness === "sufficient" ? "充足" : "部分"} · 置信等级：{report.confidence}</footer>
  </article>;
}
