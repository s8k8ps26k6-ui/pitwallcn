import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript") as typeof import("typescript");

const source = fs.readFileSync("src/lib/atlas/season-2026.ts", "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
  fileName: "src/lib/atlas/season-2026.ts",
}).outputText;
const compiledModule = { exports: {} as Record<string, unknown> };
new Function("exports", "module", "require", output)(
  compiledModule.exports,
  compiledModule,
  require,
);
const season = compiledModule.exports as typeof import("./season-2026");

test("2026 Atlas calendar keeps all 22 races and nine European races", () => {
  const races = season.getSeason2026(new Date("2026-08-01T00:00:00.000Z"));
  assert.equal(races.length, 22);
  assert.equal(season.EUROPE_2026_RACES.length, 9);
  assert.equal(new Set(races.map((race) => race.id)).size, 22);
});

test("selection follows the active Belgium weekend and then the next race", () => {
  const duringBelgium = season.getSeasonRaceSelection2026(
    new Date("2026-07-18T12:00:00.000Z"),
  );
  assert.equal(duringBelgium.phase, "current");
  assert.equal(duringBelgium.race.id, "belgium");

  const afterBelgium = season.getSeasonRaceSelection2026(
    new Date("2026-07-20T12:00:00.000Z"),
  );
  assert.equal(afterBelgium.phase, "next");
  assert.equal(afterBelgium.race.id, "hungary");
});

test("selection handles pre-season and post-season boundaries", () => {
  const beforeSeason = season.getSeasonRaceSelection2026(
    new Date("2026-01-01T00:00:00.000Z"),
  );
  assert.equal(beforeSeason.phase, "next");
  assert.equal(beforeSeason.race.id, "australia");

  const afterSeason = season.getSeasonRaceSelection2026(
    new Date("2027-01-01T00:00:00.000Z"),
  );
  assert.equal(afterSeason.phase, "off-season");
  assert.equal(afterSeason.race.id, "abu-dhabi");
});
