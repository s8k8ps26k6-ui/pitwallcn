import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript") as typeof import("typescript");
const source = fs.readFileSync("src/lib/atlas/visibility.ts", "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
  fileName: "src/lib/atlas/visibility.ts",
}).outputText;
const compiledModule = { exports: {} as Record<string, unknown> };
new Function("exports", "module", "require", output)(
  compiledModule.exports,
  compiledModule,
  require,
);
const visibility = compiledModule.exports as typeof import("./visibility");

test("projected points outside the viewport are hidden", () => {
  assert.equal(visibility.isProjectedPointVisible({ x: 0, y: 0, z: 0 }), true);
  assert.equal(visibility.isProjectedPointVisible({ x: 1.01, y: 0, z: 0 }), false);
  assert.equal(visibility.isProjectedPointVisible({ x: 0, y: 0, z: 1.01 }), false);
});

test("surface visibility rejects the globe back side", () => {
  assert.equal(visibility.isSurfacePointVisible(0.9, 7, 2), true);
  assert.equal(visibility.isSurfacePointVisible(-0.2, 7, 2), false);
});

test("adaptive labels return null instead of pinning outside the safe viewport", () => {
  const offset = visibility.chooseAdaptiveLabelOffset({
    point: { x: 0.98, y: 0, z: 0 },
    viewportWidth: 390,
    viewportHeight: 844,
    preferred: [100, 0],
    safeInsets: { top: 36, right: 14, bottom: 150, left: 14 },
    maxLeaderLength: 80,
  });
  assert.equal(offset, null);
});
