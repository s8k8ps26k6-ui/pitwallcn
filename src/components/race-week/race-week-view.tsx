import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import { CircuitOutline } from "@/components/race-shared/circuit-outline";
import { HomeBrandLink } from "@/components/home-brand-link";
import {
  formatLocalDateTime,
  formatRaceDateRange,
  getCountryFlag,
  getSessionLabel,
  type RaceMoment,
  type UnifiedRace,
} from "@/lib/atlas/race-detail";
import type { SeasonSelectionPhase } from "@/lib/atlas/season-2026";
import type { EventTheme } from "@/lib/event-theme";
import {
  sourceLabel,
  translateMeetingName,
  translateSessionName,
} from "@/lib/f1-labels";
import type { getLapAnalysisBySession } from "@/lib/lap-analysis-service";
import type { getRaceControlFeedBySession } from "@/lib/race-control-service";
import type {
  getResultsBySession,
  getResultsSelectionData,
  ResultsSelectorMeeting,
  ResultsSelectorSession,
} from "@/lib/results-service";
import type { getLiveTiming } from "@/lib/f1-service";
import type { getWeatherBySession } from "@/lib/weather-service";
import styles from "./race-week.module.css";
import { SessionRail } from "./session-rail";

type ResultsSelection = Awaited<ReturnType<typeof getResultsSelectionData>>;
type ResultsData = Awaited<ReturnType<typeof getResultsBySession>>;
type RaceControlData = Awaited<ReturnType<typeof getRaceControlFeedBySession>>;
type LapAnalysisData = Awaited<ReturnType<typeof getLapAnalysisBySession>>;
type WeatherData = Awaited<ReturnType<typeof getWeatherBySession>>;
type LiveTimingData = Awaited<ReturnType<typeof getLiveTiming>>;

export type SelectedSessionContext = {
  meeting: ResultsSelectorMeeting;
  session: ResultsSelectorSession;
};

type RaceWeekViewProps = {
  race: UnifiedRace;
  phase: SeasonSelectionPhase;
  moment: RaceMoment;
  nowIso: string;
  theme: EventTheme;
  selection: ResultsSelection;
  selected: SelectedSessionContext | null;
  requestedSessionKey: number | null;
  results: ResultsData;
  raceControl: RaceControlData;
  lapAnalysis: LapAnalysisData;
  weather: WeatherData;
  liveTiming: LiveTimingData;
};

type WorkspaceMode = "pre" | "live" | "post";

function formatUtcDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "TIME UNKNOWN";
  return `${new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase()} UTC`;
}

function getCountdown(target: string, nowIso: string) {
  const delta = Math.max(0, Date.parse(target) - Date.parse(nowIso));
  const totalMinutes = Math.floor(delta / 60_000);
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  };
}

function getStaticSessionState(
  startTime: string,
  confirmed: boolean | undefined,
  index: number,
  nextIndex: number,
  now: number,
) {
  if (!confirmed) return index === nextIndex ? "next" : "pending";
  if (Date.parse(startTime) < now) return "complete";
  return index === nextIndex ? "next" : "pending";
}

function DataStatus({
  label,
  value,
  state,
}: {
  label: string;
  value: string;
  state: "ready" | "partial" | "waiting" | "missing";
}) {
  return (
    <span className={styles.dataStatus} data-state={state}>
      <i aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </span>
  );
}

function SessionTimeline({
  race,
  selected,
  nowIso,
}: {
  race: UnifiedRace;
  selected: SelectedSessionContext | null;
  nowIso: string;
}) {
  const sessions = selected
    ? selected.meeting.sessions.map((session) => ({
        key: String(session.sessionKey),
        label: translateSessionName(session.sessionName),
        startTime: session.sessionStart,
        confirmed: true,
        selected: selected.session.sessionKey === session.sessionKey,
      }))
    : race.sessions.map((session, index) => ({
        key: `${session.name}-${index}`,
        label: getSessionLabel(session, index, race.race.isSprint),
        startTime: session.startTime,
        confirmed: session.isTimeConfirmed,
        selected: false,
      }));
  const now = Date.parse(nowIso);
  const confirmedFutureIndex = selected
    ? -1
    : sessions.findIndex(
        (session) => session.confirmed && Date.parse(session.startTime) >= now,
      );
  const nextIndex = confirmedFutureIndex >= 0 ? confirmedFutureIndex : 0;

  const focusIndex = selected
    ? Math.max(
        0,
        sessions.findIndex((session) => session.selected),
      )
    : nextIndex;

  return (
    <section
      id="session-timeline"
      className={styles.sessionTimeline}
      aria-label="Session timeline"
    >
      <div className={styles.timelineLead}>
        <span>SESSION TIMELINE</span>
        <strong>{selected ? "已完成赛段" : "比赛周时间结构"}</strong>
      </div>
      <SessionRail focusIndex={focusIndex}>
        {sessions.map((session, index) => {
          const state = selected
            ? session.selected
              ? "selected"
              : "complete"
            : getStaticSessionState(
                session.startTime,
                session.confirmed,
                index,
                nextIndex,
                now,
              );
          const time = selected
            ? formatUtcDateTime(session.startTime)
            : session.confirmed
              ? formatLocalDateTime(
                  session.startTime,
                  race.circuit?.timeZone,
                  "zh-CN",
                )
              : "TIME TBC";

          return (
            <li data-state={state} key={session.key}>
              <span className={styles.timelineNode} aria-hidden="true" />
              <small>{String(index + 1).padStart(2, "0")}</small>
              <strong>{session.label}</strong>
              <time dateTime={session.startTime}>{time}</time>
            </li>
          );
        })}
      </SessionRail>
    </section>
  );
}

function CircuitDominantField({
  race,
  moment,
  nowIso,
  mode,
}: {
  race: UnifiedRace;
  moment: RaceMoment;
  nowIso: string;
  mode: "pre" | "live";
}) {
  const countdown = getCountdown(moment.startTime, nowIso);
  const hasConfirmedSession = Boolean(moment.isTimeConfirmed);
  const nextSessionLabel = hasConfirmedSession
    ? moment.label
    : "Awaiting official session schedule";
  const timingLabel = moment.isTimeConfirmed
    ? formatLocalDateTime(moment.startTime, race.circuit?.timeZone, "zh-CN")
    : "比赛周日期已确认；具体赛段时间待官方公布";

  return (
    <section
      className={styles.raceIntelligenceField}
      data-mode={mode}
      aria-label="Monza Race Intelligence Field"
    >
      <header className={styles.fieldEventIdentity}>
        <span>
          ROUND {String(race.race.round).padStart(2, "0")} ·{" "}
          {formatRaceDateRange(race)}
        </span>
        <h1>{race.race.name}</h1>
        <p>
          {getCountryFlag(race.race.country)} {race.race.country} ·{" "}
          {race.race.city}
        </p>
      </header>

      <div className={styles.fieldRaceState}>
        <span>CURRENT RACE STATE</span>
        <strong>{mode === "live" ? "LIVE" : "PRE-RACE"}</strong>
        <p>{race.race.circuitName}</p>
      </div>

      <figure className={styles.intelligenceCircuit}>
        <figcaption>
          <span>MONZA</span>
          <small>TECHNICAL CIRCUIT FIELD</small>
        </figcaption>
        <CircuitOutline
          outline={race.circuit?.outline}
          className={`${styles.intelligenceTrace} ${styles.intelligenceTraceBase}`}
          title=""
        />
        <CircuitOutline
          outline={race.circuit?.outline}
          className={`${styles.intelligenceTrace} ${styles.intelligenceTraceMain}`}
          title={`${race.race.circuitName} 赛道轮廓`}
          showStartMarker
        />

        <div className={styles.startFinishCallout}>
          <span>START / FINISH</span>
          <small>TRACK REFERENCE</small>
        </div>

        <div className={styles.circuitMetrics}>
          <span>
            <small>TRACK LENGTH</small>
            <strong>
              {race.circuit?.lengthKm?.toFixed(3) ?? "—"}
              <i>KM</i>
            </strong>
          </span>
          <span>
            <small>RACE DISTANCE</small>
            <strong>
              {race.circuit?.laps ?? "—"}
              <i>LAPS</i>
            </strong>
          </span>
        </div>

        <p className={styles.circuitSource}>
          CIRCUIT GEOMETRY · {race.circuit?.source ?? "SOURCE UNVERIFIED"}
        </p>
      </figure>

      <div className={styles.readinessAnnotation}>
        <span>SESSION READINESS</span>
        <strong>
          {mode === "live" ? "VERIFIED LIVE" : "AWAITING SESSION"}
        </strong>
        <p>
          {mode === "live"
            ? "实时状态由已验证数据源触发。"
            : "没有赛段被标记为 LIVE。"}
        </p>
      </div>

      <aside className={styles.nextSessionAnnotation} aria-label="下一赛段">
        <span>NEXT SESSION</span>
        <strong>{nextSessionLabel}</strong>
        <time dateTime={moment.startTime}>{timingLabel}</time>
        <small className={styles.countdownBasis}>
          {hasConfirmedSession
            ? "COUNTDOWN TO SESSION"
            : "COUNTDOWN TO RACE WEEKEND"}
        </small>
        <div className={styles.fieldCountdown} aria-label="距离下一节点">
          <span>
            <b>{String(countdown.days).padStart(2, "0")}</b>D
          </span>
          <span>
            <b>{String(countdown.hours).padStart(2, "0")}</b>H
          </span>
          <span>
            <b>{String(countdown.minutes).padStart(2, "0")}</b>M
          </span>
        </div>
      </aside>

      <div className={styles.fieldAvailability} aria-label="数据可用状态">
        <DataStatus
          label="TIMING"
          value={mode === "live" ? "LIVE" : "NOT CONNECTED"}
          state={mode === "live" ? "ready" : "missing"}
        />
        <DataStatus label="WEATHER" value="NO SOURCE" state="waiting" />
        <DataStatus
          label="RACE CONTROL"
          value="AFTER SESSION START"
          state="waiting"
        />
        <DataStatus label="TRACK CONDITION" value="AWAITING" state="waiting" />
      </div>

      <SessionTimeline race={race} selected={null} nowIso={nowIso} />
    </section>
  );
}

function ClassificationDominantField({
  selected,
  results,
}: {
  selected: SelectedSessionContext;
  results: ResultsData;
}) {
  return (
    <section
      className={styles.dominantField}
      data-mode="post"
      aria-label="赛后赛事工作场"
    >
      <div className={styles.fieldStatement}>
        <span>POST-SESSION · CLASSIFICATION</span>
        <h1>{translateSessionName(selected.session.sessionName)}</h1>
        <p>
          这是用户明确选择的已完成 OpenF1 Session。数据不会与当前 2026
          比赛周混合，也不标记为实时。
        </p>
      </div>

      <div className={styles.classificationFocus}>
        <div className={styles.classificationHead}>
          <span>POS</span>
          <span>DRIVER / TEAM</span>
          <span>TIME / GAP</span>
          <span>LAPS</span>
        </div>
        <ol>
          {results.rows.slice(0, 8).map((row) => (
            <li key={row.driverNumber}>
              <b>{row.position}</b>
              <span>
                <strong>{row.driverName}</strong>
                <small>{row.team}</small>
              </span>
              <time>{row.timeOrGap}</time>
              <em>{row.completedLaps}</em>
            </li>
          ))}
        </ol>
        {!results.rows.length ? (
          <div className={styles.fieldEmpty}>
            <strong>Classification unavailable</strong>
            <p>OpenF1 未返回该 Session 的分类结果，没有注入占位车手。</p>
          </div>
        ) : null}
      </div>

      <aside className={styles.currentSession} aria-label="已选赛段状态">
        <span>已选数据集</span>
        <strong>{translateMeetingName(selected.meeting.meetingName)}</strong>
        <time dateTime={selected.session.sessionStart}>
          {formatUtcDateTime(selected.session.sessionStart)}
        </time>
        <p>{selected.meeting.location} · 历史 Session · 非实时</p>
        <div className={styles.readinessLine}>
          <DataStatus
            label="CLASSIFICATION"
            value={`${results.rows.length} 行`}
            state={results.rows.length ? "ready" : "missing"}
          />
          <DataStatus
            label="SOURCE"
            value={sourceLabel(results.source)}
            state={results.source === "openf1" ? "ready" : "missing"}
          />
          <DataStatus label="LIVE" value="NO" state="waiting" />
        </div>
      </aside>
    </section>
  );
}

function TimingWorkspace({
  mode,
  results,
  liveTiming,
  selected,
}: {
  mode: WorkspaceMode;
  results: ResultsData;
  liveTiming: LiveTimingData;
  selected: SelectedSessionContext | null;
}) {
  const rows = mode === "live" ? liveTiming.data : results.rows;

  return (
    <section
      className={styles.timingWorkspace}
      id="timing"
      aria-labelledby="timing-title"
    >
      <header className={styles.workspaceHead}>
        <div>
          <span>{mode === "post" ? "CLASSIFICATION" : "TIMING"}</span>
          <h2 id="timing-title">
            {mode === "post"
              ? "Session classification"
              : "Current session timing"}
          </h2>
        </div>
        <p>
          {mode === "post"
            ? `${sourceLabel(results.source)} · ${results.rows.length} ROWS · NOT LIVE`
            : `${liveTiming.source.toUpperCase()} · ${liveTiming.status.toUpperCase()}`}
        </p>
      </header>

      {rows.length ? (
        <div
          className={styles.timingTable}
          role="region"
          aria-label="Timing 数据，可横向浏览"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th>POS</th>
                <th>DRIVER</th>
                <th>TEAM</th>
                <th>{mode === "post" ? "TIME / GAP" : "GAP"}</th>
                <th>{mode === "post" ? "LAPS" : "LAST LAP"}</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {mode === "live"
                ? liveTiming.data.map((row) => (
                    <tr key={row.driver}>
                      <td>{`P${row.position}`}</td>
                      <td>{row.driver}</td>
                      <td>{row.team}</td>
                      <td>{row.gap}</td>
                      <td>{row.lastLap}</td>
                      <td>{row.pitStatus}</td>
                    </tr>
                  ))
                : results.rows.map((row) => (
                    <tr key={row.driverNumber}>
                      <td>{row.position}</td>
                      <td>{row.driverName}</td>
                      <td>{row.team}</td>
                      <td>{row.timeOrGap}</td>
                      <td>{row.completedLaps}</td>
                      <td>{row.status}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.timingUnavailable}>
          <div className={styles.emptyStateLine}>
            <strong>{selected ? "UNAVAILABLE" : "NOT CONNECTED"}</strong>
            <p>
              {selected
                ? "No verified classification was returned for this session."
                : "No verified live timing source is connected."}
            </p>
          </div>
          <p className={styles.emptyStateDetail}>
            {liveTiming.message} {" "}
            {selected
              ? "所选 Session 未返回 classification；页面没有补入车手、Gap、轮胎或速度。"
              : "赛前待命状态。Timing、Gap、Tyre 与 Driver status 均保持空缺。"}
          </p>
        </div>
      )}
    </section>
  );
}

function ConditionsWorkspace({
  weather,
  lapAnalysis,
  selected,
}: {
  weather: WeatherData;
  lapAnalysis: LapAnalysisData;
  selected: SelectedSessionContext | null;
}) {
  const latest = weather.summary.latest;
  const fastest = lapAnalysis.rows.find((row) => row.bestLap !== "--");

  return (
    <section
      className={styles.conditionsWorkspace}
      aria-label="赛道条件与圈速分析"
    >
      <div className={styles.conditionBlock}>
        <header>
          <span>WEATHER / TRACK</span>
          {selected ? <p>{`${sourceLabel(weather.source)} · ${weather.summary.sampleCount} SAMPLES`}</p> : null}
        </header>
        {latest ? (
          <>
            <div className={styles.conditionNumbers}>
              <span>
                <small>TRACK</small>
                <strong>{latest.trackTemperature}</strong>
              </span>
              <span>
                <small>AIR</small>
                <strong>{latest.airTemperature}</strong>
              </span>
              <span>
                <small>HUMIDITY</small>
                <strong>{latest.humidity}</strong>
              </span>
              <span>
                <small>RAIN</small>
                <strong>{latest.rainLabel}</strong>
              </span>
            </div>
            <p className={styles.conditionNote}>
              最新样本 {latest.date} {latest.time}。OpenF1 历史 Session
              数据，非当前赛前预报。
            </p>
          </>
        ) : (
          <div className={styles.conditionUnavailable}>
            <strong>SOURCE UNAVAILABLE</strong>
            <p>没有可核验天气样本，因此不绘制趋势或 Track evolution。</p>
          </div>
        )}
      </div>

      <div className={styles.conditionBlock}>
        <header>
          <span>LAP ANALYSIS</span>
          <p>
            {selected
              ? `${sourceLabel(lapAnalysis.source)} · ${lapAnalysis.rows.length} DRIVERS`
              : "等待 Session 数据"}
          </p>
        </header>
        {fastest ? (
          <>
            <div className={styles.lapStatement}>
              <strong>{fastest.bestLap}</strong>
              <span>
                <b>{fastest.driverName}</b>
                <small>
                  {fastest.laps} LAPS · {fastest.position}
                </small>
              </span>
            </div>
            <p className={styles.conditionNote}>
              Sector、Stint 与 Gap 只会在 OpenF1
              返回对应字段时出现在详细分析页。
            </p>
          </>
        ) : (
          <div className={styles.conditionUnavailable}>
            <strong>AWAITING VERIFIED SESSION DATA</strong>
            <p>当前没有可核验圈速；不生成占位 telemetry。</p>
          </div>
        )}
      </div>
    </section>
  );
}

function RaceControlWorkspace({
  raceControl,
  selected,
}: {
  raceControl: RaceControlData;
  selected: SelectedSessionContext | null;
}) {
  return (
    <section
      className={styles.raceControlWorkspace}
      id="race-control"
      aria-labelledby="race-control-title"
    >
      <header className={styles.workspaceHead}>
        <div>
          <span>EVENT TIMELINE</span>
          <h2 id="race-control-title">Race Control</h2>
        </div>
        <p>
          {selected
            ? `${sourceLabel(raceControl.source)} · ${raceControl.data.length} MESSAGES · NOT LIVE`
            : "OPENF1 · SESSION NOT STARTED"}
        </p>
      </header>

      {raceControl.data.length ? (
        <ol className={styles.controlTimeline}>
          {raceControl.data.slice(0, 12).map((message) => (
            <li data-category={message.category} key={message.id}>
              <time dateTime={message.date}>{message.timestamp}</time>
              <span>{message.category.replace("_", " ")}</span>
              <p>{message.message}</p>
              <small>
                {message.lapNumber
                  ? `LAP ${message.lapNumber}`
                  : (message.scope ?? "SESSION")}
              </small>
            </li>
          ))}
        </ol>
      ) : (
        <div className={styles.controlUnavailable}>
          <span>SESSION STATUS</span>
          <strong>{selected ? "UNAVAILABLE" : "SESSION NOT STARTED"}</strong>
          <p>
            {selected
              ? "OpenF1 未返回所选 Session 的赛会控制消息。"
              : "比赛尚未进入可用 Session，事件时间轴保持空白。"}
          </p>
        </div>
      )}
    </section>
  );
}

function SessionArchive({
  selection,
  selected,
  requestedSessionKey,
}: {
  selection: ResultsSelection;
  selected: SelectedSessionContext | null;
  requestedSessionKey: number | null;
}) {
  return (
    <section
      className={styles.sessionArchive}
      id="session-data"
      aria-labelledby="archive-title"
    >
      <div>
        <span>OPENF1 SESSION ARCHIVE</span>
        <h2 id="archive-title">载入已完成 Session</h2>
        <p>
          只有这里的明确选择会切换到历史数据视图；默认页面始终代表当前比赛周。
        </p>
      </div>
      <form action="/race-weekend" method="get">
        <label htmlFor="race-week-session">历史 Session</label>
        <select
          defaultValue={selected?.session.sessionKey ?? ""}
          id="race-week-session"
          name="session"
        >
          <option value="">当前比赛周 / Pre-race</option>
          {selection.meetings.map((meeting) => (
            <optgroup
              label={translateMeetingName(meeting.meetingName)}
              key={meeting.meetingKey}
            >
              {meeting.sessions.map((session) => (
                <option key={session.sessionKey} value={session.sessionKey}>
                  {translateSessionName(session.sessionName)} ·{" "}
                  {formatUtcDateTime(session.sessionStart)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button type="submit">载入数据</button>
      </form>
      <p className={styles.archiveStatus}>
        {selected
          ? `当前：${translateMeetingName(selected.meeting.meetingName)} · ${translateSessionName(selected.session.sessionName)}`
          : requestedSessionKey
            ? `Session ${requestedSessionKey} 不在已核验选择列表中，未请求数据。`
            : selection.meetings.length
              ? `${selection.meetings.length} 个最近比赛站可选择 · ${sourceLabel(selection.source)}`
              : `历史选择器不可用 · ${sourceLabel(selection.source)}`}
      </p>
    </section>
  );
}

export function RaceWeekView({
  race,
  phase,
  moment,
  nowIso,
  theme,
  selection,
  selected,
  requestedSessionKey,
  results,
  raceControl,
  lapAnalysis,
  weather,
  liveTiming,
}: RaceWeekViewProps) {
  const mode: WorkspaceMode =
    phase === "current" && liveTiming.status === "live"
      ? "live"
      : selected
        ? "post"
        : "pre";
  const style = {
    "--event-accent": theme.accent,
    "--event-accent-rgb": theme.accentRgb,
    "--event-support": theme.support,
  } as CSSProperties;
  const eventName = selected ? selected.meeting.meetingName : race.race.name;
  const eventLocation = selected
    ? `${selected.meeting.country} · ${selected.meeting.location}`
    : `${getCountryFlag(race.race.country)} ${race.race.country} · ${race.race.city}`;
  const eventCircuit = selected
    ? `${translateSessionName(selected.session.sessionName)} · Session ${selected.session.sessionKey}`
    : race.race.circuitName;
  const availableModules = [
    results.rows.length,
    raceControl.data.length,
    lapAnalysis.rows.length,
    weather.summary.sampleCount,
  ].filter(Boolean).length;

  return (
    <main className={styles.page} data-mode={mode} style={style}>
      <div className={styles.ambient} aria-hidden="true" />
      <header className={styles.header}>
        <HomeBrandLink className={styles.brand} ariaLabel="返回 LAPMETRY 首页">
          LAPMETRY
        </HomeBrandLink>
        <nav aria-label="Race Week 导航">
          <a aria-current="page" href="#race-field">
            Race Week
          </a>
          <Link href="/schedule">Calendar</Link>
          <Link href="/atlas-v2">Atlas</Link>
        </nav>
      </header>

      <div id="race-field">
        {mode === "post" && selected ? (
          <>
            <section className={styles.eventBar} aria-label="赛事身份">
              <div className={styles.eventIdentity}>
                <span>OPENF1 ARCHIVE</span>
                <h2>{eventName}</h2>
                <p>{eventLocation}</p>
              </div>
              <div className={styles.circuitIdentity}>
                <span>SELECTED SESSION</span>
                <strong>{eventCircuit}</strong>
                <small>
                  {formatUtcDateTime(selected.session.sessionStart)}
                </small>
              </div>
              <div className={styles.modeIdentity}>
                <span>CURRENT STATE</span>
                <strong>POST-SESSION</strong>
                <small>{availableModules}/4 DATA GROUPS</small>
              </div>
            </section>
            <SessionTimeline race={race} selected={selected} nowIso={nowIso} />
            <ClassificationDominantField
              selected={selected}
              results={results}
            />
          </>
        ) : (
          <CircuitDominantField
            mode={mode === "live" ? "live" : "pre"}
            race={race}
            moment={moment}
            nowIso={nowIso}
          />
        )}
      </div>

      <div className={styles.dataProvenance} aria-label="数据状态摘要">
        <DataStatus
          label="EVENT"
          value={selected ? "OPENF1" : "2026 METADATA"}
          state="ready"
        />
        <DataStatus
          label="TIMING"
          value={
            mode === "live"
              ? "LIVE"
              : mode === "post"
                ? sourceLabel(results.source)
                : "NOT CONNECTED"
          }
          state={
            mode === "live"
              ? "ready"
              : mode === "post" && results.rows.length
                ? "ready"
                : "missing"
          }
        />
        <DataStatus
          label="COMPLETENESS"
          value={mode === "post" ? `${availableModules}/4` : "PRE-RACE"}
          state={mode === "post" && availableModules < 4 ? "partial" : "ready"}
        />
        <DataStatus
          label="LIVE"
          value={mode === "live" ? "YES" : "NO"}
          state={mode === "live" ? "ready" : "waiting"}
        />
      </div>

      <TimingWorkspace
        mode={mode}
        results={results}
        liveTiming={liveTiming}
        selected={selected}
      />
      <ConditionsWorkspace
        weather={weather}
        lapAnalysis={lapAnalysis}
        selected={selected}
      />
      <RaceControlWorkspace raceControl={raceControl} selected={selected} />
      <SessionArchive
        selection={selection}
        selected={selected}
        requestedSessionKey={requestedSessionKey}
      />

      <nav className={styles.deepLinks} aria-label="详细数据页面">
        {[
          ["Results", "/results"],
          ["Race Control", "/race-control"],
          ["Lap Analysis", "/lap-analysis"],
          ["Weather", "/weather"],
        ].map(([label, pathname]) => (
          <Link
            href={
              (selected
                ? `${pathname}?session=${selected.session.sessionKey}`
                : pathname) as Route
            }
            key={pathname}
          >
            {label} <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </nav>

      <footer className={styles.footer}>
        <span>LAPMETRY · RACE WEEK</span>
        <span>真实数据优先 · 缺失状态不进行视觉补全</span>
      </footer>
    </main>
  );
}
