import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript') as typeof import('typescript');
const output = ts.transpileModule(fs.readFileSync('src/lib/atlas/homepage-state.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const compiled = {exports:{}};
new Function('exports','module',output)(compiled.exports,compiled);
const {getHomepageSessionSummary} = compiled.exports as typeof import('./homepage-state');

test('homepage does not use unconfirmed placeholders or invalid times as countdown facts',()=>{
  const summary = getHomepageSessionSummary([
    {name:'Race',startTime:'2026-11-08T17:00Z',isTimeConfirmed:false},
    {name:'Practice',startTime:'invalid',isTimeConfirmed:true},
  ],Date.parse('2026-11-06T00:00Z'));
  assert.equal(summary.next,null);
  assert.equal(summary.confirmedCount,0);
});
test('homepage chooses the earliest future confirmed session, preserving its source index',()=>{
  const summary = getHomepageSessionSummary([
    {name:'Race',startTime:'2026-11-08T17:00Z',isTimeConfirmed:true},
    {name:'Practice',startTime:'2026-11-06T17:00Z',isTimeConfirmed:true},
    {name:'Qualifying',startTime:'2026-11-07T17:00Z',isTimeConfirmed:true},
  ],Date.parse('2026-11-07T00:00Z'));
  assert.equal(summary.next?.session.name,'Qualifying');
  assert.equal(summary.next?.index,2);
  assert.equal(summary.elapsedCount,1);
});
test('elapsed schedule never creates a live/completed race status',()=>{
  const summary = getHomepageSessionSummary([{name:'Race',startTime:'2026-11-08T17:00Z',isTimeConfirmed:true}],Date.parse('2026-11-09T00:00Z'));
  assert.equal(summary.next,null);
  assert.equal(summary.elapsedCount,1);
  assert.equal('live' in summary,false);
});
