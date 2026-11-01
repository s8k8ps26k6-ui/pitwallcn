import type { GrandPrixSession } from './events-2026.ts';

export type SheetStop = 'collapsed' | 'partial' | 'full';
export const SHEET_STOPS: readonly SheetStop[] = ['collapsed', 'partial', 'full'];
export function snapSheet(start: SheetStop, deltaY: number, velocity: number): SheetStop {
  const index = SHEET_STOPS.indexOf(start);
  if (Math.abs(deltaY) < 32 && Math.abs(velocity) < 0.35) return start;
  return SHEET_STOPS[Math.max(0, Math.min(2, index + (deltaY < 0 ? 1 : -1)))];
}
/** Start times are schedule facts, never evidence that a session is live or complete. */
export function sessionScheduleState(session: GrandPrixSession, nowMs: number) {
  const start = Date.parse(session.startTime);
  if (!session.isTimeConfirmed || !Number.isFinite(start)) return 'unconfirmed';
  return start > nowMs ? 'upcoming' : 'elapsed';
}
