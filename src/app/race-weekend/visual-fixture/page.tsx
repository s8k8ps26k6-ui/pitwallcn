import { notFound } from 'next/navigation';
import { RaceWeekView } from '@/components/race-week/race-week-view';
import { deriveWeekend } from '@/components/race-week/weekend-model';
import { loadWeekend, type WeekendData } from '@/components/race-week/weekend-data';
import { getSeasonRaces } from '@/lib/atlas/race-detail';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Race Week · Visual test fixture', robots: { index: false, follow: false } };

/** Development-only visual fixture. No production selector, clock or feed is overridden. */
export default async function RaceWeekVisualFixture({ searchParams }: { searchParams: Promise<{ state?: string; width?: string }> }) {
  const params = await searchParams;
  const width = params.width === '390' ? 390 : params.width === '1440' ? 1440 : undefined;
  if (process.env.NODE_ENV !== 'development') notFound();
  const races = getSeasonRaces(new Date('2026-09-11T00:00:00Z'));
  const race = races.find(event => event.circuitId === 'japan');
  if (!race) notFound();
  const sessions = race.sessions.map((session, index) => {
    const start = new Date(session.startTime);
    start.setUTCHours(index % 2 === 0 ? 2 : 6, 0, 0, 0);
    return { key: `fixture-${index}`, name: session.name, start: start.toISOString(), end: new Date(start.getTime() + 3600000).toISOString(), confirmed: true };
  });
  const nowIso = new Date(Date.parse(sessions[1].start) + 15 * 60000).toISOString();
  const weekend = deriveWeekend(sessions, nowIso);
  // Explicit fixture signal: never read by loadWeekend or the production page.
  weekend.states[1] = 'live';
  weekend.state = 'active-session';
  weekend.focus = 1;
  const data: WeekendData = { weekend, eventDateElapsed: false, scheduleSource: 'calendar', selectedKey: sessions[1].key, weather: {}, control: null, nowIso };
  const completed = params.state === 'completed';
  const renderedData = completed ? await loadWeekend(race, new Date().toISOString()) : data;
  return <><aside style={{ background: '#391117', color: '#fff', padding: '8px 20px', fontSize: 12 }}>{completed ? '布局验收 · 真实日本站数据 · 受限容器宽度' : '视觉测试 FIXTURE · LIVE 状态与时间为测试输入 · 非实时赛事数据'}</aside><div style={{ width }} data-visual-qa-width={width}><RaceWeekView race={race} races={races} data={renderedData} /></div></>;
}
