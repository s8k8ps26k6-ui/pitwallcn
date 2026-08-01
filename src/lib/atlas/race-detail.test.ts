import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript") as typeof import("typescript");

function loadTsModule(path: string, resolver: (id: string) => unknown) {
  const source = fs.readFileSync(path, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: path,
  }).outputText;
  const compiledModule = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", "require", output)(
    compiledModule.exports,
    compiledModule,
    resolver,
  );
  return compiledModule.exports;
}

const calendar = loadTsModule("src/lib/race-calendar.ts", (id) => require(id));
const season = loadTsModule("src/lib/atlas/season-2026.ts", (id) => require(id));
const outlines = loadTsModule(
  "src/lib/atlas/circuit-outlines-2026.ts",
  (id) => require(id),
);
const circuits = loadTsModule(
  "src/lib/atlas/circuit-registry.ts",
  (id) => (id === "./circuit-outlines-2026" ? outlines : require(id)),
);
const events = loadTsModule(
  "src/lib/atlas/events-2026.ts",
  (id) => (id === "../race-calendar" ? calendar : require(id)),
);
const detail = loadTsModule(
  "src/lib/atlas/race-detail.ts",
  (id) => {
    if (id === "./events-2026") return events;
    if (id === "./circuit-registry") return circuits;
    if (id === "./season-2026") return season;
    return require(id);
  },
) as typeof import("./race-detail");

test("unified 2026 race data keeps all 22 active calendar events", () => {
  const races = detail.getSeasonRaces(new Date("2026-08-02T00:00:00.000Z"));
  assert.equal(races.length, 22);
  assert.equal(new Set(races.map((race) => race.eventId)).size, 22);
  assert.equal(races.filter((race) => race.race.region === "EUROPE").length, 9);
});

test("event detail lookup joins the stable event and circuit identifiers", () => {
  const race = detail.getRaceByEventId(
    "netherlands-gp-2026",
    new Date("2026-08-02T00:00:00.000Z"),
  );
  assert.ok(race);
  assert.equal(race.circuitId, "netherlands");
  assert.equal(race.race.round, 12);
  assert.ok(race.circuit?.outline?.length);
});

test("unconfirmed session schedules fall back to the verified race-weekend start", () => {
  const current = detail.getCurrentSeasonRace(
    new Date("2026-08-02T00:00:00.000Z"),
  );
  const moment = detail.getPrimaryRaceMoment(
    current.race,
    new Date("2026-08-02T00:00:00.000Z"),
  );
  assert.equal(moment.kind, "weekend");
  assert.equal(moment.isTimeConfirmed, false);
  assert.equal(moment.startTime, "2026-08-21T00:00:00.000Z");
});
