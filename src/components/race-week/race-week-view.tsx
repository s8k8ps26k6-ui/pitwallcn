import Link from 'next/link';
import type { CSSProperties } from 'react';
import { HomeBrandLink } from '@/components/home-brand-link';
import { CircuitOutline } from '@/components/race-shared/circuit-outline';
import { getCountryFlag, type UnifiedRace } from '@/lib/atlas/race-detail';
import type { WeekendData } from './weekend-data';
import { shortSessionName } from './weekend-model';
import styles from './race-week.module.css';

function local(iso: string, zone: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: zone, ...options }).format(new Date(iso));
}
const stateLabels = { 'pre-event': '赛周尚未开始', 'active-session': '当前日程', 'between-sessions': '赛段间歇', completed: '比赛周已结束', unconfirmed: '赛段时间待确认' };
export function RaceWeekView({ race, races, data, invalidEvent }: { race: UnifiedRace; races: UnifiedRace[]; data: WeekendData; invalidEvent?: boolean }) {
  const { weekend } = data;
  const zone = race.circuit?.timeZone ?? 'UTC';
  const focused = weekend.sessions[weekend.focus];
  const selectedWeather = data.selectedKey ? data.weather[data.selectedKey]?.summary.latest : null;
  const days = new Map<string, number[]>();
  weekend.sessions.forEach((session, i) => {
    const day = local(session.start, zone, { year: 'numeric', month: '2-digit', day: '2-digit' });
    days.set(day, [...(days.get(day) ?? []), i]);
  });
  const lastMessage = data.control?.source === 'openf1' ? data.control.data.at(-1) : null;
  return <main className={styles.page} data-weekend-state={weekend.state} data-event={race.race.id}>
    <header className={styles.header}>
      <HomeBrandLink className={styles.brand} ariaLabel="返回 LAPMETRY 首页">LAPMETRY</HomeBrandLink>
      <nav aria-label="主导航"><Link href="/race-weekend" aria-current="page">比赛周</Link><Link href="/schedule">赛历</Link><Link href="/atlas-v2">Atlas</Link></nav>
    </header>
    <section className={styles.scene} aria-labelledby="event-title">
      <div className={styles.identity}><span>ROUND {String(race.race.round).padStart(2, '0')} · {race.season}</span><h1 id="event-title">{race.race.city}</h1><p>{race.race.name}</p><small>{getCountryFlag(race.race.country)} {race.race.circuitName}</small><time>{race.race.startDate} — {race.race.endDate}</time></div>
      <div className={styles.overview}><span>RACE WEEK</span><strong>{stateLabels[weekend.state]}</strong><p>{focused ? shortSessionName(focused.name) : '日程待确认'}</p></div>
    </section>
    {invalidEvent && <p role="status" className={styles.notice}>未找到指定赛事，已显示当前比赛周。</p>}
    <section className={styles.progression} aria-label="比赛周进程">
      <div className={styles.timelineMeta}><h2>周末进程</h2><span>{race.race.isSprint ? '冲刺赛周末' : '大奖赛周末'} · 赛道当地时间 · {zone}</span></div>
      <div className={styles.days} style={{ '--sessions': Math.max(1, weekend.sessions.length) } as CSSProperties}>
        {[...days].map(([day, indexes]) => <section className={styles.day} key={day} style={{ '--day-sessions': indexes.length } as CSSProperties}>
          <h3><span>{local(weekend.sessions[indexes[0]].start, zone, { weekday: 'long' })}</span><time>{local(weekend.sessions[indexes[0]].start, zone, { month: 'short', day: 'numeric' })}</time></h3>
          <ol>{indexes.map(i => {
            const session = weekend.sessions[i];
            const weather = data.weather[session.key]?.summary.latest;
            const state = weekend.states[i];
            return <li key={session.key} data-state={state} data-focus={i === weekend.focus}>
              <div className={styles.session}><span className={styles.node} aria-hidden="true"/><div><h4>{shortSessionName(session.name)}</h4><time dateTime={session.confirmed ? session.start : undefined}>{session.confirmed ? local(session.start, zone, { hour: '2-digit', minute: '2-digit', hour12: false }) : '时间待确认'}{session.confirmed && session.end ? ` — ${local(session.end, zone, { hour: '2-digit', minute: '2-digit', hour12: false })}` : ''}</time></div><span className={styles.sessionStatus}>{state === 'live' ? 'LIVE' : state === 'scheduled' ? '按日程进行中' : state === 'completed' ? '已结束' : state === 'elapsed' ? '已到计划时间' : i === weekend.focus && session.confirmed ? '下一场' : '待开始'}</span></div>
              <div className={styles.weather}><span aria-hidden="true" className={styles.weatherMark}>{weather ? '◌' : '—'}</span><div>{weather ? <><strong>{weather.airTemperature} / {weather.trackTemperature}</strong><small>气温 / 赛道 · 实测</small><time dateTime={weather.date}>{local(weather.date, zone, { hour: '2-digit', minute: '2-digit' })}</time></> : <><strong>天气待更新</strong><small>暂无该赛段数据</small></>}</div></div>
            </li>;
          })}</ol>
        </section>)}
      </div>
      {!weekend.sessions.length && <p className={styles.notice}>完整赛段日程待公布。</p>}
      <p className={styles.timelineNote}>天气沿赛段展示实测记录；未来预报暂不可用。{weekend.state === 'active-session' ? ' 当前状态来自日程，尚无可靠实时信号。' : ''}</p>
    </section>
    <section className={styles.lower} aria-label="比赛周环境与分析">
      <section className={styles.track}><h2>赛道状态 <span>TRACK STATUS</span></h2><p className={styles.signal}>状态待确认</p><dl><div><dt>赛道温度</dt><dd>{selectedWeather?.trackTemperature ?? '—'}</dd></div><div><dt>气温</dt><dd>{selectedWeather?.airTemperature ?? '—'}</dd></div><div><dt>湿度</dt><dd>{selectedWeather?.humidity ?? '—'}</dd></div><div><dt>风速</dt><dd>{selectedWeather?.windSpeed ?? '—'}</dd></div></dl><small>{selectedWeather ? `所选赛段实测 · ${local(selectedWeather.date, zone, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : '暂无可用赛道观测'}</small></section>
      <section className={styles.tyres}><h2>轮胎配方 <span>TYRE COMPOUNDS</span></h2><div className={styles.tyreSet}>{['硬胎', '中性胎', '软胎'].map(label => <div key={label}><span className={styles.tyreRing} aria-hidden="true"/><strong>{label}</strong><small>待确认</small></div>)}</div><p>本站配方分配待公布</p></section>
      <section className={styles.intelligence}><h2>赛事研判 <span>RACE INTELLIGENCE</span></h2>{lastMessage ? <><h3>赛会最新记录</h3><p>{lastMessage.message}</p><small>历史记录 · {lastMessage.timestamp}</small></> : <><h3>等待可靠赛段信息</h3><p>暂无可发布的赛事研判。</p></>}<Link href="/race-control">查看赛会记录 ↗</Link></section>
      <section className={styles.context}><h2>赛道档案 <span>CIRCUIT CONTEXT</span></h2><p>{race.race.circuitName}</p><CircuitOutline outline={race.circuit?.outline} className={styles.circuit} title={`${race.race.circuitName} 赛道轮廓`} /><dl><div><dt>赛道长度</dt><dd>{race.circuit?.lengthKm ? `${race.circuit.lengthKm.toFixed(3)} km` : '待确认'}</dd></div><div><dt>正赛圈数</dt><dd>{race.circuit?.laps ?? '待确认'}</dd></div></dl></section>
    </section>
    <footer className={styles.footer}><span>LAPMETRY <b>—</b> RACE WEEK</span><form action="/race-weekend"><label htmlFor="weekend-event">比赛站</label><select id="weekend-event" name="event" defaultValue={race.eventId}>{races.map(r => <option key={r.eventId} value={r.eventId}>R{r.race.round} · {r.race.name}</option>)}</select><button type="submit">查看</button></form></footer>
  </main>;
}
