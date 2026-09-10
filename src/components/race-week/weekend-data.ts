import 'server-only';
import type { UnifiedRace } from '@/lib/atlas/race-detail';
import { fetchOpenF1 } from '@/lib/openf1-client';
import { getWeatherBySession } from '@/lib/weather-service';
import { getRaceControlFeedBySession } from '@/lib/race-control-service';
import { deriveWeekend, type WeekendSession } from './weekend-model';

type Meeting = { meeting_key: number; country_name: string; date_start: string; meeting_name: string; location: string };
type ApiSession = { session_key: number; session_name: string; date_start: string; date_end?: string };
export type WeekendData = Awaited<ReturnType<typeof loadWeekend>>;

export async function loadWeekend(race: UnifiedRace, nowIso: string, requestedKey?: number) {
  let sessions: WeekendSession[] = race.sessions.map((s, i) => ({ key: `calendar-${i}`, name: s.name, start: s.startTime, confirmed: !!s.isTimeConfirmed }));
  let scheduleSource: 'calendar' | 'openf1' = 'calendar';
  try {
    const meetings = await fetchOpenF1<Meeting[]>('/meetings', { year: race.season });
    // Require both country and weekend proximity: Spain has two distinct events.
    const matches = meetings.filter(m => m.country_name.toLowerCase() === race.race.country.toLowerCase() && Math.abs(Date.parse(m.date_start) - Date.parse(race.race.startDate)) < 3 * 86400000);
    if (matches.length === 1) {
      const rows = await fetchOpenF1<ApiSession[]>('/sessions', { meeting_key: matches[0].meeting_key });
      const verified = rows.filter(s => Number.isSafeInteger(s.session_key) && s.session_name && Number.isFinite(Date.parse(s.date_start))).map(s => ({ key: String(s.session_key), sessionKey: s.session_key, name: s.session_name, start: s.date_start, end: s.date_end && Date.parse(s.date_end) > Date.parse(s.date_start) ? s.date_end : undefined, confirmed: true }));
      if (verified.length) { sessions = verified; scheduleSource = 'openf1'; }
    }
  } catch { /* Preserve the calendar's confirmation flags and missing-time states. */ }
  const localToday = new Intl.DateTimeFormat('en-CA', { timeZone: race.circuit?.timeZone ?? 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(nowIso));
  const eventDateElapsed = localToday > race.race.endDate;
  const weekend = deriveWeekend(sessions, nowIso, undefined, eventDateElapsed);
  const selected = weekend.sessions.find(s => s.sessionKey === requestedKey) ?? weekend.sessions[weekend.focus] ?? weekend.sessions.at(-1);
  const weatherEntries = await Promise.all(weekend.sessions.map(async session => {
    if (!session.sessionKey || Date.parse(session.start) > Date.parse(nowIso)) return null;
    const weather = await getWeatherBySession(session.sessionKey);
    return weather.source === 'openf1' && weather.summary.latest ? [session.key, weather] as const : null;
  }));
  const weather = Object.fromEntries(weatherEntries.filter(entry => entry !== null));
  const control = selected?.sessionKey && Date.parse(selected.start) <= Date.parse(nowIso) ? await getRaceControlFeedBySession(selected.sessionKey) : null;
  return { weekend, eventDateElapsed, scheduleSource, selectedKey: selected?.key, weather, control, nowIso };
}
