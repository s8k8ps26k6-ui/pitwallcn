# LAPMETRY current architecture

## Purpose and evidence boundary

This document records the repository state investigated for the route-isolation and Race Week foundation task. Statements under **Confirmed current state** are based on code present in the repository or on commands run against the working tree. Suggestions are deliberately deferred to [`race-week-foundation.md`](./race-week-foundation.md). The exact task verification commands, outcomes and investigated failures are recorded in [`verification.md`](./verification.md).

The investigation baseline is commit `a2c54ea9` (`fix: limit race dock to homepage`) on `codex/rebrand-lapmetry`, the head of the open LAPMETRY migration work (Draft PR #54). The task branch is `codex/lapmetry-route-architecture-foundation` and is intended to stack on that migration branch while PR #54 remains open; after the migration is merged, the pull request can be retargeted to the active development line. The older active product line is `codex/velocity-at-dawn-homepage` at `0663694c`. This document does not treat `main` as the current feature baseline.

The working tree was already dirty during the investigation. Changes outside these architecture documents belong to the route-fix/test work or to the user and are not described as baseline facts unless explicitly identified below.

## Confirmed current state

### Runtime and project structure

- The application uses Next.js 15 App Router, React 19 and TypeScript. The package manager is npm, with `package-lock.json` present. The project name remains the technical identifier `grid-delta-cn` in `package.json`.
- The tracked baseline scripts in `package.json` are `dev`, `build`, `start` and `lint`. There was no tracked baseline `test` or `typecheck` script. The route-isolation task adds minimal Playwright and explicit validation scripts in the working tree; those are task changes, not historical coverage.
- `src/app/layout.tsx` is the only layout. There are no nested layouts, templates or route groups. All pages therefore pass through `RootLayout` and `SiteShell`.
- There is no custom `not-found.tsx`; unknown routes use the Next.js default not-found result inside the root layout.
- There is no global footer. Immersive pages generally own their own headers/footers, while regular data pages receive the regular header from `SiteShell`.

### Route inventory

| Route | Page/component | Confirmed responsibility |
| --- | --- | --- |
| `/` | `src/app/page.tsx` -> `HomepageV3` | Current/next 2026 event hero, race rail, local countdown and homepage-only mobile race/news dock. |
| `/atlas-v2` | `src/app/atlas-v2/page.tsx` -> `SeasonAtlas` | Client-rendered WebGL season globe, race focus, circuit/session metadata and Atlas favorites. |
| `/schedule` | `src/app/schedule/page.tsx` -> `SeasonCalendar` | 22-round season index linked to event detail routes. |
| `/races/[season]/[eventId]` | `src/app/races/[season]/[eventId]/page.tsx` -> `RaceDetailView` | Unified event/circuit detail, sessions, circuit metrics and empty record/history/weather states. Only season `2026` is accepted. |
| `/races/[season]/[eventId]/outlook` | `src/app/races/[season]/[eventId]/outlook/page.tsx` -> `RaceOutlookPanel` | Fixed-structure race outlook display. No verified reports are currently exposed. |
| `/race-weekend` | `src/app/race-weekend/page.tsx` | Historical single-session recap hub combining result, race-control, lap and weather summaries. It is not currently bound to the canonical current event model. |
| `/news` | `src/app/news/page.tsx` -> `NewsFeedView` | Source-attributed news feed. Its sole configured source is disabled, so the current result is the intentional empty state. |
| `/drivers` | `src/app/drivers/page.tsx` -> `DriverIndex` | Search/filter interface over explicitly labelled static mock driver profiles. |
| `/drivers/[driverCode]` | `src/app/drivers/[driverCode]/page.tsx` | Mock driver detail. An unknown code currently falls back to the first profile rather than returning 404. |
| `/lap-analysis` | `src/app/lap-analysis/page.tsx` | OpenF1 session selector and normalized lap/stint/position/interval table. |
| `/live` | `src/app/live/page.tsx` -> `LiveTimingTable` | Explicit live-timing prototype using mock rows and a ten-second browser poll. |
| `/project` | `src/app/project/page.tsx` | Product changelog/project information. |
| `/race-control` | `src/app/race-control/page.tsx` | OpenF1 race-control selector and translated message log. |
| `/results` | `src/app/results/page.tsx` | OpenF1 qualifying/sprint/race classification. |
| `/standings` | `src/app/standings/page.tsx` | Static-fallback driver and derived constructor standings, visibly labelled as awaiting a verified snapshot. |
| `/weather` | `src/app/weather/page.tsx` | OpenF1 session weather samples and summary calculations. |
| `/api/openf1/[endpoint]` | `src/app/api/openf1/[endpoint]/route.ts` | Validated query proxy for an allowlist of raw OpenF1 endpoints. Current UI services call OpenF1 directly rather than this route. |
| `/api/f1/live` | `src/app/api/f1/live/route.ts` | Normalized endpoint that currently returns static mock live timing. |
| `/api/f1/race-control` | `src/app/api/f1/race-control/route.ts` | Latest normalized race-control response. No current browser component calls it. |
| `/api/f1/standings` | `src/app/api/f1/standings/route.ts` | Static-fallback standings response. No current browser component calls it. |

`src/app/sitemap.ts` lists the older regular routes, but it does not currently include `/atlas-v2`, `/news` or generated `/races/...` event detail URLs.

### Shared layout and shell responsibilities

`RootLayout` in `src/app/layout.tsx` owns document language, site metadata, viewport and the single `SiteShell`. `SiteShell` in `src/components/site-shell.tsx` is a client component because it reads `usePathname()`.

`SiteShell` divides pages into two presentation modes:

- `/`, `/atlas-v2`, `/news`, `/schedule` and `/races/...` are immersive. The shell supplies only the base site wrapper and `NavigationMemory`; each page owns its visual navigation.
- Other routes use the constrained regular wrapper and the shared LAPMETRY header/navigation.

`NavigationMemory` remains shared in both branches and records navigation-source and scroll restoration data in session storage. `SiteShell` retains the homepage-only padding class `gd-site-shell--home-dock`, but the current task removes ownership of the dock itself from the shell.

### Homepage-content leak: root cause and boundary

The leaked content was `MobileRaceDock`, which contains the user-visible “赛事脉搏” control and “F1 资讯” link (`src/components/mobile-race-dock.tsx`). It was not caused by Atlas, the schedule or event-detail pages importing homepage sections.

At rebrand commit `2faf98ed`, `src/components/site-shell.tsx` rendered `<MobileRaceDock />` after `{children}` in both its immersive and regular branches. Because the only root layout wraps every route in `SiteShell`, the dock was structurally global. Client navigation changed `children`, but the shell remained mounted, so the homepage dock continued below Atlas and every other secondary page.

Commit `a2c54ea9` reduced the leak by checking `usePathname()` and rendering the dock only when `pathname === "/"`. The current task strengthens that ownership boundary:

- `src/app/page.tsx` imports and renders `MobileRaceDock` beside `HomepageV3`.
- `src/components/site-shell.tsx` no longer imports or renders `MobileRaceDock` in either branch.
- The shell still owns shared navigation memory and the regular-site header; neither is duplicated.

This is composition-level isolation. It does not use CSS hiding, clipping, pathname-specific `display: none`, overlays or a duplicate dock implementation. After the task change, the homepage page module is the only route owner of homepage-only dock content.

### Key component responsibilities

- `HomepageV3` (`src/components/homepage-v3/homepage-v3.tsx`) renders the selected race, next confirmed moment, race-week progress, circuit metrics and adjacent-event rail. It owns local time/countdown presentation, not external data fetching.
- `MobileRaceDock` (`src/components/mobile-race-dock.tsx`) derives current race and primary moment in the browser, updates its clock every minute while visible, and exposes homepage-only Race Pulse/news shortcuts. Its weather/live text is a placeholder, not live data.
- `SeasonAtlas` (`src/components/atlas-v2/season-atlas.tsx`) coordinates WebGL capability, Atlas selection/focus, circuit registry data, sessions, favorites, return state and render/debug settings. `AtlasGlobe` owns globe rendering. The route-isolation work does not alter the WebGL/shader/interaction code.
- `SeasonCalendar` (`src/components/season-calendar/season-calendar.tsx`) renders event links and display status. It computes a client-side season/current selection once per mount.
- `RaceDetailView` (`src/components/race-detail/race-detail-view.tsx`) joins event and circuit data already prepared by `getRaceByEventId`, runs a visibility-aware one-second display clock, and owns session/record/history panels.
- `LiveTimingTable` (`src/components/live-timing-table.tsx`) owns the only browser data poll in the current application.
- `RouteErrorState` (`src/components/route-error-state.tsx`) provides the common retry/home error UI used by root and route-specific `error.tsx` boundaries.

### Existing domain/data models

The repository contains useful partial models, but not one canonical Race Week domain.

#### Calendar, event and circuit

- `ScheduleSession` and `RaceWeekend` in `src/lib/types.ts` contain a name, start time, time-confirmation flag and weekend identity/location/date fields.
- `officialRaceCalendar2026` in `src/lib/race-calendar.ts` is a local Chinese 2026 calendar. Only Canada contains a fully confirmed session list; other entries use generated placeholder session timestamps marked `isTimeConfirmed: false`.
- `SeasonRace` in `src/lib/atlas/season-2026.ts` separately contains round, English identity/location, coordinates, date-only bounds, race status and sprint flag.
- `GrandPrixEvent` and `SeasonCalendarEntry` in `src/lib/atlas/events-2026.ts` adapt `SeasonRace` and join sessions from `race-calendar.ts`, including explicit id aliases for Madrid and São Paulo.
- `CircuitRegistryEntry` in `src/lib/atlas/circuit-registry.ts` contains stable-looking circuit identity, coordinates, IANA timezone, optional length/laps, outline, status, source and verification date.
- `getSeasonRaces()` in `src/lib/atlas/race-detail.ts` joins those sources into `UnifiedRace`, the read model used by the homepage, season calendar and event detail.

There is no `Season` entity: `2026` is a literal type/value. Event and circuit separation exists in types, but the current registry is generated with the race id, and `getSeasonRaces()` looks a race up by `entry.circuitId`. A future event whose event/race id differs from its circuit id is not demonstrated by tests.

#### Driver and constructor

`DriverProfile` in `src/lib/drivers.ts` is a UI-facing mock model. It mixes identity (`code`, `name`, `number`), constructor, points/ranking, live-looking compound/laps/gap, image, CSS accent and route href. There is no independent `Driver` domain entity.

There is no independent `Constructor` entity. `standings-service.ts` groups driver profiles by the `team` string and sums their mock points to produce `ConstructorStanding` rows.

#### Session and status

Sessions contain only `name`, `startTime` and optional `isTimeConfirmed`. They do not contain stable internal identity, event relationship, normalized type, scheduled end, actual start/end or status. There is no `SessionStatus` model.

`getPrimaryRaceMoment()` in `src/lib/atlas/race-detail.ts` selects the first confirmed session whose start is greater than or equal to `now`. This is “next start” logic, not current-session logic: immediately after a session starts, it advances to the next one. If no future confirmed session exists, it falls back to the race-weekend start.

Race-level status is derived from date-only UTC boundaries in `src/lib/atlas/season-2026.ts` and emits `completed`, `current` or `upcoming`. The type also admits `cancelled`, `rescheduled` and `replacement`, but no current data definition produces those states.

#### Weather, laps, length and standings

- `src/lib/weather-service.ts` defines a feature-specific `WeatherPoint`/`WeatherSummary`, maps OpenF1 raw rows, limits normalized rows to the last 240 samples and exposes the latest sample plus aggregates.
- `src/lib/lap-analysis-service.ts` combines OpenF1 laps, stints, positions, intervals and drivers into `LapAnalysisRow`.
- Track length and race laps are static circuit registry overrides. They feed HomepageV3, RaceDetailView and SeasonAtlas.
- Standings are always static fallback. `getDriverStandings()` returns `buildStaticFallbackStandings()` in both its `try` and `catch`; `updatedAt` is always `null`.

### Data flow from source to UI

```text
Static 2026 sources
  season-2026.ts (round/date/coordinates)
  race-calendar.ts (weekend/session times)
  circuit-registry.ts + circuit-outlines-2026.ts (track metadata)
            |
            v
  events-2026.ts -> race-detail.ts -> UnifiedRace
            |              |             |
            v              v             v
       HomepageV3    SeasonCalendar   RaceDetailView

Atlas route
  season-2026.ts + events-2026.ts + circuit-registry.ts
            |
            v
      SeasonAtlas / AtlasGlobe

OpenF1
  fetchOpenF1 (server-only, timeout + Next cache)
            |
            +-> results-service.ts ------> /results
            +-> race-control-service.ts -> /race-control
            +-> lap-analysis-service.ts -> /lap-analysis
            +-> weather-service.ts ------> /weather
                         \----------------> /race-weekend summaries

Static mock driver/live data
  drivers.ts / mockData.ts
            +-> /drivers and /standings
            +-> /live -> /api/f1/live -> browser 10 s polling
```

Atlas shares source files with the homepage/calendar, but it does not consume the same `UnifiedRace` read-model path. `/race-weekend` also does not consume the event aggregate: it discovers recent completed OpenF1 sessions and uses a numeric session key to query four feature services.

### External APIs and validation

`src/lib/openf1-client.ts` is server-only. It constrains endpoint paths, defaults to `https://api.openf1.org/v1`, aborts after 6.5 seconds and always configures Next fetch revalidation at 30 seconds. `OPENF1_BASE_URL` can override the host server-side.

`src/lib/openf1-validation.ts` validates the public proxy endpoint name and allowed query parameters. `src/app/api/openf1/[endpoint]/route.ts` returns 400 for invalid queries, 404 for unsupported endpoints, 502 for upstream failure and sets `s-maxage=30, stale-while-revalidate=60` on successful proxy responses.

This query validation is not response validation. `fetchOpenF1<T>()` casts `response.json()` to `T`; each service redeclares the raw OpenF1 shapes it needs and trusts those rows during normalization. The UI does not currently call the generic proxy; server services call `fetchOpenF1` directly.

### Cache, polling and refresh behavior

- OpenF1 fetches use the Next server data cache with a fixed 30-second revalidation value. Although `results-service.ts` passes a `revalidate: 300` option, the client explicitly ignores it and still uses 30 seconds.
- `/results`, `/race-control`, `/lap-analysis`, `/weather` and `/race-weekend` are forced dynamic with `revalidate = 0`. Their HTML is a request-time snapshot backed by the server fetch cache; they do not poll in the browser.
- `LiveTimingTable` polls `/api/f1/live` every ten seconds with `cache: "no-store"`. The endpoint always returns the same mock rows. The interval does not pause while hidden, stop after a session, check `response.ok`, catch failures or respond to offline state.
- Atlas and the homepage/mobile detail clocks use interval/visibility logic for display and selection, not data refresh. Their policies differ: Atlas/mobile/home use one-minute clocks, while event detail updates every second.
- Race Outlook and News use process-memory maps/arrays. Race Outlook has generation locks but no TTL or durable persistence. News resets its currently empty cache every 15 minutes.
- The monthly Atlas calendar workflow (`.github/workflows/atlas-calendar-check.yml`, `scripts/atlas-calendar-check.mjs`) is separate from runtime. It retries OpenF1 three times, produces candidate reports and can open a draft PR; it never publishes calendar changes automatically.

### Timezone behavior and confirmed data defects

The system stores most session instants as ISO UTC strings and formats them with `Intl.DateTimeFormat`. Event detail and Atlas use the circuit timezone; the OpenF1 data pages and normalized race-control/weather display hard-code `Asia/Shanghai`. The unused legacy `ScheduleView` is the only local/circuit toggle.

Two defects were confirmed by executing the relevant functions:

1. `SeasonRace` treats date-only bounds as UTC midnight-to-23:59. Las Vegas has `endDate: "2026-11-21"` in `season-2026.ts`, but `race-calendar.ts` gives its race start as `2026-11-22T04:00:00Z`. Selection changes from Las Vegas to Qatar at `2026-11-22T00:00:00Z`, four hours before the configured race start.
2. `circuit-registry.ts` uses `Asia/Abu_Dhabi`, which `Intl.DateTimeFormat` rejects with `RangeError`. `race-calendar.ts` separately uses the valid `Asia/Dubai`. The invalid zone is currently masked for unconfirmed sessions, but a confirmed formatted Abu Dhabi session could fail the render.

`findNextRaceFromCalendar()` also wraps to the first 2026 race after the season rather than returning an off-season state. Its caller `getScheduleCalendar()` currently has no UI caller.

### Loading, empty, stale, offline and error states

| State | Confirmed implementation |
| --- | --- |
| Loading | A single root `src/app/loading.tsx` provides a general skeleton. It claims `LOADING · API READY` before API availability is known. There are no route-specific loading files. |
| Empty | Results, lap analysis, weather and race-control pages render explicit no-data sections. Race detail renders explicit weather/record/history placeholders; news renders an intentional authorization/validation empty state. |
| Error | Root and most regular routes have `error.tsx` files using `RouteErrorState`, with a reset action. Feature services frequently catch upstream exceptions and return empty arrays plus a source string, so many API failures do not reach route error boundaries. |
| Stale | Not represented. The server may serve cached/stale-while-revalidate data, but no fetched/stale timestamp reaches the UI. |
| Offline | Not represented. There is no `navigator.onLine` check or `online`/`offline` listener. |

Feature-specific source strings include `openf1`, `openf1-waiting`, `openf1-empty`, `openf1-error`, `static-fallback` and `mock`, but they are not a shared freshness/error contract. Error and valid-empty results often reach the same user copy. The generic badge “OPENF1 WAITING” does not distinguish timeout, network, rate limit, malformed data or valid absence.

`/race-weekend` is the strongest partial-degradation example: it loads four modules in parallel and replaces an individual module after 6.5 seconds. The timeout does not abort the underlying request. If meeting discovery is empty, it silently supplies hard-coded historical OpenF1 session `11249` from 2024 as a manual fallback.

### Static, mock and placeholder data

- `src/lib/mockData.ts` contains mock live timing, race control and two race weekends. Only mock live timing has an active route consumer; the other exports have no current caller.
- `src/lib/drivers.ts` is static mock UI data, explicitly labelled on driver routes.
- Standings and constructor totals derive from those driver mock points.
- `manualFallbackMeetings` in `/race-weekend` is a hard-coded historical session fallback.
- News sources are disabled pending licence/parsing approval; the empty UI intentionally avoids fabricated news.
- Race Outlook has a simulation adapter explicitly marked local-only and not wired to page traffic. The verified event set is empty.
- Race detail deliberately shows placeholders instead of invented weather, records and history.

### Current automated test coverage

Before this task, six test files were tracked:

- `src/lib/atlas/visibility.test.ts`: projected/surface visibility and adaptive label bounds.
- `src/lib/atlas/solar.test.ts`: daylight/solar direction and solstice behavior.
- `src/lib/atlas/season-2026.test.ts`: race counts and simple current/next/pre/post-season selection.
- `src/lib/atlas/race-detail.test.ts`: unified-event joins, event lookup and unconfirmed-session fallback.
- `src/lib/atlas/favorites.test.ts`: favorite separation, storage normalization and server-safe access.
- `scripts/atlas-calendar-check.test.mjs`: candidate calendar comparison/fallback behavior.

A direct read-only run with Node’s test runner completed 24 tests with 24 passes. The baseline package has no test script; the tests use Node’s test API and transpile selected TypeScript modules in-process.

The route-isolation task adds a minimal Playwright configuration and `tests/e2e/route-boundaries.spec.ts`. Those tests cover homepage ownership, client navigation to Atlas, direct secondary routes, news, 404, shared navigation, browser errors and horizontal overflow at desktop `1440x900` and mobile `390x844`. They are new task coverage, not proof of earlier behavior.

There are no baseline automated tests for OpenF1 response/query adaptation, timeout/cache behavior, weather/results/race-control/lap services, APIs, live polling, standings, loading/error/stale/offline states, timezone validity/DST, Las Vegas boundaries, current-session semantics, hydration or route ownership.

### Confirmed technical debt and user impact

1. **Parallel calendar models have diverged.** `race-calendar.ts`, `season-2026.ts` and `circuit-registry.ts` duplicate date/timezone/event facts. The Las Vegas and Abu Dhabi defects demonstrate real user impact: wrong current-event selection and a potential render failure.
2. **Session state is not modeled.** There is no reliable distinction among scheduled, current/live, delayed, suspended, finished and cancelled. UI can label the next session immediately after its predecessor begins and cannot derive safe polling behavior.
3. **Status/time logic is duplicated.** Selection, next-session, countdown and race-week progress logic exists in `season-2026.ts`, `race-detail.ts`, HomepageV3, SeasonAtlas, MobileRaceDock and RaceDetailView with different refresh lifecycles.
4. **External responses are not runtime validated.** Upstream shape changes can become incorrect displays or runtime operations rather than a typed schema failure.
5. **Feature services duplicate provider concepts.** Results, laps, weather and race control each redeclare meeting/session types and discovery loops, with different meeting limits and session eligibility rules.
6. **Freshness and provenance are lost.** UI results generally do not include provider, fetched time, stale time, cache origin or typed error. Users cannot tell current live data from cached or stale data.
7. **The live route polls mock data.** It consumes network/browser work every ten seconds and calls itself auto-refresh without a real provider or failure state.
8. **Race Weekend can select unrelated history.** A discovery failure can present hard-coded 2024 session context without an explicit user decision.
9. **Standings combine identity and mock competition state.** The page warns that it awaits a verified snapshot, but still renders numeric driver points and derived constructor totals; readers may interpret them as current standings.
10. **Lap “latest” values depend on upstream ordering.** The adapter overwrites latest lap, position, interval and stint while iterating without an explicit per-driver timestamp/lap sort.
11. **Event detail and weather availability disagree.** The event detail/mobile dock say reliable weather is not connected, while `/weather` can show OpenF1 samples; the paths are not joined by a shared event/session aggregate.
12. **Dead/legacy surfaces remain.** `ImmersiveHomepage`, `ScheduleView`, `RaceCountdown`, `LivePulsePanel`, `DriverCharts`, mock race-control/schedule exports and `getScheduleCalendar()` have no current caller. They increase architectural ambiguity even if tree-shaking keeps them out of runtime bundles.
13. **The calendar monitor parses TypeScript with regular expressions.** Structural formatting changes can reduce parsed records without a schema/compiler-level error.

### Brand migration status

Public application metadata and current rendered components use LAPMETRY. `README.md` records that the repository and Vercel URL were intentionally preserved during the migration.

Remaining identifiers fall into different risk categories:

- **Public/SEO:** `src/app/layout.tsx` uses `https://pitwallcn.vercel.app`, while sitemap and robots use `https://pitwallcn-57ny.vercel.app`. The old deployment slug is intentionally retained, but differing canonical hosts can split indexing/share identity.
- **Technical package/deployment:** package name `grid-delta-cn`, repository slug `pitwallcn`, Vercel URLs and path references remain. These are normally not rendered as product branding.
- **Persistent browser keys:** `griddelta-atlas-favorites-v1`, `gd:atlas-return-state`, `gd:navigation-*` and `gd:schedule-time-mode` remain. Blind renaming would make existing favorites/navigation/time-mode data appear lost; any rename needs an explicit migration.
- **CSS/internal identifiers:** `gd-*` shell classes and theme token names remain invisible technical names.
- **Documentation:** `docs/atlas-v2-handoff.md` still describes `GRIDDELTA CN / SEASON ATLAS` and contains historical `pitwallcn` paths/previews. It can mislead maintainers but does not affect users.
- **Untracked historical artifacts:** existing output/screenshots contain older GRIDDELTA copy. They are not current source or served UI and should not be treated as current-product evidence.

The route/data task should not bulk-replace these identifiers. The user impact ranges from none (internal names) to lost local preferences (storage keys) and inconsistent canonical URLs (SEO metadata).

### Uncertainties and missing capabilities

- No paid/official future live-data provider, licence, entitlement, quota or SLA has been selected. OpenF1 is the only implemented runtime external provider.
- There is no verified current standings source, no enabled news source and no durable Race Outlook generation scheduler/store.
- The repository does not define official session end times or ingest explicit session lifecycle signals, so “live” cannot be inferred reliably from current fields.
- No last-known-good persistent data store or mainland-access mirror is implemented.
- There is no evidence that the generic OpenF1 proxy or normalized race-control/standings API routes are needed by a current client.
- Circuit length/lap sources are aggregated into registry metadata; per-field provenance is not recorded. Madrid metrics remain missing.
- Real-device behavior remains a manual concern even where desktop/mobile browser automation exists.
- Baseline/output artifacts from earlier homepage verification are historical and include old branding; they do not establish current route behavior.

These missing areas are not claimed as implemented. The proposed incremental foundation is documented separately in [`race-week-foundation.md`](./race-week-foundation.md).
