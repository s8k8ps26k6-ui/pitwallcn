import { DataSessionSelector } from "@/components/data-session-selector";
import styles from "@/app/data-pages.module.css";
import { parseSessionKey, sourceLabel, translateMeetingName, translateSessionName } from "@/lib/f1-labels";
import { getRaceControlFeed, getRaceControlFeedBySession, getRaceControlSelectionData } from "@/lib/race-control-service";
import type { RaceControlMessage } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RaceControlSearchParams = { session?: string };

const categoryName: Record<RaceControlMessage["category"], string> = {
  FLAG: "旗语",
  SAFETY_CAR: "安全车",
  INCIDENT: "事件",
  NOTICE: "通知"
};

export default async function RaceControlPage({ searchParams }: { searchParams: Promise<RaceControlSearchParams> }) {
  const resolved = await searchParams;
  const selection = await getRaceControlSelectionData();
  const selectedSessionKey = parseSessionKey(resolved.session) ?? selection.defaultSessionKey;
  const selectedMeeting = selection.meetings.find((meeting) =>
    meeting.sessions.some((session) => session.sessionKey === selectedSessionKey)
  );
  const selectedSession = selectedMeeting?.sessions.find((session) => session.sessionKey === selectedSessionKey);
  const feed = selectedSessionKey ? await getRaceControlFeedBySession(selectedSessionKey) : await getRaceControlFeed();
  const meetingName = selectedMeeting ? translateMeetingName(selectedMeeting.meetingName) : null;
  const sessionName = selectedSession ? translateSessionName(selectedSession.sessionName) : null;

  return (
    <main className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>赛会控制</h1>
          <p className={styles.lede}>按发生顺序读取旗语、安全车、调查与官方通知。</p>
        </div>
        <p className={styles.source}>{sourceLabel(feed.source)}</p>
      </header>

      <DataSessionSelector
        action="/race-control"
        anchor="race-control-session-selector"
        meetings={selection.meetings}
        selectedMeetingName={meetingName}
        selectedSessionKey={selectedSessionKey}
        selectedSessionName={sessionName}
        submitLabel="切换赛段"
      />

      {feed.data.length ? (
        <section className={styles.sheet} aria-labelledby="event-log-title">
          <div className={styles.sheetHead}>
            <h2 className={styles.sheetTitle} id="event-log-title">控制消息时间线</h2>
            <p className={styles.sheetNote}>最新消息在上方。内容为 OpenF1 所记录的 Race Control 事件。</p>
          </div>
          <ol className={styles.timeline}>
            {feed.data.map((message, index) => (
              <li className={styles.message} key={message.id}>
                <div className={styles.messageTime}>
                  <span>{message.timestamp}</span><br />
                  <span>#{String(feed.data.length - index).padStart(2, "0")}</span>
                </div>
                <article className={styles.messageBody}>
                  <div className={styles.messageMeta}>
                    <span className={styles.messageCategory}>{categoryName[message.category]}</span>
                    {message.flag ? <span>旗语 {message.flag}</span> : null}
                    {typeof message.lapNumber === "number" ? <span>第 {message.lapNumber} 圈</span> : null}
                    {message.scope ? <span>{message.scope}</span> : null}
                  </div>
                  <p className={styles.messageText}>{message.message}</p>
                </article>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>该赛段暂无赛会控制消息</h2>
          <p>比赛尚未开始，或 OpenF1 尚未返回控制事件。这里不会生成示例消息填充时间线。</p>
        </section>
      )}
    </main>
  );
}
