import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript') as typeof import('typescript');
const output = ts.transpileModule(fs.readFileSync('src/lib/atlas/prototype-state.ts', 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const compiled = {exports:{}};
new Function('exports', 'module', output)(compiled.exports, compiled);
const {snapSheet, sessionScheduleState} = compiled.exports as typeof import('./prototype-state');
test('sheet snaps one stop and clamps endpoints, with tap tolerance', () => {
  assert.equal(snapSheet('collapsed', -80, -0.4), 'partial');
  assert.equal(snapSheet('partial', -100, -0.5), 'full');
  assert.equal(snapSheet('full', 80, 0.5), 'partial');
  assert.equal(snapSheet('collapsed', 80, 0.5), 'collapsed');
  assert.equal(snapSheet('full', -100, -0.5), 'full');
  assert.equal(snapSheet('partial', 5, 0.01), 'partial');
});
test('schedule does not infer actual session status', () => {
  assert.equal(sessionScheduleState({name:'Race', startTime:'2026-11-01T12:00Z', isTimeConfirmed:true}, Date.parse('2026-11-01T13:00Z')), 'elapsed');
  assert.equal(sessionScheduleState({name:'Race', startTime:'bad', isTimeConfirmed:true}, 0), 'unconfirmed');
  assert.equal(sessionScheduleState({name:'Race', startTime:'2026-11-01T12:00Z'}, 0), 'unconfirmed');
});
