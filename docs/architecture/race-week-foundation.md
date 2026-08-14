# Race Week foundation proposal

## Status and scope

Everything in this document is a **proposal** unless explicitly introduced as a constraint from the current repository. It defines a small, executable target architecture for future Race Week Control, live session status and external data integration. It does not claim that these types, adapters, policies or states already exist.

The proposal is intentionally incremental:

- Keep the current Next.js application and server-service pattern.
- Do not introduce a database, microservice, message bus or large client state library before a demonstrated need.
- Reuse and migrate the useful parts of `src/lib/atlas/season-2026.ts`, `src/lib/atlas/circuit-registry.ts`, `src/lib/race-calendar.ts` and `src/lib/atlas/race-detail.ts`; do not create a third permanent parallel calendar.
- Keep Atlas visual/rendering behavior outside the data refactor. Atlas should consume the same event read model without changing globe, shader, node, solar or interaction code.
- Keep provider credentials server-only. No third-party key may use a `NEXT_PUBLIC_*` variable or be committed.

## Goals

1. Give Home, Atlas, Schedule, event detail and Race Weekend one canonical event/session vocabulary.
2. Centralize current/next/countdown/live-module decisions in pure, testable functions.
3. Isolate UI from OpenF1 or any future provider’s raw fields.
4. Preserve useful cached data during temporary provider failures and make freshness visible.
5. Poll only when session state and page visibility justify it.
6. Allow one module to degrade without crashing the event page.
7. Add infrastructure only when a migrated production consumer uses it.

## Proposed module boundary

Create the following only as the first real consumer is migrated:

```text
src/lib/race-week/
  domain.ts                 canonical domain types
  session-state.ts          pure lifecycle/state derivation
  repository.ts             current 2026 read model and lookup API
  data-envelope.ts          source/freshness/error contract
  sources/openf1/
    schemas.ts              runtime validators for used responses
    adapter.ts              raw OpenF1 -> domain mapping
```

This module should replace overlapping responsibilities over time. It must not initially duplicate every existing file. A practical first commit may place the domain types and state engine alongside `race-detail.ts`, migrate one caller, and then move/rename once the seam is proven.

## Proposed domain model

### Season

```ts
type Season = {
  id: string;               // e.g. "f1-2026"
  year: number;
  series: "formula-1";
  eventIds: readonly string[];
};
```

`Season` owns calendar membership/order, not session live state or standings rows. This replaces the literal `2026` spread across Atlas event types and route lookups.

### Driver

```ts
type Driver = {
  id: string;               // stable internal id
  code: string;
  displayName: string;
  permanentNumber?: number;
  nationality?: string;
};
```

Identity must be separate from points, current position, compound, laps, image presentation and route CSS. Provider driver numbers/codes belong in provider-reference maps when they are not stable domain identity.

### Constructor

```ts
type Constructor = {
  id: string;
  name: string;
  nationality?: string;
};
```

A driver’s constructor assignment is season/event participation data, not a mutable string inside `Driver` identity.

### Circuit

```ts
type Circuit = {
  id: string;
  name: string;
  aliases: readonly string[];
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  timeZone: string;         // validated IANA zone
  lengthKm?: number;
  raceLaps?: number;
  outline?: readonly (readonly [number, number])[];
  provenance: readonly FieldProvenance[];
};
```

The current `CircuitRegistryEntry` is the nearest existing model. Preserve its stable id, outline and verification metadata, but validate timezones and record provenance per field where sources differ.

### Event

```ts
type Event = {
  id: string;               // e.g. "netherlands-gp-2026"
  seasonId: string;
  round: number;
  name: string;
  circuitId: string;
  format: "grand-prix" | "sprint";
  startAt: string;          // exact ISO instant
  endAt: string;            // exact ISO instant
  statusOverride?: "cancelled" | "rescheduled" | "replacement";
};
```

`Event` represents a calendar occurrence. It must remain independent of `Circuit`, so replacement venues and multiple events at one circuit do not require identity hacks. Exact instants replace date-only UTC concatenation.

### RaceWeekend

```ts
type RaceWeekend = {
  eventId: string;
  sessions: readonly Session[];
};
```

`RaceWeekend` is the operational aggregate used by Race Week Control. It references one `Event`; it does not duplicate country/circuit names. Pages can join `Event`, `Circuit` and `RaceWeekend` through repository lookups.

### Session

```ts
type SessionType =
  | "practice-1"
  | "practice-2"
  | "practice-3"
  | "sprint-qualifying"
  | "sprint"
  | "qualifying"
  | "race";

type Session = {
  id: string;               // internal stable id
  eventId: string;
  type: SessionType;
  name: string;
  scheduledStartAt: string;
  scheduledEndAt?: string;
  actualStartAt?: string;
  actualEndAt?: string;
  status?: SessionStatus;   // explicit source/admin signal when available
  timingConfidence: "confirmed" | "estimated" | "tbc";
  providerRefs: Readonly<Record<string, string | number>>;
};
```

OpenF1 `session_key` is a provider reference, not the domain id. UI links should eventually use the internal event/session id and let the server adapter resolve provider keys.

### SessionStatus

The normalized lifecycle states are:

```ts
type SessionStatus =
  | "scheduled"
  | "upcoming"
  | "live"
  | "delayed"
  | "suspended"
  | "finished"
  | "cancelled";
```

- **Scheduled:** valid future schedule exists but is outside the configurable “upcoming” window.
- **Upcoming:** valid future start is close enough for countdown/race-week emphasis.
- **Live:** explicit provider signal says live, or the state engine can safely infer it from confirmed start/end bounds and available live evidence.
- **Delayed:** explicit delay signal. Do not infer delay merely because data is absent.
- **Suspended:** explicit red-flag/suspension signal while the session has not finished.
- **Finished:** explicit final signal or a safe actual-end/finalization rule.
- **Cancelled:** explicit cancellation. It is terminal.

Provider status takes precedence over time inference. Scheduled start alone is not enough to decide that a session is live indefinitely.

### WeatherSnapshot

```ts
type WeatherSnapshot = {
  sessionId: string;
  observedAt: string;
  airTemperatureC?: number;
  trackTemperatureC?: number;
  humidityPct?: number;
  pressureMbar?: number;
  rainfall?: boolean;
  windDirectionDeg?: number;
  windSpeedMps?: number;
};
```

Store numeric domain values. Formatting such as `"31.5°C"`, compass labels and China/circuit-local time belongs in presenters, not the adapter.

### ChampionshipStanding

```ts
type ChampionshipStanding = {
  seasonId: string;
  competitor:
    | { kind: "driver"; driverId: string }
    | { kind: "constructor"; constructorId: string };
  position: number;
  points: number;
  wins?: number;
  asOf: string;
};
```

Standings are snapshots with an `asOf` instant. They must not be derived by summing mock driver profile points and presented as current competition state.

### DataSource

```ts
type DataSource = {
  provider: "local-calendar" | "openf1" | "manual" | string;
  dataset: string;
  endpoint?: string;
  version?: string;
  fetchedAt: string;
};
```

This records where a value came from. It is separate from whether that value is fresh.

### DataFreshness

```ts
type DataFreshnessState =
  | "live"
  | "cached"
  | "stale"
  | "estimated"
  | "mock"
  | "unavailable";

type DataFreshness = {
  state: DataFreshnessState;
  fetchedAt?: string;
  staleAt?: string;
  expiresAt?: string;
};
```

- `live`: recently fetched during an active session and inside the endpoint’s live TTL.
- `cached`: valid cached data inside TTL.
- `stale`: last-known-good data outside TTL, intentionally retained after refresh failure.
- `estimated`: schedule/value explicitly derived from an estimate, never labelled confirmed.
- `mock`: development/prototype data, visibly labelled.
- `unavailable`: no usable current or cached value.

### DataError

```ts
type DataErrorKind =
  | "timeout"
  | "offline"
  | "network"
  | "rate-limit"
  | "upstream"
  | "schema"
  | "not-found"
  | "unauthorized"
  | "unknown";

type DataError = {
  kind: DataErrorKind;
  message: string;          // safe user/log description, no secret/raw payload
  retryable: boolean;
  status?: number;
  retryAfterMs?: number;
  occurredAt: string;
};
```

Errors must distinguish “valid empty” from “provider failed.” Raw exception messages and provider payloads should be logged server-side with appropriate redaction, not shipped blindly to UI.

## Proposed data envelope

All provider-backed repository methods should return one contract:

```ts
type DataEnvelope<T> = {
  data: T | null;
  source: DataSource;
  freshness: DataFreshness;
  error?: DataError;
};
```

Examples:

- Fresh weather samples: `data: WeatherSnapshot[]`, `freshness.state: "live"`, no error.
- Provider timeout with cached samples: cached `data`, `freshness.state: "stale"`, `error.kind: "timeout"`.
- Valid completed session with no race-control rows: `data: []`, freshness cached/live, no error.
- No provider and no cache: `data: null`, `freshness.state: "unavailable"`, typed error.
- Current live prototype until migrated: data with `freshness.state: "mock"`.

UI modules should render the envelope state and domain values. They must not branch on provider strings such as `source.includes("error")`.

## Proposed pure session-state engine

Time decisions should move out of React components into a deterministic function whose clock is supplied by its caller:

```ts
type SessionStatePolicy = {
  upcomingWindowMs: number;
  finalizationGraceMs: number;
};

type SessionStateResult = {
  statuses: Readonly<Record<string, SessionStatus>>;
  currentSession: Session | null;
  nextSession: Session | null;
  countdownTarget: string | null;
  isRaceWeek: boolean;
  showLiveModules: boolean;
  refreshAfterMs: number | null;
  stopPolling: boolean;
};

function deriveSessionState(input: {
  now: Date;
  event: Event;
  sessions: readonly Session[];
  liveSignals?: Readonly<Record<string, SessionStatus>>;
  policy: SessionStatePolicy;
}): SessionStateResult;
```

### Evaluation rules

1. Reject or quarantine invalid event/session instants at the repository/adapter boundary.
2. Normalize and sort sessions once by confirmed scheduled start.
3. Apply explicit `cancelled`, `finished`, `suspended`, `delayed` or `live` signals before inference.
4. Infer `scheduled` versus `upcoming` from `scheduledStartAt - now` and one policy threshold.
5. Infer `live` only when both start and trustworthy end/finalization evidence exist. If end time is absent, require a provider live signal rather than guessing.
6. `currentSession` is the one normalized as `live`, `delayed` or `suspended`; at most one may be current for an event.
7. `nextSession` is the earliest non-cancelled future session. A live session is current, not next.
8. `countdownTarget` is the next session’s confirmed start, otherwise the exact event start. It is `null` after the terminal event state rather than counting down to a past instant.
9. `isRaceWeek` uses the event’s exact `startAt`/`endAt`, with any product lead-in window defined in policy. It must not concatenate date-only values with UTC midnight.
10. `showLiveModules` is true only when a current session and the relevant provider capability exist; “race week” alone is insufficient.
11. `stopPolling` is true for cancelled sessions and after finished data passes finalization grace. Off-season/no-current-event also stops polling.

The same result must drive HomepageV3, MobileRaceDock, SeasonAtlas, SeasonCalendar, RaceDetailView and future Race Week live modules. Components may choose presentation granularity, but they may not redefine lifecycle rules.

## Countdown and race-week entry behavior

- Render the first server value from the same state-engine result used by the client to avoid hydration disagreement.
- After hydration, a display clock may update countdown text every second or minute without refetching domain data.
- At a session boundary, recompute the state engine immediately; do not merely clamp the countdown to zero.
- The homepage may enter a Race Week presentation during the configured lead-in/current event window, but a live badge/module appears only when `showLiveModules` is true.
- After the final session, keep the event detail/recap accessible, change status to finished, and stop countdown/live polling after finalization grace.

## Provider adapter and schema validation

### Boundary

```text
OpenF1 HTTP response
  -> runtime schema validation
  -> provider-specific raw type
  -> OpenF1 adapter
  -> canonical domain value
  -> DataEnvelope
  -> repository/read model
  -> UI
```

The UI must never depend on `meeting_key`, `session_key`, `date_start`, `lap_duration` or other raw provider fields. Those remain inside `sources/openf1`.

Runtime validation can use a small schema library such as Zod if adding the dependency is justified by the first migrated slice. Explicit narrow validators are also acceptable. TypeScript interfaces alone are not runtime validation.

Validators should cover only endpoints in use. They should:

- reject missing required identifiers/timestamps;
- treat documented optional numeric fields as optional/null safely;
- reject invalid dates and non-finite measurements;
- preserve unknown provider fields only in server logs/diagnostics, not domain objects;
- return `DataError { kind: "schema" }` without crashing unrelated modules.

Provider-name translations should be centralized. Meeting/session discovery should be shared rather than reimplemented separately in results, lap, weather and race control.

## Timeout, retry and rate-limit policy

### Timeouts

- Use `AbortController` for every external request.
- Select endpoint-specific timeouts: shorter for live refreshes, modestly longer for selector/history calls.
- A parent module timeout must abort the underlying provider request rather than merely winning `Promise.race`.

### Retries

- Retry only idempotent GET requests.
- Retry network failures, timeouts where budget remains, HTTP 429 and HTTP 5xx.
- Do not retry validation failures, most HTTP 4xx, cancelled requests or missing required identifiers.
- Use at most two bounded retries in request traffic, with exponential backoff plus jitter and one total time budget.
- Honor `Retry-After` for rate limits and propagate it as `DataError.retryAfterMs`.
- Do not synchronize many client retries; the server cache/repository should coalesce equivalent refreshes where practical.

### Secrets

OpenF1 currently requires no repository key. A future provider key must live in server environment configuration, be read only by server modules and never be returned in errors/log payloads. `.env*.local` remains ignored; production secrets belong in the deployment secret store.

## Cache and last-known-good policy

Use current Next.js fetch/data caching before adding a database.

Suggested initial TTL classes (to be validated against provider terms and real behavior):

| Data | Scheduled/off-session | Upcoming | Live | Finished |
| --- | --- | --- | --- | --- |
| Season/event/circuit | 6-24 h | 30-60 min | 30-60 min | 24 h |
| Session schedule/status | 15 min | 30-60 s | 10-30 s | 5 min, then 24 h |
| Race control | no poll | 30-60 s capability check | 5-10 s | 1-5 min, then long cache |
| Timing/laps/position | no poll | no poll/capability check | 5-10 s | 30-60 s finalization, then long cache |
| Weather | no poll | 60 s capability check | 15-30 s | 5 min, then long cache |
| Results/standings | 15 min | 5 min | 30-60 s | 5 min until final, then 6-24 h |

The repository should retain the last successful envelope in the server cache. When refresh fails:

- return last-known-good data as `stale` with both `fetchedAt` and `staleAt`;
- attach the typed refresh error;
- never replace non-empty cached data with an error-generated empty array;
- let each module degrade independently;
- return unavailable only when no valid cached value exists.

Fix `fetchOpenF1` so caller-specific cache policy is either honored or removed from its public options. The current misleading `revalidate: 300` call must not survive the migration.

A durable database/cache becomes justified only if measured serverless cache behavior cannot preserve required history/last-known-good values or if scheduled ingestion is approved. It is not phase-one work.

## Browser polling policy

Polling belongs in one reusable hook/controller that consumes `SessionStateResult` and envelope metadata. It must not be hard-coded in feature components.

Proposed behavior:

| State | Poll behavior |
| --- | --- |
| Scheduled/outside race week | Stop. Recompute at the next meaningful boundary or on page open. |
| Upcoming | Refresh schedule/capability about every 60 seconds; do not poll high-volume timing. |
| Live | Poll endpoint-specific intervals from the table above. |
| Delayed | Poll status/race control every 15-30 seconds; avoid high-volume timing until available. |
| Suspended | Continue low-frequency status/race-control polling; retain timing/weather. |
| Finished | Poll briefly through finalization grace, then stop and use long cache. |
| Cancelled | Stop. |

Every browser poll must:

- check `response.ok` and validate the normalized response contract;
- catch and surface errors without clearing last-known-good rows;
- prevent overlapping requests and abort superseded/unmounted requests;
- pause while `document.hidden`;
- pause while `navigator.onLine === false`;
- apply jitter/backoff after failures or 429;
- stop for mock data. The current `/live` prototype should not poll until a real adapter is wired.

## Offline, focus and page-recovery behavior

### Offline

- Listen for browser `online` and `offline` events in the shared polling controller.
- On offline, stop network work immediately and retain existing data with an offline banner. If cached data exists, show it as cached/stale with its timestamp; otherwise render the offline-unavailable state.
- Offline is not the same as an OpenF1 error and must not be labelled “waiting.”

### Focus/visibility recovery

- On `visibilitychange` to visible or window focus, recompute session state from the current wall clock.
- If the last envelope is beyond `staleAt`, issue one immediate refresh; otherwise resume the scheduled interval.
- Do not replay every missed interval or start duplicate timers.

### Reopen and force refresh

- A server render/page reopen loads cached or refreshed envelopes and derives current/next state using the request clock.
- The client reconciles with its current clock after hydration and refreshes only if stale.
- Browser force refresh must not rely on in-memory client state to identify the event/session; canonical route/event/session ids must be sufficient to rebuild provider references.
- If a provider is unavailable, the page shell and independent modules remain usable.

## UI state contract

Every data module should handle these states explicitly:

- **Loading:** no response yet and no cached data. Show a neutral skeleton; do not claim API readiness.
- **Empty:** request succeeded and returned a valid empty set. Explain why that can be normal for the selected session.
- **Cached:** valid cached data inside TTL. Show `updatedAt` when material.
- **Stale:** show last-known-good content, stale timestamp and a non-blocking retry/error notice.
- **Offline:** show retained data if available and a connection-specific notice.
- **Error/unavailable:** no usable data; show typed, actionable retry copy without collapsing the rest of the page.
- **Mock/estimated:** label unmistakably and never use live styling or wording.

Global `error.tsx` remains the boundary for unexpected rendering/programming failures. Provider failures should normally remain inside their module envelopes.

## Proposed repository/read API

A small server-safe interface prevents pages from reconstructing joins:

```ts
interface RaceWeekRepository {
  getSeason(seasonId: string): Promise<Season | null>;
  getEvent(eventId: string): Promise<Event | null>;
  getCircuit(circuitId: string): Promise<Circuit | null>;
  getRaceWeekend(eventId: string): Promise<RaceWeekend | null>;
  getEventContext(eventId: string, now: Date): Promise<EventContext | null>;
  getWeather(sessionId: string): Promise<DataEnvelope<readonly WeatherSnapshot[]>>;
  getStandings(seasonId: string): Promise<DataEnvelope<readonly ChampionshipStanding[]>>;
}
```

`EventContext` should contain the joined Season/Event/Circuit/RaceWeekend and derived `SessionStateResult`. Home, Atlas, Schedule and detail pages can request the same context/read model rather than running separate joins.

Do not add methods before a page or test uses them.

## Migration and phased delivery

### Phase 0 — correct and protect current facts

- Correct the Las Vegas exact event boundary and Abu Dhabi timezone in the authoritative source.
- Add tests for all IANA timezone values, exact event boundaries, the final post-season state and invalid/missing times.
- Decide one authoritative static 2026 source and document field provenance before deleting any duplicate.
- Keep current public behavior and Atlas visuals otherwise unchanged.

### Phase 1 — canonical event/session model and state engine

- Introduce the minimal `Season`, `Event`, `Circuit`, `RaceWeekend`, `Session` and `SessionStatus` types.
- Adapt the current 2026 static data into these types.
- Implement `deriveSessionState` as pure functions with explicit `now` and policy.
- Migrate one complete read path—prefer Home plus event detail—then migrate Schedule, MobileRaceDock and Atlas to the same result.
- Remove component-local classifiers only after their consumer has migrated.

Exit condition: Home, Schedule, Atlas and event detail agree on current event, current/next session and countdown for the same test clock.

### Phase 2 — one validated external vertical slice

Weather is a useful first slice because the current event detail declares it unavailable while a separate OpenF1 page already works.

- Add OpenF1 weather schema validation and adapter.
- Resolve an internal event/session to its OpenF1 reference server-side.
- Return `DataEnvelope<WeatherSnapshot[]>` with source/freshness/error.
- Render the same envelope in `/weather`, event detail and the mobile Race Pulse.
- Add last-known-good, stale and offline UI for that slice.

Exit condition: event context and weather page show consistent selected-session data and an upstream failure does not remove the event page.

### Phase 3 — results, race control and laps

- Share meeting/session discovery and provider-reference resolution.
- Migrate results, race-control and lap adapters to validated envelopes.
- Sort lap/position/interval/stint rows explicitly by lap/date before choosing latest values.
- Remove the silent historical `11249` fallback; if history is desired, expose it as an explicit labelled user selection.
- Rebuild `/race-weekend` on `EventContext` instead of the results selector.

### Phase 4 — status-driven live refresh

- Add the visibility/offline-aware polling controller.
- Wire it only to real provider-backed live modules.
- Use explicit provider status/race-control evidence to enrich SessionStatus.
- Stop mock live timing polling; retain a labelled prototype or replace it with validated real data.
- Measure request volume, cache hit rate, latency and rate-limit behavior before tightening intervals.

### Phase 5 — standings, drivers and optional durability

- Separate Driver/Constructor identity from championship snapshots.
- Add a verified standings adapter or an explicitly dated, reviewed local snapshot.
- Return unknown driver ids as not found rather than silently showing the first profile.
- Consider durable storage/scheduled ingestion only if cache measurements, historical requirements or Race Outlook scheduling justify it.

## Proposed test strategy

Use the project’s existing lightweight unit style for pure functions and the newly added minimal Playwright setup for route/browser boundaries. Do not replace the entire test framework.

### Pure domain/state tests

- Each `SessionStatus`, including provider precedence over time inference.
- Current versus next session before start, exactly at start, during live, exactly at end and after finalization.
- Delayed, suspended, resumed, finished and cancelled transitions.
- Countdown target and terminal `null` behavior.
- Race-week entry/exit and off-season behavior.
- Sprint and regular weekend ordering.
- Las Vegas cross-UTC-date boundary.
- IANA timezone validation and daylight-saving boundaries for representative circuits.
- Page reopen/focus with a large wall-clock jump.

### Adapter/schema tests

- Valid fixture for every migrated OpenF1 endpoint.
- Missing/null optional fields.
- Missing required id/time, invalid date and non-finite numeric fields -> schema error.
- Provider names/session types -> normalized domain enum.
- Provider keys remain in `providerRefs` and never become internal ids.
- Per-driver lap/stint/position selection is deterministic regardless of input order.

Fixtures must be small, reviewed and clearly provider/mock-labelled. Do not record secrets or large upstream payload dumps.

### Fetch/cache/error tests

- Timeout aborts the underlying request.
- 429 honors `Retry-After`; network/5xx retry within budget; 4xx/schema errors do not retry.
- Caller cache policy is honored.
- Refresh failure returns stale last-known-good rather than empty.
- No cache plus failure returns unavailable with typed error.
- Concurrent equivalent refreshes do not produce avoidable duplicate requests.

### Component tests

- Loading, valid empty, cached, stale, offline, mock and unavailable presentations.
- A failed weather/control module does not remove event identity/session navigation.
- Source, fetched time and stale warning are visible where relevant.
- Mock/estimated values never show a live badge.
- Countdown recomputes at a boundary without hydration errors.

### Browser/E2E tests

- Keep homepage/secondary-route ownership coverage.
- Home, Atlas, Schedule and event detail agree on selected event at a controlled clock.
- Direct event/session URL reload restores the same context.
- Mobile `390x844` and desktop `1440x900` have no horizontal overflow.
- Offline transition pauses requests and preserves last-known-good data.
- Hidden/visible transition performs at most one immediate stale refresh.
- Finished/cancelled states stop polling.
- Browser console contains no hydration errors, uncaught rejection, resource 404 or duplicate request storm.

## Delivery guardrails

- Do not change Atlas WebGL rendering while migrating its input data.
- Do not present static fallback, estimated schedule or simulation output as live.
- Do not add a paid provider or credential without an explicit product/source decision.
- Do not delete legacy files until imports and behavior are proven replaced.
- Do not rename persistent `gd`/`griddelta` storage keys without a read-old/write-new migration and test.
- Centralize one configured site URL so metadata, sitemap and robots agree, but treat deployment-slug changes as separate from Race Week domain work.
- Keep commits vertical and reviewable: data correction/tests, state engine/consumer, provider adapter/consumer, then polling/UI states.

## Decisions still required before real live integration

The architecture can proceed through static-domain/state work without these answers, but production live integration requires explicit decisions on:

- provider choice, licence, quota, rate limits and mainland availability;
- which signal is authoritative for live/delayed/suspended/finished status;
- permitted data latency and stale-data retention by module;
- whether authenticated/scheduled Race Outlook generation is a product requirement;
- whether verified standings are runtime API data or a reviewed local snapshot;
- observability and privacy requirements for provider errors and request logs.

Until those decisions are made, the implementation should preserve clear `mock`, `estimated` and `unavailable` states rather than simulate completeness.
