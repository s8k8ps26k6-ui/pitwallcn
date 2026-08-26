import Link from "next/link";
import styles from "@/app/data-pages.module.css";
import { formatSessionTime, translateMeetingName, translateSessionName } from "@/lib/f1-labels";

type SessionOption = {
  sessionKey: number;
  sessionName: string;
  sessionStart: string;
};

type MeetingOption = {
  meetingKey: number;
  meetingName: string;
  location: string;
  country: string;
  sessions: SessionOption[];
};

export function DataSessionSelector({
  action,
  anchor,
  meetings,
  selectedSessionKey,
  selectedMeetingName,
  selectedSessionName,
  submitLabel
}: {
  action: string;
  anchor: string;
  meetings: MeetingOption[];
  selectedSessionKey: number | null;
  selectedMeetingName: string | null;
  selectedSessionName: string | null;
  submitLabel: string;
}) {
  const selectedMeeting = meetings.find((meeting) =>
    meeting.sessions.some((session) => session.sessionKey === selectedSessionKey)
  );

  return (
    <section className={styles.sessionDock} id={anchor} aria-labelledby={`${anchor}-title`}>
      <div>
        <h2 className={styles.sessionTitle} id={`${anchor}-title`}>选择比赛与赛段</h2>
        <p className={styles.sessionCurrent}>
          {selectedMeetingName ? `${selectedMeetingName} · ${selectedSessionName ?? "自动选择"}` : "等待数据源返回可用赛段"}
        </p>
        <p className={styles.sessionId}>SESSION {selectedSessionKey ?? "—"}</p>
      </div>

      <div>
        <form action={`${action}#${anchor}`} className={styles.selectorForm} method="get">
          <label className={styles.fieldLabel}>
            赛段
            <select className={styles.select} defaultValue={selectedSessionKey ?? ""} name="session">
              {!selectedSessionKey ? <option value="">自动选择最新可用赛段</option> : null}
              {meetings.map((meeting) => (
                <optgroup key={meeting.meetingKey} label={`${translateMeetingName(meeting.meetingName)} · ${meeting.country} · ${meeting.location}`}>
                  {meeting.sessions.map((session) => (
                    <option key={session.sessionKey} value={session.sessionKey}>
                      {translateSessionName(session.sessionName)} · {formatSessionTime(session.sessionStart)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <button className={styles.submit} type="submit">{submitLabel}</button>
        </form>

        {selectedMeeting?.sessions.length ? (
          <nav className={styles.quickNav} aria-label="当前比赛周末赛段" data-session-shortcuts>
            {selectedMeeting.sessions.map((session) => {
              const active = session.sessionKey === selectedSessionKey;
              return (
                <Link
                  className={`${styles.quickLink} ${active ? styles.quickLinkActive : ""}`}
                  href={{
                    pathname: action,
                    query: { session: session.sessionKey },
                    hash: anchor
                  }}
                  key={session.sessionKey}
                >
                  {translateSessionName(session.sessionName)}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </section>
  );
}
