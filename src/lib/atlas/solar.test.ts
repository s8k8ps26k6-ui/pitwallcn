import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript") as typeof import("typescript");

function loadTsModule(
  path: string,
  resolver: (id: string) => unknown,
) {
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
  return compiledModule.exports as {
    isLocationInDaylight: (
      latitude: number,
      longitude: number,
      date: Date,
    ) => boolean;
    getSolarState: (date: Date) => {
      latitude: number;
      longitude: number;
      utc: string;
      direction: readonly [number, number, number];
    };
  };
}

const geo = loadTsModule("src/lib/atlas/geo.ts", (id) => require(id));
const solar = loadTsModule(
  "src/lib/atlas/solar.ts",
  (id) => (id === "./geo" ? geo : require(id)),
);

test("UTC solar direction places China at night around 02:00 CST", () => {
  const atChinaTwoAm = new Date("2026-07-18T18:00:00.000Z");

  assert.equal(solar.isLocationInDaylight(39.9042, 116.4074, atChinaTwoAm), false);
  assert.equal(solar.isLocationInDaylight(39.7392, -104.9903, atChinaTwoAm), true);
});

test("UTC solar direction broadly reverses after twelve hours", () => {
  const twelveHoursLater = new Date("2026-07-19T06:00:00.000Z");

  assert.equal(
    solar.isLocationInDaylight(39.9042, 116.4074, twelveHoursLater),
    true,
  );
  assert.equal(
    solar.isLocationInDaylight(39.7392, -104.9903, twelveHoursLater),
    false,
  );
});

test("UTC 2026-07-19 16:09 places the Americas in daylight and East Asia at night", () => {
  const referenceUtc = new Date("2026-07-19T16:09:00.000Z");

  assert.equal(
    solar.isLocationInDaylight(40.7128, -74.006, referenceUtc),
    true,
  );
  assert.equal(
    solar.isLocationInDaylight(34.0522, -118.2437, referenceUtc),
    true,
  );
  assert.equal(
    solar.isLocationInDaylight(39.9042, 116.4074, referenceUtc),
    false,
  );
  assert.equal(
    solar.isLocationInDaylight(1.3521, 103.8198, referenceUtc),
    false,
  );
});

test("solar state direction uses the same geographic coordinate frame", () => {
  const state = solar.getSolarState(new Date("2026-07-19T16:09:00.000Z"));
  assert.equal(state.utc, "2026-07-19T16:09:00.000Z");
  assert.ok(state.longitude < -55 && state.longitude > -70);
  const length = Math.hypot(...state.direction);
  assert.ok(Math.abs(length - 1) < 1e-6);
});

test("solar subpoint follows seasonal declination at a fixed UTC hour", () => {
  const juneSolstice = solar.getSolarState(new Date("2026-06-21T12:00:00.000Z"));
  const decemberSolstice = solar.getSolarState(new Date("2026-12-21T12:00:00.000Z"));

  assert.ok(juneSolstice.latitude > 20);
  assert.ok(decemberSolstice.latitude < -20);
  assert.ok(juneSolstice.latitude - decemberSolstice.latitude > 40);
});
