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
const { projectCircuit, CircuitField } = load("src/components/homepage-v3/circuit-field.tsx");
const { HomeCountryFlag } = load("src/components/homepage-v3/home-country-flag.tsx");
const { HomepageV3 } = load("src/components/homepage-v3/homepage-v3.tsx");
const races = getSeasonRaces(new Date("2026-09-06T12:00:00Z"));
const monza = races.find(race => race.race.id === "italy");
assert.ok(monza?.circuit?.outline.length);

test("Italy uses three SVG stripes, an accessible name and no emoji glyph", () => {
  const html = renderToStaticMarkup(createElement(HomeCountryFlag, { country: "Italy" }));
  assert.match(html, /<svg/);
  assert.match(html, /aria-label="Italy"/);
  assert.match(html, /viewBox="0 0 3 2"/);
  assert.equal((html.match(/<path /g) ?? []).length, 3);
  for (const fill of ["#009246", "#fff", "#ce2b37"]) assert.ok(html.includes(`fill="${fill}"`));
  assert.ok(!html.includes("🇮🇹"));
});

test("other countries retain their existing flag behavior", () => {
  const html = renderToStaticMarkup(createElement(HomeCountryFlag, { country: "Spain" }));
  assert.match(html, /aria-label="Spain"/);
  assert.ok(html.includes("🇪🇸"));
  assert.ok(!html.includes("<svg"));
});

for (const [mode, desktop, landscape, box, viewport] of [
  ["portrait", false, false, [38, 255, 306, 309], [390, 844]],
  ["desktop", true, false, [270, 242, 856, 364], [1440, 900]],
  ["landscape", false, true, [242, 72, 286, 208], [844, 390]],
]) {
  test(`${mode} retains every Monza point inside the scene with stroke clearance`, () => {
    const points = projectCircuit(monza.circuit.outline, desktop, landscape);
    assert.equal(points.length, monza.circuit.outline.length);
    assert.ok(points.every(point => point.every(Number.isFinite)));
    const [x, y, width, height] = box;
    assert.ok(points.every(([px, py]) => px >= x && px <= x + width && py >= y && py <= y + height));
    // Broadest shadow/stroke plus lower extrusion stays inside the SVG viewport.
    assert.ok(x >= 30 && y >= 30);
    assert.ok(x + width + 30 < viewport[0]);
    assert.ok(y + height + 40 < viewport[1]);
    const html = renderToStaticMarkup(createElement(CircuitField, { outline: monza.circuit.outline, desktop, landscape, title: "Monza" }));
    assert.ok(html.includes(`viewBox="0 0 ${viewport.join(" ")}"`));
    assert.ok(html.includes(" Z\""));
  });
}

test("homepage still renders Monza facts, original routes and R12 → R13 → R14", () => {
  const html = renderToStaticMarkup(createElement(HomepageV3, {
    race: monza,
    phase: "current",
    raceRail: races.filter(race => [12, 13, 14].includes(race.race.round)),
    seasonCount: races.length,
  }));
  for (const text of ["Italian", "Grand Prix", "5.793", "53", "Race Weekend", "Monza", "R12", "R13", "R14", "赛季延续"]) assert.ok(html.includes(text), text);
  for (const href of ["/schedule", "/atlas-v2", "/races/2026/italy-gp-2026"]) assert.ok(html.includes(`href="${href}"`));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, "SVG gradients/filters must not share IDs");
});

test("missing geometry has layout-specific wrappers rather than three overlapping labels", () => {
  for (const [desktop, landscape, expected] of [[false, false, "mobileField"], [true, false, "desktopField"], [false, true, "landscapeField"]]) {
    const html = renderToStaticMarkup(createElement(CircuitField, { desktop, landscape, title: "Unknown" }));
    assert.ok(html.includes(`class="${expected}"`));
    assert.ok(html.includes("赛道轮廓待确认"));
    assert.ok(!html.includes("<svg"));
  }
});

test("production homepage selection is not pinned to the screenshot date", () => {
  const source = fs.readFileSync(path.join(root, "src/app/page.tsx"), "utf8");
  assert.match(source, /getCurrentSeasonRace\(\)/);
  assert.match(source, /getSeasonRaces\(\)/);
  assert.ok(!source.includes("fixtureNow"));
});
