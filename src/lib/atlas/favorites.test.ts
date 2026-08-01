import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript") as typeof import("typescript");
const source = fs.readFileSync("src/lib/atlas/favorites.ts", "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
  fileName: "src/lib/atlas/favorites.ts",
}).outputText;
const compiledModule = { exports: {} as Record<string, unknown> };
new Function("exports", "module", "require", output)(
  compiledModule.exports,
  compiledModule,
  require,
);
const favorites = compiledModule.exports as typeof import("./favorites");

test("event and circuit favorites remain separate", () => {
  const eventFavorite = favorites.toggleFavoriteEvent(
    favorites.EMPTY_ATLAS_FAVORITES,
    "belgium-gp-2026",
  );
  const both = favorites.toggleFavoriteCircuit(eventFavorite, "belgium");

  assert.deepEqual(both.eventIds, ["belgium-gp-2026"]);
  assert.deepEqual(both.circuitIds, ["belgium"]);
  assert.deepEqual(
    favorites.toggleFavoriteEvent(both, "belgium-gp-2026").eventIds,
    [],
  );
  assert.deepEqual(favorites.toggleFavoriteCircuit(both, "belgium").circuitIds, []);
});

test("favorite data normalizes malformed and duplicate storage values", () => {
  assert.deepEqual(
    favorites.normalizeAtlasFavorites({
      eventIds: ["belgium-gp-2026", "belgium-gp-2026", 4],
      circuitIds: ["belgium", ""],
    }),
    {
      eventIds: ["belgium-gp-2026"],
      circuitIds: ["belgium"],
    },
  );
  assert.deepEqual(
    favorites.normalizeAtlasFavorites(null),
    favorites.EMPTY_ATLAS_FAVORITES,
  );
});

test("storage access is safe when no browser window exists", () => {
  assert.equal(favorites.getAtlasStorage(), null);
});
