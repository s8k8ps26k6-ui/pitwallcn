import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

const require = createRequire(import.meta.url);
const root = new URL('../src/components/race-week/environment/', import.meta.url);
async function moduleFrom(name) {
  const text = fs.readFileSync(new URL(name, root), 'utf8');
  const js = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(`import React from '${pathToFileURL(require.resolve('react')).href}';\n${js}`).toString('base64')}`);
}
const { resolveVenue, deriveEnvironmentState, environmentTime } = await moduleFrom('environment-model.ts');
test('canonical venue registry isolates Suzuka and uses safe fallbacks', () => {
  assert.equal(resolveVenue('japan'), 'suzuka');
  assert.equal(resolveVenue('italy'), 'monza');
  assert.equal(resolveVenue('monaco'), 'monaco');
  assert.equal(resolveVenue('madrid'), 'urban-fallback');
  assert.equal(resolveVenue('singapore'), 'urban-fallback');
  for (const id of ['unknown', '', 'constructor', '__proto__']) assert.equal(resolveVenue(id), 'trackside-fallback');
});
test('venue modules render distinct geometry, without Suzuka landmark leakage', async () => {
  const renderSvg = element => renderToStaticMarkup(createElement('svg', null, element));
  const suzuka = renderSvg((await moduleFrom('suzuka.tsx')).SuzukaEnvironment());
  assert.match(suzuka, /translate\(571 220\)/);
  const monza = renderSvg((await moduleFrom('monza.tsx')).MonzaEnvironment());
  const monaco = renderSvg((await moduleFrom('monaco.tsx')).MonacoEnvironment());
  const fallback = (await moduleFrom('fallback.tsx')).FallbackEnvironment;
  const all = [monza, monaco, renderSvg(fallback({urban:true})), renderSvg(fallback({urban:false}))];
  assert.equal(new Set(all).size, 4);
  for (const svg of all) {
    assert.doesNotMatch(svg, /translate\(571 220\)|M908 221 1440 18|rw-stand-clip/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  }
  const base = fs.readFileSync(new URL('shared-base.tsx', root), 'utf8');
  assert.doesNotMatch(base, /rw-stand-clip|rw-seats|571 220|M908 221 1440 18/);
});
test('spatial families own camera geometry; shared base and state own no fixed road', async () => {
  const { spatialField } = await moduleFrom('spatial-family.ts');
  const families = ['suzuka', 'monza', 'monaco'].map(venue => spatialField(venue));
  assert.equal(new Set(families.map(field => field.family)).size, 3);
  assert.equal(new Set(families.map(field => JSON.stringify(field.haze))).size, 3);
  const base = fs.readFileSync(new URL('shared-base.tsx', root), 'utf8');
  const state = fs.readFileSync(new URL('state-layer.tsx', root), 'utf8');
  assert.doesNotMatch(base + state, /M0 392|M400 534|EnvironmentSurface|PermanentTrackField/);
  for (const name of ['monza.tsx', 'monaco.tsx']) {
    const source = fs.readFileSync(new URL(name, root), 'utf8');
    assert.doesNotMatch(source, /PermanentTrackField|M0 392|631 351/);
    assert.match(source, /data-spatial-field/);
    assert.match(source, /var\(--rw-reflection\)/);
  }
});
const input = { weekend:'active-session', reliableLive:false, nowIso:'2026-09-13T10:00:00Z', timeZone:'Europe/Rome' };
test('state lighting never promotes a schedule interval to LIVE', () => {
  assert.equal(deriveEnvironmentState(input).phase, 'scheduled');
  assert.equal(deriveEnvironmentState({...input,reliableLive:true}).phase, 'live');
  for (const [weekend, phase] of [['pre-event','pre-session'],['between-sessions','between-sessions'],['completed','completed'],['unconfirmed','unknown']]) {
    assert.equal(deriveEnvironmentState({...input,weekend}).phase, phase);
  }
});
test('only fresh positive rain evidence changes surface; stale/missing/false never imply dry', () => {
  assert.equal(deriveEnvironmentState({...input,observation:{date:'2026-09-13T09:55:00Z',rainfall:true}}).weather,'wet');
  for (const observation of [null,{date:'2026-03-27T09:55:00Z',rainfall:true},{date:'2026-09-13T10:01:00Z',rainfall:true},{date:'2026-09-13T09:55:00Z',rainfall:false}]) {
    assert.equal(deriveEnvironmentState({...input,observation}).weather,'unknown');
  }
  assert.equal(deriveEnvironmentState({...input,weekend:'completed',observation:{date:input.nowIso,rainfall:true}}).weather,'unknown');
});
test('time tint derives from venue-local clock, with neutral invalid fallback', () => {
  assert.equal(environmentTime('2026-09-13T10:00:00Z','Europe/Rome'),'day');
  assert.equal(environmentTime('2026-09-13T10:00:00Z','Asia/Tokyo'),'dusk');
  assert.equal(environmentTime('2026-09-13T13:00:00Z','Asia/Tokyo'),'night');
  assert.equal(environmentTime('2026-09-13T08:00:00Z','Asia/Tokyo'),'late-afternoon');
  assert.equal(environmentTime('invalid','Asia/Tokyo'),'unknown');
  assert.equal(environmentTime(input.nowIso,'Not/A_Zone'),'unknown');
});
