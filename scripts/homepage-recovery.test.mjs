import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
const modules = new Map();

// Run the actual TS/TSX and React output without a browser or new dependency.
// Only Next's navigation wrappers and CSS module names need test substitutes.
function load(relativePath) {
  const filename = path.resolve(root, relativePath);
  if (filename.endsWith(".json")) return JSON.parse(fs.readFileSync(filename, "utf8"));
  if (modules.has(filename)) return modules.get(filename).exports;
  const compiled = { exports: {} };
  modules.set(filename, compiled);
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const resolve = (id) => {
    if (id === "next/link") return function TestLink({ children, ...props }) { return createElement("a", props, children); };
    if (id === "@/components/home-brand-link") {
      return { HomeBrandLink: ({ children, ariaLabel, ...props }) => createElement("a", { ...props, href: "/", "aria-label": ariaLabel }, children) };
    }
    if (id.endsWith(".module.css")) return new Proxy({}, { get: (_, name) => name === "__esModule" ? false : name });
    if (id.startsWith("@/") || id.startsWith(".")) {
      const target = id.startsWith("@/")
        ? path.join(root, "src", id.slice(2))
        : path.resolve(path.dirname(filename), id);
      const resolved = [target, `${target}.ts`, `${target}.tsx`].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (resolved) return load(resolved);
    }
    return require(id);
  };
  new Function("exports", "module", "require", output)(compiled.exports, compiled, resolve);
  return compiled.exports;
}

const { getSeasonRaces } = load("src/lib/atlas/race-detail.ts");
const { fitCircuit, getCircuitAspect, canonicalCircuit } = load("src/components/homepage-v3/circuit-geometry.ts");
const { CircuitField } = load("src/components/homepage-v3/circuit-field.tsx");
const { HomeCountryFlag } = load("src/components/homepage-v3/home-country-flag.tsx");
const { HomepageV3 } = load("src/components/homepage-v3/homepage-v3.tsx");
const races = getSeasonRaces(new Date("2026-09-09T12:00:00Z"));
const events = ["madrid", "italy", "japan", "monaco", "great-britain"];

for (const key of events) {
  const race = races.find(item => item.race.id === key);
  test(`${key}: all geometry and visual padding contained, uniform scale`, () => {
    assert.ok(race?.circuit?.outline.length);
    assert.ok(getCircuitAspect(key) > 0);
    for (const [width, height] of [[284,280],[327,330],[342,354],[366,376],[260,240],[270,250],[940,414]]) {
      const fit = fitCircuit(race.circuit.outline, width, height, getCircuitAspect(key));
      assert.ok(fit);
      assert.equal(fit.points.length, race.circuit.outline.length);
      const v = fit.visualBounds;
      const epsilon = 1e-8;
      assert.ok(v.x >= -epsilon && v.y >= -epsilon);
      assert.ok(v.x + v.width <= width + epsilon);
      assert.ok(v.y + v.height <= height + epsilon);
      for (let i = 1; i < fit.points.length; i++) {
        const a = race.circuit.outline[i-1], b = race.circuit.outline[i];
        const before = Math.hypot((b[0]-a[0]) * getCircuitAspect(key), b[1]-a[1]);
        const after = Math.hypot(fit.points[i][0]-fit.points[i-1][0],fit.points[i][1]-fit.points[i-1][1]);
        assert.ok(Math.abs(after - before * fit.scale) < epsilon);
      }
    }
  });
  test(`${key}: dynamic identity, one circuit SVG, adjacent rounds and header`, () => {
    const index = races.indexOf(race);
    const rail = races.slice(Math.max(0,index-1),index+2);
    const html = renderToStaticMarkup(createElement(HomepageV3,{race,phase:"next",raceRail:rail,seasonCount:races.length}));
    for (const item of rail) assert.ok(html.includes(`R${item.race.round}`));
    for (const text of ["LAPMETRY","赛历","Atlas",race.race.city,"Grand Prix"]) assert.ok(html.includes(text));
    assert.equal((html.match(/data-home-field/g)??[]).length,1);
    assert.ok(!html.includes('preserveAspectRatio="none"'));
    assert.ok(!html.includes("desktopField"));
  });
}
test("degenerate, nonfinite, missing or undersized geometry fails safely", () => {
  for (const outline of [undefined,[],[[0,0]],[[0,0],[0,1],[0,2]],[[NaN,0],[1,0],[1,1]]]) assert.equal(fitCircuit(outline,300,400),null);
  assert.equal(fitCircuit([[0,0],[1,0],[1,1]],20,20),null);
  assert.equal(fitCircuit([[0,0],[1,0],[1,1]],Infinity,400),null);
  assert.equal(getCircuitAspect("unknown"),undefined);
  const html = renderToStaticMarkup(createElement(CircuitField,{title:"Unknown"}));
  assert.ok(html.includes("赛道轮廓待确认"));
  assert.ok(!html.includes("<svg"));
});
test("Italy keeps a stable accessible SVG flag", () => {
  const html = renderToStaticMarkup(createElement(HomeCountryFlag,{country:"Italy"}));
  assert.match(html, /<svg/);
  assert.match(html, /aria-label="Italy"/);
  assert.ok(!html.includes("🇮🇹"));
});
test("production selection remains unpinned", () => {
  const source = fs.readFileSync(path.join(root,"src/app/page.tsx"),"utf8");
  assert.match(source,/getCurrentSeasonRace\(\)/);
  assert.match(source,/getSeasonRaces\(\)/);
  assert.ok(!source.includes("fixture"));
});

test("all current countries use SVG; unknown country never emits emoji", () => {
  for (const country of new Set(races.map(r => r.race.country))) {
    const html = renderToStaticMarkup(createElement(HomeCountryFlag,{country}));
    assert.match(html,/<svg/);
    assert.ok(!/[\u{1F1E6}-\u{1F1FF}]/u.test(html));
  }
  const html = renderToStaticMarkup(createElement(HomeCountryFlag,{country:"Unknown"}));
  assert.ok(html.includes("UN"));
  assert.ok(!/[\u{1F1E6}-\u{1F1FF}]/u.test(html));
});

test("missing or invalid metrics never create dash-unit pairs; valid data survives", () => {
  const base = races.find(r => r.race.id === "italy");
  for (const [lengthKm,laps] of [[undefined,undefined],[5.793,undefined],[undefined,53],[NaN,0],[Infinity,-1],[5.793,53]]) {
    const race = {...base,circuit:{...base.circuit,lengthKm,laps}};
    const html = renderToStaticMarkup(createElement(HomepageV3,{race,phase:"next",raceRail:[race],seasonCount:races.length}));
    assert.ok(!/<strong>—<\/strong>/.test(html));
    assert.equal(html.includes("赛道参数待确认"),!(lengthKm===5.793&&laps===53));
    if(lengthKm===5.793) assert.ok(html.includes("5.793"));
    if(laps===53) assert.ok(html.includes("53"));
  }
});

for (const key of events) {
  test(`${key}: canonical ordered geometry and aspect invariant across viewports`, () => {
    const outline = races.find(r => r.race.id === key).circuit.outline;
    const aspect = getCircuitAspect(key);
    const canonical = canonicalCircuit(outline, aspect);
    const source = canonical.bounds;
    for (const [width, height] of [[342,354.48],[288,250],[940,414]]) {
      const fit = fitCircuit(outline,width,height,aspect);
      const scaleX = fit.bounds.width / source.width;
      const scaleY = fit.bounds.height / source.height;
      assert.ok(Math.abs(scaleX-scaleY)<1e-8);
      assert.ok(Math.abs(fit.bounds.width/fit.bounds.height-source.width/source.height)<1e-8);
      assert.equal(fit.points.length,canonical.points.length);
      fit.points.forEach((point,index) => {
        // Recover ordered canonical vertices with one scale, rejecting rotation,
        // reflection, reordered topology, and viewport-specific deformation.
        for (const axis of [0,1]) assert.ok(Math.abs((point[axis]-fit.offset[axis])/fit.scale-canonical.points[index][axis])<1e-8);
      });
    }
  });
}
