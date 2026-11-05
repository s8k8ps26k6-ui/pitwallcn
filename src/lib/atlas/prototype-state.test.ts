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
test('small slow movements retain the start; distance opens/closes only at two endpoints', () => {
  assert.equal(snapSheet('collapsed', 580, 0.01, 600), 'collapsed');
  assert.equal(snapSheet('expanded', 20, 0.01, 600), 'expanded');
  assert.equal(snapSheet('collapsed', 350, 0, 600), 'expanded');
  assert.equal(snapSheet('expanded', 250, 0, 600), 'collapsed');
  assert.equal(snapSheet('expanded', 0, 0, 0), 'expanded');
});
test('recent release velocity can override distance, including a reversed fling', () => {
  assert.equal(snapSheet('collapsed', 550, -0.8, 600), 'expanded');
  assert.equal(snapSheet('expanded', 40, 0.8, 600), 'collapsed');
  assert.equal(snapSheet('collapsed', 200, 0.6, 600), 'collapsed');
});
test('out-of-range movement never creates a third stop', () => {
  for (const start of ['collapsed', 'expanded'] as const) {
    for (let position = -400; position < 1000; position += 17) {
      assert.ok(['collapsed', 'expanded'].includes(snapSheet(start, position, 0, 600)));
    }
  }
});
test('schedule does not infer actual session status', () => {
  assert.equal(sessionScheduleState({name:'Race', startTime:'2026-11-01T12:00Z', isTimeConfirmed:true}, Date.parse('2026-11-01T13:00Z')), 'elapsed');
  assert.equal(sessionScheduleState({name:'Race', startTime:'bad', isTimeConfirmed:true}, 0), 'unconfirmed');
  assert.equal(sessionScheduleState({name:'Race', startTime:'2026-11-01T12:00Z'}, 0), 'unconfirmed');
});
