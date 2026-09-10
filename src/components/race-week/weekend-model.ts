export type WeekendSession = {
  key: string;
  name: string;
  start: string;
  end?: string;
  confirmed: boolean;
  sessionKey?: number;
};
export type SessionState = 'upcoming' | 'scheduled' | 'elapsed' | 'completed' | 'live';
export type WeekendState = 'pre-event' | 'active-session' | 'between-sessions' | 'completed' | 'unconfirmed';

/** Calendar intervals describe scheduled activity, never establish a live feed. */
export function deriveWeekend(sessions: WeekendSession[], nowIso: string, liveSessionKey?: number, eventDateElapsed = false) {
  const now = Date.parse(nowIso);
  const ordered = [...sessions].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const states: SessionState[] = ordered.map(session => {
    if (!session.confirmed || !Number.isFinite(Date.parse(session.start))) return 'upcoming';
    if (session.end && Date.parse(session.end) <= now) return 'completed';
    if (Date.parse(session.start) > now) return 'upcoming';
    if (liveSessionKey !== undefined && session.sessionKey === liveSessionKey) return 'live';
    return session.end && Date.parse(session.end) > now ? 'scheduled' : 'elapsed';
  });
  const active = states.findIndex(state => state === 'live' || state === 'scheduled');
  const next = ordered.findIndex((session, i) => session.confirmed && states[i] === 'upcoming');
  const allComplete = states.length > 0 && states.every(state => state === 'completed');
  const anyStarted = states.some(state => state !== 'upcoming');
  const state: WeekendState = allComplete || eventDateElapsed ? 'completed' : active >= 0 ? 'active-session' : !ordered.some(s => s.confirmed) ? 'unconfirmed' : !anyStarted ? 'pre-event' : 'between-sessions';
  const focus = active >= 0 ? active : next >= 0 ? next : allComplete ? Math.max(0, ordered.length - 1) : eventDateElapsed ? -1 : 0;
  return { sessions: ordered, states, state, focus };
}

export function shortSessionName(name: string) {
  const labels: Record<string, string> = {
    'practice 1': 'FP1', 'practice 2': 'FP2', 'practice 3': 'FP3',
    '第一次自由练习赛': 'FP1', '第二次自由练习赛': 'FP2', '第三次自由练习赛': 'FP3',
    qualifying: 'Qualifying', '排位赛': 'Qualifying', race: 'Race', '正赛': 'Race',
    sprint: 'Sprint', '冲刺赛': 'Sprint', 'sprint qualifying': 'Sprint Qualifying', '冲刺排位赛': 'Sprint Qualifying',
  };
  return labels[name.toLowerCase()] ?? name;
}
