import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";

const SOURCE_URL = "https://api.openf1.org/v1/meetings?year=2026";
const timeoutMs = 8000;
const maxAttempts = 3;

async function fetchJson(url) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        headers: { accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError ?? new Error("Unknown calendar source error");
}

function parseCurrentCalendar(source) {
  const records = [];
  const pattern = /id:\s*"([^"]+)"[\s\S]*?round:\s*(\d+)[\s\S]*?name:\s*"([^"]+)"[\s\S]*?country:\s*"([^"]+)"[\s\S]*?city:\s*"([^"]+)"[\s\S]*?circuitName:\s*"([^"]+)"[\s\S]*?startDate:\s*"(\d{4}-\d{2}-\d{2})"[\s\S]*?endDate:\s*"(\d{4}-\d{2}-\d{2})"/g;
  for (const match of source.matchAll(pattern)) {
    records.push({
      id: match[1],
      round: Number(match[2]),
      name: match[3],
      country: match[4],
      city: match[5],
      circuitName: match[6],
      startDate: match[7],
      endDate: match[8],
    });
  }
  return records.sort((a, b) => a.round - b.round);
}

function normalizeRemote(row) {
  return {
    round: Number(row.meeting_key ?? 0),
    name: row.meeting_name ?? "",
    country: row.country_name ?? "",
    city: row.location ?? "",
    startDate: row.date_start?.slice(0, 10) ?? "",
  };
}

const source = await readFile("src/lib/atlas/season-2026.ts", "utf8");
const current = parseCurrentCalendar(source);
let remote = [];
let sourceStatus = "ok";
let sourceError = null;

try {
  remote = (await fetchJson(SOURCE_URL)).map(normalizeRemote);
} catch (error) {
  sourceStatus = "fallback";
  sourceError = String(error);
}

const changes = [];
if (sourceStatus === "ok") {
  if (remote.length !== current.length) {
    changes.push({ type: "count", current: current.length, remote: remote.length });
  }
  for (const race of current) {
    const remoteRace = remote.find((item) => item.name === race.name);
    if (!remoteRace) {
      changes.push({ type: "missing-remote", race });
      continue;
    }
    if (remoteRace.country !== race.country || remoteRace.city !== race.city) {
      changes.push({ type: "location", race, remote: remoteRace });
    }
    if (remoteRace.startDate && remoteRace.startDate !== race.startDate) {
      changes.push({ type: "date", race, remote: remoteRace });
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  source: SOURCE_URL,
  sourceStatus,
  sourceError,
  currentCount: current.length,
  remoteCount: remote.length,
  changes,
  policy: "候选数据仅进入独立分支和草稿 PR，不自动合并或发布生产。",
};

await mkdir("output/atlas-calendar", { recursive: true });
await writeFile(
  "output/atlas-calendar/report.json",
  `${JSON.stringify(report, null, 2)}\n`,
);
await writeFile(
  "output/atlas-calendar/candidate.json",
  `${JSON.stringify({ sourceStatus, generatedAt: report.generatedAt, changes }, null, 2)}\n`,
);

console.log(JSON.stringify(report, null, 2));
if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `changed=${changes.length ? "true" : "false"}\n`);
}
