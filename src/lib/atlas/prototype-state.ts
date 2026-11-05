import type { GrandPrixSession } from './events-2026.ts';

export type SheetStop = 'collapsed' | 'expanded';
export const SHEET_STOPS: readonly SheetStop[] = ['collapsed', 'expanded'];
/** Position and range are CSS pixels; velocity is the recent release velocity in px/ms. */
export function snapSheet(start: SheetStop, position: number, velocity: number, range: number): SheetStop {
  if (range <= 0) return start;
  if (velocity >= 0.45) return 'collapsed';
  if (velocity <= -0.45) return 'expanded';
  const fraction = Math.max(0, Math.min(1, position / range));
  return start === 'collapsed'
    ? fraction < 0.7 ? 'expanded' : 'collapsed'
    : fraction > 0.3 ? 'collapsed' : 'expanded';
}
/** Start times are schedule facts, never evidence that a session is live or complete. */
export function sessionScheduleState(session: GrandPrixSession, nowMs: number) {
  const start = Date.parse(session.startTime);
  if (!session.isTimeConfirmed || !Number.isFinite(start)) return 'unconfirmed';
  return start > nowMs ? 'upcoming' : 'elapsed';
}
