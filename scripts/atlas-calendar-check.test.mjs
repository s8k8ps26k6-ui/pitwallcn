import assert from "node:assert/strict";
import test from "node:test";

import {
  compareCalendars,
  getCandidateChanges,
} from "./atlas-calendar-check.mjs";

function race(overrides = {}) {
  return {
    id: "belgium",
    round: 10,
    name: "Belgian Grand Prix",
    country: "Belgium",
    city: "Spa-Francorchamps",
    circuitName: "Circuit de Spa-Francorchamps",
    startDate: "2026-07-17",
    endDate: "2026-07-19",
    isSprint: false,
    sessions: [
      {
        name: "Qualifying",
        startTime: "2026-07-18T14:00:00Z",
        isTimeConfirmed: true,
      },
    ],
    ...overrides,
  };
}

test("unchanged calendars produce no candidate changes", () => {
  const current = [race()];
  assert.deepEqual(compareCalendars(current, [race()]), []);
});

test("calendar date, round, and confirmed session changes are reported", () => {
  const remote = race({
    round: 11,
    startDate: "2026-07-24",
    sessions: [
      {
        name: "Qualifying",
        startTime: "2026-07-25T14:00:00Z",
      },
    ],
  });
  const types = compareCalendars([race()], [remote]).map((change) => change.type);
  assert.ok(types.includes("round"));
  assert.ok(types.includes("date"));
  assert.ok(types.includes("session-time"));
});

test("missing remote records produce count and missing-remote changes", () => {
  const types = compareCalendars([race()], []).map((change) => change.type);
  assert.deepEqual(types, ["count", "missing-remote"]);
});

test("manual override has precedence over a remote date difference", () => {
  const changes = compareCalendars(
    [race()],
    [race({ startDate: "2026-07-24" })],
    [{ id: "belgium", startDate: "2026-07-24" }],
  );
  assert.equal(changes.some((change) => change.type === "date"), false);
});

test("source failure keeps the last valid calendar and emits no candidate changes", () => {
  assert.deepEqual(getCandidateChanges("fallback", [race()], []), []);
});
