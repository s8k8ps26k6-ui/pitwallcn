import type { GrandPrixSession } from './events-2026';

/** Scheduled times are not evidence of an active or completed Session. */
export function getHomepageSessionSummary(sessions: readonly GrandPrixSession[], nowMs: number) {
  const confirmed = sessions
    .map((session,index) => ({session,index,start:Date.parse(session.startTime)}))
    .filter(item => item.session.isTimeConfirmed === true && Number.isFinite(item.start))
    .sort((a,b) => a.start-b.start);
  return {
    confirmedCount: confirmed.length,
    next: confirmed.find(item => item.start >= nowMs) ?? null,
    elapsedCount: confirmed.filter(item => item.start < nowMs).length,
  };
}
