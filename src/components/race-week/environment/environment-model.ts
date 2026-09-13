import type { WeekendState } from '../weekend-model';

export type VenueModule = 'suzuka' | 'monza' | 'monaco' | 'urban-fallback' | 'trackside-fallback';
export type EnvironmentPhase = 'pre-session' | 'live' | 'between-sessions' | 'completed' | 'scheduled' | 'unknown';
export type EnvironmentTime = 'day' | 'late-afternoon' | 'dusk' | 'night' | 'unknown';
export type EnvironmentWeather = 'dry' | 'cloudy' | 'wet' | 'unknown';

/** Keys are the existing canonical circuit IDs, not event titles or round numbers. */
const venues: Readonly<Record<string, VenueModule>> = {
  japan: 'suzuka', italy: 'monza', monaco: 'monaco',
  madrid: 'urban-fallback', singapore: 'urban-fallback',
  azerbaijan: 'urban-fallback', 'las-vegas': 'urban-fallback',
};
export function resolveVenue(circuitId: string): VenueModule {
  return Object.hasOwn(venues, circuitId) ? venues[circuitId] : 'trackside-fallback';
}

export type EnvironmentState = {
  phase: EnvironmentPhase;
  time: EnvironmentTime;
  weather: EnvironmentWeather;
};

/** Clock-based art direction, not a solar-position model or a weather forecast. */
export function environmentTime(nowIso: string, timeZone?: string): EnvironmentTime {
  if (!timeZone || !Number.isFinite(Date.parse(nowIso))) return 'unknown';
  try {
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', hourCycle: 'h23' }).format(new Date(nowIso)));
    return hour >= 7 && hour < 16 ? 'day' : hour >= 16 && hour < 18 ? 'late-afternoon' : hour >= 18 && hour < 20 ? 'dusk' : 'night';
  } catch { return 'unknown'; }
}

export function deriveEnvironmentState(input: {
  weekend: WeekendState;
  reliableLive: boolean;
  nowIso: string;
  timeZone?: string;
  observation?: { date: string; rainfall: boolean } | null;
}): EnvironmentState {
  const phase: EnvironmentPhase = input.weekend === 'completed' ? 'completed'
    : input.weekend === 'active-session' ? input.reliableLive ? 'live' : 'scheduled'
    : input.weekend === 'pre-event' ? 'pre-session'
    : input.weekend === 'between-sessions' ? 'between-sessions' : 'unknown';
  const age = Date.parse(input.nowIso) - Date.parse(input.observation?.date ?? '');
  // Existing weather normalization maps missing rainfall to false. False cannot prove dry.
  // Never paint historical/future samples as present conditions; never infer track flags.
  const wet = phase !== 'completed' && age >= 0 && age <= 15 * 60_000 && input.observation?.rainfall === true;
  return { phase, time: environmentTime(input.nowIso, input.timeZone), weather: wet ? 'wet' : 'unknown' };
}
