# LAPMETRY Atlas 2.0 — prototype audit

Review date: 2026-11-02 Asia/Shanghai. Status: implementation available; **globe visual/performance acceptance blocked by environment**. This is not release approval.

## Baseline and branch assessment

| Ref | Head | Assessment |
| --- | --- | --- |
| main | fed7ef858ff40a04a94aca941bbefde2e41120c7 | Chosen reproducible integration baseline; latest main includes OSS foundation. Not asserted to contain the latest approved visual work. |
| codex/homepage-visual-reset-recovery-20260908 | 1f8db583801759fa341045539f1bacd8b702953e | 8 commits unique to this branch, 1 unique to main. Circuit geometry, responsiveness, flag and recovery QA remain unmerged. |
| codex/race-week-visual-reset-implementation-20260911 | 89d99ee8b2a61577bf01745d20be13e273314cba | 15 unique commits, including the 8 Recovery commits. Adds weekend progression, venue environments and tests. |
| automation/atlas-calendar-41297725927 | fed7ef858ff40a04a94aca941bbefde2e41120c7 | Same head as main. |
| codex/lapmetry-data-experience | 5c44fd467ec529a75a78856fa20a4ad44f5f9542 | Older data experience work, inspected as a related development head. |
| agent/adaptive-viewport-preview | 5c6ca1b6f7e7e8f7dc14c88230836e276d074c3d | Older homepage preview branch; not brought into scope. |

All fetched remote branches were listed by commit date. No newer Atlas-path commits appeared after 2026-09-12 across those refs. The unmerged Recovery/Race Week trees change Homepage, Calendar, layout and shared styles; they must not be merged wholesale for this experiment. Their Atlas wrapper/style changes are not new globe renderer features. They remain important integration work for a separate review.

Working branch: `work/atlas-2-globe-raceweek-prototype-20261102`. No main merge or production deployment is authorized or performed.

## Existing architecture

`/atlas-v2` → `SeasonAtlas` → `AtlasGlobe` → R3F Canvas → suspended AtlasScene. Drei supplies OrbitControls, Html labels, texture loading and desktop Effects. Three.js supplies shaders, geometry and bloom. There is no renderer replacement.

`season-2026.ts` owns the 22 event definitions and UTC weekend selection. `events-2026.ts` joins the local officialRaceCalendar2026 Session records; `circuit-registry.ts` supplies outlines, location, timezone, length and lap count. The shared SiteShell already recognizes `/atlas-v2*` as immersive. Root metadata, font CSS, navigation memory and global styles still apply. The new route needs no Homepage, Calendar or shell change.

### Initialization and lifetime

Canvas initializes a WebGLRenderer with antialiasing, opaque output, high-performance preference and ACES tone mapping. Three r184 requires WebGL2. The existing wrapper probes WebGL2 and then WebGL1, which can incorrectly accept a WebGL1-only environment, and does not explicitly lose its temporary context. It conditionally mounts the Canvas when supported; scene changes are props, without a selected-race key. Scene readiness is a React effect, not a first rendered frame measurement.

The prototype probes WebGL2 only and immediately releases the temporary context using WEBGL_lose_context. Canvas is mounted in one stable position, separate from panel state. Sheet, timeline and selected-race updates have no Canvas key or conditional mount. Context loss pauses the loop and shows a status; restoration resumes it. Texture/scene errors have an error boundary, but real restoration and memory-pressure behavior remain unverified. Leaving the route intentionally unmounts its renderer; there is no promise of keeping GPU state alive across route navigation.

### Rendering and resources

Earth uses custom day/night GLSL, solar direction, a night-floor, focus illumination, optional grid, relief-like neighboring texture samples, a separate drifting cloud sphere and atmosphere. Desktop uses a bloom postprocess; compact mode disables bloom. Stars, focus particles and labels also update per frame. Visual darkness, cloud contrast, focus tint and label density can affect perceived quality independently of frame rate; none can be diagnosed as a GPU bottleneck from source alone.

Baseline DPR caps: 1.25 compact; 1.7 desktop. The renderer runs `always` while active and `never` when inactive. ViewportSync also sets DPR, size and camera projection on resize/orientation. Damping, idle rotation and particles explain a continuous loop; replacing it with demand rendering without explicit invalidation would break animations. The prototype preserves that loop and additionally pauses it while a compact full sheet covers the globe, without unmounting Canvas.

Measured disk bytes and decoded image dimensions are in `asset-measurements.json`. These are reproducible file measurements, not observed GPU memory:

| Asset | Dimensions | File bytes | RGBA8 + full mip-chain estimate |
| --- | --- | ---: | ---: |
| day | 2048×1024 | 1,912,469 | 10.67 MiB |
| night | 3600×1800 | 794,479 | 32.96 MiB |
| clouds | 2048×1024 | 829,367 | 10.67 MiB |
| optional desktop day | 8192×4096 | 24,147,269 | 170.67 MiB |

The base three maps total about 54.29 MiB under that explicit estimate. Optional desktop promotion retains the base day texture in the useTexture cache, raising texture-only estimate to about 224.96 MiB. Driver formats, render targets, MSAA, geometry and decoded CPU images are excluded. The 8K promotion is desktop-only, Europe-context-only and maxTextureSize-gated, not a GPU memory-budget check. The night map remains relatively large even on mobile. Asset downsampling is a follow-up candidate, not a claimed measured speedup.

High-detail textures, bloom pass and manually created geometries have explicit disposal paths. Shared useTexture cache entries can survive scene unmount by design; repeated route cycles need real-device memory inspection. A renderer supporting 8192 textures does not establish that 8K promotion is safe on a low-memory device.

### Interaction

Global mode represents nine European stations via the Europe entry. Europe focus retains its plate and individual stations. Station focus retains node selection, camera flight and labels. RaycastMagnet uses angular acquisition, visibility filtering, mouse/touch travel thresholds and a 520ms tap window; OrbitControls handles rotation and zoom with damping and cancels camera flights when the user starts interacting. Camera flights last roughly 1.18–1.35 seconds by code configuration, which is an intentional animation duration, not measured input latency. Hover stabilization and flight suspension can also contribute to perceived delay.

Prototype-only framing adjusts the vertical FOV from a 50-degree minimum-axis field so a portrait viewport can hold the full globe at the existing automatic focus distance. Close zoom and station focus can still crop the sphere intentionally. This mathematical framing is not visually accepted because WebGL is blocked here. The original route keeps its original framing defaults.

The sheet is a sibling above the globe. Its handle uses pointer capture and `touch-action:none`; its content uses `pan-y` and contained overscroll. It has collapsed, 52%-height partial, and full positions. Only the handle drags; content scrolling never rotates the globe. Buttons and ArrowUp/ArrowDown provide alternatives. The sheet is a nonmodal region, not a focus-trapping dialog. Reduced motion removes transitions; page visibility pauses rendering. Root/viewport overflow uses `clip` to prevent focus-triggered hidden scrolling, observed and repaired in browser QA.

## Data truth and synchronization

Default selection calls the existing season selector on the browser clock, refreshed every minute and on focus/visibility change. It uses current weekend, next event outside a weekend, and last event after the 2026 season. Selecting a globe node and selecting the accessible event control share one handler. Europe entry changes region; event selection updates panel and station focus and lowers a full sheet to partial. Current-schedule reset clears manual selection and reuses automatic selection. No current event name or date is hardcoded.

Session records are marked unconfirmed when the source flag/time is missing. A past scheduled start is labeled only as elapsed schedule time: it is not live state, completion, lap progress or a result. Weather, race-control feed and lap counts are explicitly unavailable rather than simulated. Calendar sources are reused repository data and were not revalidated online in this implementation. The UTC whole-day weekend boundary is inherited and can differ from event-local date boundaries. The runtime browser clock used by this environment was 2026-11-01 UTC; do not interpret captured Mexico labels as hardcoded to review date.

## Actual measurement and acceptance limits

The cloud browser reported `GL_VENDOR = Disabled, GL_RENDERER = Disabled` and failed WebGL context creation. See raw `qa/browser-webgl-errors.json`. The first attempt exposed a blank scene because renderer creation failed asynchronously; the WebGL2 preflight now gives an explicit fallback. There is no successful globe frame in these screenshots.

| Comparison | Existing /atlas-v2 | Prototype | Conclusion |
| --- | --- | --- | --- |
| Globe first-frame time | Not obtained | Not obtained | No load-time comparison possible |
| Frame intervals / GPU timings / device FPS | Not obtained | Not obtained | No performance gain claimed |
| Earth assets, DPR caps | Existing tiers | Same tiers | No claim of reduced texture memory |
| Temporary capability context | No explicit release; accepts WebGL1 | Explicit release; WebGL2 only | Source-level lifecycle improvement |
| Opaque full mobile sheet | Not present | Loop paused, Canvas retained | Architectural saving; GPU impact unmeasured |
| Panel updates vs Canvas lifecycle | Existing stable renderer tree | Stable renderer tree | Code reviewed; live identity check awaits working WebGL |
| CSS viewports | Not measured here | 390×844, 430×932; desktop 1363×936 | Actual layout observations only |

`?measure=1` opt-in adds Canvas data attributes for mount time, first submission observed on the following animation frame, CPU frame interval, preceding renderer draw calls, texture count and geometry count. This is not GPU timing. Normal prototype use disables probe DOM writes to avoid measurement overhead. Use browser Performance/Memory tools on a production preview for meaningful comparisons with equivalent viewport, DPR, cache, selected station and interaction sequence.

## QA status and reproduction

Run `npm ci`, `npm run dev`, open `/atlas-v2/prototype`. Isolated CSS viewport harnesses: `/atlas-v2/prototype/qa?viewport=390` and `?viewport=430`. They use the same component with a sized query container; they are **not mobile-browser emulation, touch hardware or WebKit**. No CSP/iframe restrictions were relaxed. `scripts/next-dev.mjs` only translates the managed preview runner's --host flag to Next's --hostname and removes its unsupported --strictPort flag; no production config changes.

Observed in cloud Chromium fallback: collapsed summary, button to partial, handle drag to full, keyboard ArrowUp, Japanese event selection updating Suzuka and circuit data, full-to-partial selection coordination, and zero root/window scroll. Container geometry is saved as raw JSON. Screenshot labels include fallback to prevent confusion. Safe-area CSS exists, but a desktop container has no iPhone safe-area inset; the hardware keyboard, browser address bar and notches remain untested.

Required commands and final results are recorded in `qa/RESULTS.md`. Build, typecheck, lint, unit tests and whitespace checks must pass. E2E invocation is blocked by a missing Playwright Chromium executable, not an assertion failure in application code. New E2E coverage includes fallback sheet gestures and a live Canvas identity check, but is not marked passed.

Remaining acceptance gates: actual globe appearance/occlusion at all three sizes; node hit targets and two-finger zoom; frame consistency through sheet motion; context loss/recovery; repeated route memory; real iPhone Safari portrait/landscape, address bar and safe-area behavior; completed E2E run. Do not merge or call this production-ready until these gates and the user's visual review are complete.
