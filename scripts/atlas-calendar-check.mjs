import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";

const SOURCE_URL = "https://api.openf1.org/v1/meetings?year=2026";
const SESSIONS_URL = "https://api.openf1.org/v1/sessions?year=2026";
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

function parseLocalSessionCalendar(source) {
  const sessionsByRace = new Map();
  const blockPattern = /race\(\{([\s\S]*?)\n  \}\),?/g;
  for (const match of source.matchAll(blockPattern)) {
    const block = match[1];
    const id = block.match(/\bid:\s*"([^"]+)"/)?.[1];
    const startDate = block.match(/\bstartDate:\s*"([^"]+)"/)?.[1];
    const endDate = block.match(/\bendDate:\s*"([^"]+)"/)?.[1];
    const raceStart = block.match(/\braceStart:\s*"([^"]+)"/)?.[1];
    if (!id || !startDate || !endDate || !raceStart) continue;

    const confirmed = [...block.matchAll(
      /\{\s*name:\s*"([^"]+)",\s*startTime:\s*"([^"]+)"(?:,\s*isTimeConfirmed:\s*true)?\s*\}/g,
    )].map((session) => ({
      name: session[1],
      startTime: session[2],
      isTimeConfirmed: /isTimeConfirmed:\s*true/.test(session[0]),
    }));
    if (confirmed.length) {
      sessionsByRace.set(id, confirmed);
      continue;
    }

    const end = new Date(endDate);
    const saturday = new Date(end);
    saturday.setUTCDate(end.getUTCDate() - 1);
    const saturdayIso = saturday.toISOString();
    const names = /\bsprint:\s*true/.test(block)
      ? ["第一次自由练习赛", "冲刺排位赛", "冲刺赛", "排位赛", "正赛"]
      : ["第一次自由练习赛", "第二次自由练习赛", "第三次自由练习赛", "排位赛", "正赛"];
    const times = /\bsprint:\s*true/.test(block)
      ? [startDate, startDate, saturdayIso, saturdayIso, raceStart]
      : [startDate, startDate, saturdayIso, saturdayIso, raceStart];
    sessionsByRace.set(
      id,
      names.map((name, index) => ({
        name,
        startTime: times[index],
        isTimeConfirmed: false,
      })),
    );
  }
  return sessionsByRace;
}

function normalizeRemote(row, index, sessionsByMeeting) {
  const meetingKey = String(row.meeting_key ?? "");
  return {
    id: meetingKey,
    round: index + 1,
    name: row.meeting_name ?? "",
    officialName: row.meeting_official_name ?? "",
    country: row.country_name ?? "",
    city: row.location ?? "",
    circuitName: row.circuit_short_name ?? row.circuit_name ?? "",
    startDate: row.date_start?.slice(0, 10) ?? "",
    endDate: row.date_end?.slice(0, 10) ?? "",
    status: "active",
    sessions: (sessionsByMeeting.get(meetingKey) ?? []).map((session) => ({
      name: session.session_name ?? "",
      startTime: session.date_start ?? "",
    })),
  };
}

function canonical(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

const source = await readFile("src/lib/atlas/season-2026.ts", "utf8");
const current = parseCurrentCalendar(source);
const localSessionSource = await readFile("src/lib/race-calendar.ts", "utf8");
const localSessions = parseLocalSessionCalendar(localSessionSource);
for (const race of current) {
  race.sessions = localSessions.get(`2026-${race.id}`) ??
    localSessions.get(race.id) ?? [];
}
let remote = [];
let sourceStatus = "ok";
let sourceError = null;

try {
  const [meetingRows, sessionRows] = await Promise.all([
    fetchJson(SOURCE_URL),
    fetchJson(SESSIONS_URL),
  ]);
  const sessionsByMeeting = new Map();
  for (const session of sessionRows) {
    const key = String(session.meeting_key ?? "");
    const list = sessionsByMeeting.get(key) ?? [];
    list.push(session);
    sessionsByMeeting.set(key, list);
  }
  remote = meetingRows
    .filter((row) => row.year === 2026 || !row.year)
    .sort((a, b) => String(a.date_start).localeCompare(String(b.date_start)))
    .map((row, index) => normalizeRemote(row, index, sessionsByMeeting));
} catch (error) {
  sourceStatus = "fallback";
  sourceError = String(error);
}

const changes = [];
if (sourceStatus === "ok") {
  if (remote.length !== current.length) {
    changes.push({ type: "count", current: current.length, remote: remote.length });
  }
  for (const [index, race] of current.entries()) {
    const remoteRace =
      remote.find((item) => item.name === race.name) ?? remote[index];
    if (!remoteRace) {
      changes.push({ type: "missing-remote", race });
      continue;
    }
    if (remoteRace.round !== race.round) {
      changes.push({ type: "round", race, remote: remoteRace });
    }
    if (
      remoteRace.country !== race.country ||
      canonical(remoteRace.city) !== canonical(race.city)
    ) {
      changes.push({ type: "location", race, remote: remoteRace });
    }
    if (remoteRace.startDate && remoteRace.startDate !== race.startDate) {
      changes.push({ type: "date", race, remote: remoteRace });
    }
    if (remoteRace.endDate && remoteRace.endDate !== race.endDate) {
      changes.push({ type: "end-date", race, remote: remoteRace });
    }
    if (
      remoteRace.circuitName &&
      !canonical(remoteRace.circuitName).includes(canonical(race.circuitName)) &&
      !canonical(race.circuitName).includes(canonical(remoteRace.circuitName))
    ) {
      changes.push({ type: "circuit", race, remote: remoteRace });
    }
    const localSessionsForRace = race.sessions ?? [];
    const remoteSessions = remoteRace.sessions ?? [];
    for (const [sessionIndex, localSession] of localSessionsForRace.entries()) {
      if (!localSession.isTimeConfirmed) continue;
      const remoteSession = remoteSessions[sessionIndex];
      if (remoteSession?.startTime && remoteSession.startTime !== localSession.startTime) {
        changes.push({
          type: "session-time",
          race,
          session: localSession,
          remote: remoteSession,
        });
      }
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  sources: { meetings: SOURCE_URL, sessions: SESSIONS_URL },
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
