// Reproducible, read-only generator. Prints JSON; never modifies Atlas data.
// Usage: node src/components/homepage-v3/generate-geometry.mjs <upstream commit>
import fs from "node:fs";
import ts from "typescript";
const revision = process.argv[2];
if (!/^[a-f0-9]{40}$/.test(revision ?? "")) throw new Error("Pass an immutable upstream commit SHA");
const url = `https://raw.githubusercontent.com/bacinger/f1-circuits/${revision}/f1-circuits.geojson`;
const response = await fetch(url);
if (!response.ok) throw new Error(`Source HTTP ${response.status}`);
const source = await response.json();
const file = new URL("../../lib/atlas/circuit-outlines-2026.ts", import.meta.url);
const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { CIRCUIT_OUTLINES_2026: outlines } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
const candidates = source.features.filter(f => f.geometry.type === "LineString").map(f => {
  const points = f.geometry.coordinates;
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys), w = Math.max(...xs) - x, h = Math.max(...ys) - y;
  return { id: f.properties.id, points: points.map(p => [(p[0] - x) / w, (p[1] - y) / h]),
    // Local equirectangular projection corrects longitude at the mean latitude.
    aspect: w * Math.cos((y + h / 2) * Math.PI / 180) / h };
});
const circuits = {};
for (const [key, points] of Object.entries(outlines)) {
  const matches = candidates.map(c => ({ ...c, error: Math.max(...points.map(p => Math.min(...c.points.map(q => Math.hypot(p[0] - q[0], p[1] - q[1]))))) })).sort((a, b) => a.error - b.error);
  const best = matches[0];
  // Rounded four-decimal, possibly simplified source vertices. No name-based or
  // hand-tuned ratio mapping. Reject ambiguous/unmatched outlines explicitly.
  if (best.error < .002 && matches[1].error > .02) circuits[key] = { sourceId: best.id, aspect: best.aspect, maxVertexError: best.error };
}
console.log(JSON.stringify({ source: url, projection: "local-equirectangular-mean-latitude", circuits }, null, 2));
