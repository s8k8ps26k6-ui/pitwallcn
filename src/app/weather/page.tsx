import { DataSessionSelector } from "@/components/data-session-selector";
import styles from "@/app/data-pages.module.css";
import { parseSessionKey, sourceLabel, translateMeetingName, translateSessionName } from "@/lib/f1-labels";
import { getWeatherBySession, getWeatherSelectionData } from "@/lib/weather-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type WeatherSearchParams = { session?: string };

function barWidth(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "0%";
  return `${Math.min(Math.max((value / 65) * 100, 3), 100)}%`;
}

export default async function WeatherPage({ searchParams }: { searchParams: Promise<WeatherSearchParams> }) {
  const resolved = await searchParams;
  const selection = await getWeatherSelectionData();
  const selectedSessionKey = parseSessionKey(resolved.session) ?? selection.defaultSessionKey;
  const selectedMeeting = selection.meetings.find((meeting) =>
    meeting.sessions.some((session) => session.sessionKey === selectedSessionKey)
  );
  const selectedSession = selectedMeeting?.sessions.find((session) => session.sessionKey === selectedSessionKey);
  const weather = selectedSessionKey
    ? await getWeatherBySession(selectedSessionKey)
    : {
        points: [],
        summary: { latest: null, sampleCount: 0, averageTrackTemperature: "—", maxTrackTemperature: "—", minTrackTemperature: "—", maxWindSpeed: "—", rainySamples: 0 },
        source: "openf1-waiting" as const
      };
  const meetingName = selectedMeeting ? translateMeetingName(selectedMeeting.meetingName) : null;
  const sessionName = selectedSession ? translateSessionName(selectedSession.sessionName) : null;
  const latest = weather.summary.latest;
  const recent = weather.points.slice(-72).reverse();
  const trend = weather.points.slice(-18);

  return (
    <main className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>赛道天气</h1>
          <p className={styles.lede}>读取当前赛段的温度、风、降雨与历史采样。</p>
        </div>
        <p className={`${styles.source} ${styles.sourceCyan}`}>{sourceLabel(weather.source)}</p>
      </header>

      <DataSessionSelector
        action="/weather"
        anchor="weather-session-selector"
        meetings={selection.meetings}
        selectedMeetingName={meetingName}
        selectedSessionKey={selectedSessionKey}
        selectedSessionName={sessionName}
        submitLabel="查看天气"
      />

      {weather.points.length ? (
        <>
          <section className={styles.instrumentBoard} aria-label="赛道天气仪表">
            <article className={`${styles.instrument} ${styles.instrumentMain}`}>
              <p className={styles.instrumentLabel}>TRACK TEMPERATURE / LATEST</p>
              <p className={styles.instrumentValue}>{latest?.trackTemperature ?? "—"}</p>
              <p className={styles.instrumentSub}>均值 {weather.summary.averageTrackTemperature} · 最高 {weather.summary.maxTrackTemperature} · 最低 {weather.summary.minTrackTemperature}</p>
              <div className={styles.trend} aria-label="最近赛道温度趋势">
                {trend.map((point) => (
                  <div className={styles.trendRow} key={point.date}>
                    <span>{point.time}</span>
                    <span className={styles.trendTrack}><span className={styles.trendFill} style={{ display: "block", width: barWidth(point.trackTemperatureValue) }} /></span>
                    <span>{point.trackTemperature}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className={styles.instrument}>
              <p className={styles.instrumentLabel}>AIR</p>
              <p className={styles.factValue}>{latest?.airTemperature ?? "—"}</p>
              <p className={styles.instrumentSub}>空气温度</p>
            </article>
            <article className={styles.instrument}>
              <p className={styles.instrumentLabel}>HUMIDITY</p>
              <p className={styles.factValue}>{latest?.humidity ?? "—"}</p>
              <p className={styles.instrumentSub}>相对湿度</p>
            </article>
            <article className={styles.instrument}>
              <p className={styles.instrumentLabel}>WIND</p>
              <p className={styles.factValue}>{latest?.windSpeed ?? "—"}</p>
              <p className={styles.instrumentSub}>{latest?.windDirection ?? "方向未知"} · 最大 {weather.summary.maxWindSpeed}</p>
            </article>
            <article className={styles.instrument}>
              <p className={styles.instrumentLabel}>RAIN / PRESSURE</p>
              <p className={styles.factValue}>{latest?.rainLabel ?? "—"}</p>
              <p className={styles.instrumentSub}>{latest?.pressure ?? "—"} · 雨量样本 {weather.summary.rainySamples}</p>
            </article>
          </section>

          <section className={styles.sheet} aria-labelledby="weather-ledger-title">
            <div className={styles.sheetHead}>
              <h2 className={styles.sheetTitle} id="weather-ledger-title">Weather ledger</h2>
              <p className={styles.sheetNote}>共 {weather.summary.sampleCount} 条采样；此处列出最近 {recent.length} 条。历史赛段字段可能不完整。</p>
            </div>
            <div className={styles.mobileRows}>
              {recent.slice(0, 18).map((point) => (
                <article className={styles.mobileRow} key={point.date}>
                  <span className={styles.position}>{point.time}</span>
                  <div><strong>{point.trackTemperature}</strong><p>赛道 · 空气 {point.airTemperature}</p></div>
                  <div><strong>{point.rainLabel}</strong><p>{point.windSpeed}</p></div>
                </article>
              ))}
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>时间</th><th>赛道</th><th>空气</th><th>湿度</th><th>气压</th><th>降雨</th><th>风向</th><th>风速</th></tr></thead>
                <tbody>
                  {recent.map((point) => (
                    <tr key={point.date}>
                      <td className={styles.position}>{point.time}</td><td className={styles.accentValue}>{point.trackTemperature}</td>
                      <td className={styles.mono}>{point.airTemperature}</td><td className={styles.mono}>{point.humidity}</td>
                      <td className={styles.mono}>{point.pressure}</td><td>{point.rainLabel}</td>
                      <td className={styles.mono}>{point.windDirection}</td><td className={styles.mono}>{point.windSpeed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section className={styles.empty}>
          <h2 className={styles.emptyTitle}>该赛段暂无天气数据</h2>
          <p>比赛尚未开始，或 OpenF1 尚未产生可用天气采样。页面不会使用模拟气象读数。</p>
        </section>
      )}
    </main>
  );
}
