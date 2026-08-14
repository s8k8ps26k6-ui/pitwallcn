import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
      await new Promise((resolvePromise) => setTimeout(resolvePromise, attempt * 500));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError ?? new Error("Unknown calendar source error");
}

export function parseCurrentCalendar(source) {
  const records = [];
  const pattern = /id:\s*"([^"]+)"[\s\S]*?round:\s*(\d+)[\s\S]*?name:\s*"([^"]+)"[\s\S]*?country:\s*"([^"]+)"[\s\S]*?city:\s*"([^"]+)"[\s\S]*?circuitName:\s*"([^"]+)"[\s\S]*?startDate:\s*"(\d{4}-\d{2}-\d{2})"[\s\S]*?endDate:\s*"(\d{4}-\d{2}-\d{2})"[\s\S]*?isSprint:\s*(true|false)/g;
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
      isSprint: match[9] === "true",
    });
  }
  return records.sort((a, b) => a.round - b.round);
}

export function parseLocalSessionCalendar(source) {
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
    const times = [startDate, startDate, saturdayIso, saturdayIso, raceStart];
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
    circuitId: row.circuit_key == null ? "" : String(row.circuit_key),
    round: index + 1,
    name: row.meeting_name ?? "",
    officialName: row.meeting_official_name ?? "",
    country: row.country_name ?? "",
    city: row.location ?? "",
    circuitName: row.circuit_short_name ?? row.circuit_name ?? "",
    startDate: row.date_start?.slice(0, 10) ?? "",
    endDate: row.date_end?.slice(0, 10) ?? "",
    status: row.meeting_status ?? row.status ?? null,
    isSprint: (sessionsByMeeting.get(meetingKey) ?? []).some((session) =>
      /sprint/i.test(session.session_name ?? ""),
    ),
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

export function compareCalendars(current, remote, manualOverrides = []) {
  const changes = [];
  const matchedRemoteIndexes = new Set();
  const overrideById = new Map(
    manualOverrides.map((override) => [override.id, override]),
  );
  if (remote.length !== current.length) {
    changes.push({ type: "count", current: current.length, remote: remote.length });
  }
  for (const [index, currentRace] of current.entries()) {
    const override = overrideById.get(currentRace.id) ?? {};
    const race = { ...currentRace, ...override };
    const exactRemoteIndex = remote.findIndex((item) => item.name === race.name);
    const remoteIndex = exactRemoteIndex >= 0 ? exactRemoteIndex : index;
    const remoteRace = remote[remoteIndex];
    if (!remoteRace) {
      changes.push({ type: "missing-remote", race });
      continue;
    }
    matchedRemoteIndexes.add(remoteIndex);
    if (remoteRace.name && remoteRace.name !== race.name) {
      changes.push({ type: "replacement", race, remote: remoteRace });
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
    if (remoteRace.isSprint !== race.isSprint) {
      changes.push({ type: "sprint-format", race, remote: remoteRace });
    }
    const expectedStatus = override.calendarStatus ?? currentRace.calendarStatus;
    if (remoteRace.status && expectedStatus && remoteRace.status !== expectedStatus) {
      changes.push({
        type: "status",
        race,
        remote: remoteRace,
        expectedStatus,
      });
    }
    if (
      remoteRace.circuitId &&
      race.circuitId &&
      remoteRace.circuitId !== race.circuitId
    ) {
      changes.push({ type: "replacement", race, remote: remoteRace });
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
  for (const [index, remoteRace] of remote.entries()) {
    if (!matchedRemoteIndexes.has(index)) {
      changes.push({ type: "added-remote", remote: remoteRace });
    }
  }
  return changes;
}

export function getCandidateChanges(sourceStatus, current, remote, manualOverrides = []) {
  return sourceStatus === "ok"
    ? compareCalendars(current, remote, manualOverrides)
    : [];
}

async function main() {
  const source = await readFile("src/lib/atlas/season-2026.ts", "utf8");
  const current = parseCurrentCalendar(source);
  const overrideSource = await readFile("scripts/atlas-calendar-overrides.json", "utf8");
  const manualOverrides = JSON.parse(overrideSource).overrides ?? [];
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

  const changes = getCandidateChanges(sourceStatus, current, remote, manualOverrides);
  const report = {
    generatedAt: new Date().toISOString(),
    sources: { meetings: SOURCE_URL, sessions: SESSIONS_URL },
    sourceStatus,
    sourceError,
    currentCount: current.length,
    remoteCount: remote.length,
    changes,
    policy: "Candidate data enters an independent branch and draft PR only; it never merges or publishes production automatically.",
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
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
