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
