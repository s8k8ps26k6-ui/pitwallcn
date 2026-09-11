import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../src/components/race-week/weekend-model.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { deriveWeekend, shortSessionName, matchingMeeting } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const session = (name, hour, extra = {}) => ({ name, key: name, start: `2026-03-27T${hour}:00:00Z`, end: `2026-03-27T${Number(hour)+1}:00:00Z`, confirmed: true, ...extra });
const sessions = [session('Practice 1', '10', { sessionKey: 1 }), session('Practice 2', '14', { sessionKey: 2 })];
test('pre-event focuses first confirmed session', () => {
  const model = deriveWeekend(sessions, '2026-03-26T00:00:00Z');
  assert.equal(model.state, 'pre-event'); assert.equal(model.focus, 0);
});
test('schedule interval is not LIVE without a reliable signal', () => {
  const model = deriveWeekend(sessions, '2026-03-27T14:30:00Z');
  assert.equal(model.state, 'active-session'); assert.deepEqual(model.states, ['completed','scheduled']); assert.equal(model.focus, 1);
});
test('only correctly associated reliable signal can mark LIVE', () => {
  assert.equal(deriveWeekend(sessions,'2026-03-27T14:30:00Z',2).states[1], 'live');
  assert.equal(deriveWeekend(sessions,'2026-03-27T14:30:00Z',55).states[1], 'scheduled');
  assert.equal(deriveWeekend(sessions,'2026-03-27T16:00:00Z',2).states[1], 'completed');
});
test('between sessions focuses upcoming session', () => {
  const model = deriveWeekend(sessions, '2026-03-27T12:00:00Z');
  assert.equal(model.state, 'between-sessions'); assert.equal(model.focus,1);
});
test('completed weekend has no fabricated upcoming session', () => {
  const model = deriveWeekend(sessions, '2026-03-28T00:00:00Z');
  assert.equal(model.state, 'completed'); assert.ok(model.states.every(s=>s==='completed'));
});
test('unconfirmed schedule never fabricates a completed session or LIVE', () => {
  const rows = sessions.map(s=>({...s,confirmed:false}));
  const model = deriveWeekend(rows,'2026-03-27T14:30:00Z',2);
  assert.equal(model.state,'unconfirmed'); assert.ok(model.states.every(s=>s==='upcoming'));
  const archived = deriveWeekend(rows,'2026-09-11T00:00:00Z',undefined,true);
  assert.equal(archived.state,'completed'); assert.equal(archived.focus,-1); assert.ok(archived.states.every(s=>s==='upcoming'));
});
test('missing end never infers completion', () => {
  assert.equal(deriveWeekend([session('Race','14',{end:undefined})],'2026-03-27T18:00:00Z').states[0],'elapsed');
});
test('sprint schedule uses source names and arbitrary counts, not ordinal names', () => {
  const names=['Practice 1','Sprint Qualifying','Sprint','Qualifying','Race'];
  assert.deepEqual(names.map(shortSessionName), ['FP1','Sprint Qualifying','Sprint','Qualifying','Race']);
  assert.equal(deriveWeekend([session('Sprint','10'),session('Race','14')],'2026-03-27T12:00:00Z').sessions.length,2);
});
test('sort unsorted sessions; empty schedule stays unconfirmed', () => {
  assert.equal(deriveWeekend([...sessions].reverse(),'2026-03-26T00:00:00Z').sessions[0].name,'Practice 1');
  assert.equal(deriveWeekend([],'2026-03-26T00:00:00Z').state,'unconfirmed');
});

test('event matching requires country AND dates and rejects ambiguity', () => {
  const barcelona = { country_name: 'Spain', date_start: '2026-06-12T00:00:00Z', meeting_key: 1 };
  const madrid = { country_name: 'Spain', date_start: '2026-09-11T00:00:00Z', meeting_key: 2 };
  const italy = { country_name: 'Italy', date_start: '2026-09-11T00:00:00Z', meeting_key: 3 };
  assert.equal(matchingMeeting([barcelona,madrid,italy], 'Spain','2026-09-11')?.meeting_key,2);
  assert.equal(matchingMeeting([italy], 'Spain','2026-09-11'),undefined);
  assert.equal(matchingMeeting([madrid,{...madrid,meeting_key:4}], 'Spain','2026-09-11'),undefined);
});
