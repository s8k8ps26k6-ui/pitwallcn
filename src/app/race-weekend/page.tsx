import type { Metadata } from 'next';
import { RaceWeekView } from '@/components/race-week/race-week-view';
import { loadWeekend } from '@/components/race-week/weekend-data';
import { getCurrentSeasonRace, getSeasonRaces } from '@/lib/atlas/race-detail';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = { title: '比赛周 · Race Week', description: 'LAPMETRY 比赛周进程、赛段状态与赛道环境。' };
export default async function RaceWeekendPage({ searchParams }: { searchParams: Promise<{ event?: string; session?: string }> }) {
  const now = new Date();
  const params = await searchParams;
  const races = getSeasonRaces(now);
  const requested = races.find(r => r.eventId === params.event || r.race.id === params.event);
  const race = requested ?? getCurrentSeasonRace(now).race;
  const sessionKey = params.session && /^\d+$/.test(params.session) ? Number(params.session) : undefined;
  const data = await loadWeekend(race, now.toISOString(), sessionKey);
  return <RaceWeekView race={race} races={races} data={data} invalidEvent={!!params.event && !requested} />;
}
