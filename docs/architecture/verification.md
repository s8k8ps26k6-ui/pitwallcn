# Route-isolation verification record

## Scope and environment

This is the command and browser-evidence ledger for the LAPMETRY route-isolation task. It distinguishes successful final verification from exploratory failures and from issues that were already present on the selected baseline.

- Verification date: 2026-08-14 (Asia/Shanghai).
- Selected baseline: `a2c54ea9` on `codex/rebrand-lapmetry`, the head of Draft PR #54 and a strict two-commit descendant of `codex/velocity-at-dawn-homepage` at `0663694c`.
- Task branch: `codex/lapmetry-route-architecture-foundation`.
- Package manager: npm, selected from the tracked `package-lock.json` (lockfile version 3) and repository scripts.
- Local runtime: Node `v24.15.0`, npm/npx `11.12.1`. The repository does not currently declare an `engines` field, `.nvmrc`, `.node-version` or `packageManager` version.
- Test viewports: desktop Chromium at `1440x900`; mobile Chromium at `390x844`.
- The pre-task `.gitignore` modification and untracked Playwright/log/image/output artifacts were excluded from every task commit.

## Baseline and repository evidence

| Command or read-only check | Result |
| --- | --- |
| `git status --porcelain=v2 --branch --untracked-files=all` | Initial branch was `codex/rebrand-lapmetry` at `a2c54ea9`, exactly even with its upstream. It also identified the user-owned `.gitignore` edit and untracked artifacts that this task preserves. |
| `git branch -vv --all`, `git log --all --decorate --graph`, `git remote -v` | Confirmed the branch topology and GitHub origin. |
| `git rev-list --left-right --count origin/main...origin/codex/velocity-at-dawn-homepage` | `4 46`: the velocity line and `main` have diverged; velocity contains the large unmerged homepage line. |
| `git rev-list --left-right --count origin/codex/velocity-at-dawn-homepage...origin/codex/rebrand-lapmetry` | `0 2`: the LAPMETRY branch is the velocity line plus the brand migration and homepage-dock fix. |
| GitHub pull-request reads for PRs #53 and #54 | PR #53 is an open Draft from velocity to `main`; PR #54 is an open Draft from rebrand to velocity. This is why the task branch starts at PR #54's head and its Draft PR is stacked on `codex/rebrand-lapmetry` while #54 remains open. |
| `rg --files` plus focused `rg`/source reads under `src/app`, `src/components` and `src/lib` | Established the route/layout/component/data inventory documented in `current-state.md`. |

## Final automated verification

The commands below were run from the repository root after the implementation and test configuration were complete.

| Command | Final result | Evidence and relevant output |
| --- | --- | --- |
| `npm.cmd ci --no-audit --no-fund` | Pass | Installed 457 packages from the tracked lockfile in 168.3 seconds. |
| `npm.cmd run test:e2e:install` | Pass | Provisioned the Chromium binary required by the new minimal Playwright suite. |
| `npm.cmd run lint` | Pass | ESLint exited 0 with no reported errors or warnings. |
| `npm.cmd run typecheck` | Pass | `tsc --noEmit --incremental false` exited 0. |
| `npm.cmd run test:unit` | Pass | Node's test runner completed 24/24 tests across the five Atlas test files and the calendar-monitor test; no failures, skips or cancellations. Node emitted the existing module-type reparsing warning because the package has no `type: module`. |
| `npm.cmd run test:e2e` | Pass | Playwright completed 20/20 route-boundary cases (10 per project) in about 2.4 minutes. |
| `npm.cmd run build` | Pass | Next.js 15.5.19 completed the production build and generated 37 static pages. The final run fell back to `@next/swc-wasm-nodejs` because a native SWC file was locked; compilation and route generation still completed successfully. An earlier standalone build also passed without that fallback. |
| `npm.cmd ls --depth=0` | Pass with environment note | Declared top-level packages resolve. npm also reports `@emnapi/runtime@1.10.0` as extraneous in the local install; it was not added to the manifest or lockfile by this task. |
| `npm.cmd audit --omit=dev --json` | Non-zero; baseline dependency advisories | Reported four high-severity production dependency advisories involving Next.js 15.5.19 and transitive `postcss`, `sharp` and `nanoid`; the suggested Next fix is 15.5.23. Dependency upgrades are outside this route-isolation scope and are not concealed as a passing check. |
| `git diff --check` | Pass | No whitespace errors in the task diff. |

## Browser assertions

The committed suite in `tests/e2e/route-boundaries.spec.ts` covers direct entry and client navigation for `/`, `/atlas-v2`, `/schedule`, `/races/2026/netherlands-gp-2026`, `/race-weekend`, `/news`, a generic 404 and a matched event-detail 404. It proves that the homepage owns one Race Pulse/news dock, that secondary routes do not inherit it, and that the appropriate shared or local navigation remains present.

For every route case, listeners collect console errors, uncaught page errors, failed requests and non-document resource errors. The suite also rejects duplicate browser `/api/` fetch/XHR requests and checks document width for horizontal overflow. The final 20/20 run produced no hydration error, uncaught exception, unexpected failed/resource request, duplicate data request or overflow assertion failure. A reduced-motion homepage case runs in both projects.

### Desktop, 1440x900

- Uses Chromium with WebGL enabled.
- Atlas tests wait for the actual canvas before evaluating browser errors, then navigate away so WebGL cleanup is observed.
- Direct Atlas and homepage-to-Atlas client navigation passed with the globe canvas visible and no WebGL/browser errors.

### Mobile, 390x844

- The committed headless route suite intentionally launches its mobile project with WebGL disabled. It verifies the real responsive no-WebGL fallback, dock operability, reduced-motion behavior, route isolation and overflow without relying on unstable headless GPU teardown.
- A separate headed Chromium smoke ran against the production build at the same `390x844` viewport with WebGL enabled. It waited for the real Atlas canvas, dragged the globe, zoomed it, asserted no horizontal overflow, observed no page error or failed request, and navigated to `/schedule` to exercise canvas teardown. Result: 1/1 passed in 13.8 seconds.
- The reviewed capture showed the full-height globe, Europe/Africa focus and the race overlay within the viewport without visible clipping.
- That production smoke surfaced one console resource error for `/favicon.ico` returning 404. The baseline has no favicon file or metadata icon. It is pre-existing, unrelated to the route composition change and remains recorded as unresolved rather than being silently broadened into this task.

## Investigated failed attempts

These attempts are not presented as final failures; each task-caused issue was diagnosed and followed by a clean standalone rerun.

1. A first `npm.cmd ci` exceeded the execution window after roughly 184 seconds. No installer process remained. Re-running with `--no-audit --no-fund` completed successfully.
2. An early parallel verification attempt let Playwright's web server and another Next command compete for port/output state. It produced `EADDRINUSE` and transient missing `.next/types` typecheck paths. Verification was serialized; standalone typecheck, E2E and build then passed.
3. Initial E2E iterations exposed incorrect test assumptions: desktop-hidden dock nodes are absent from the accessibility tree, desktop/mobile navigation differs, the intentionally empty news page has no assumed section landmark, generic 404s emit an expected document-console line, and a matched App Router `notFound()` can stream an HTTP 200 document before rendering its 404 boundary. Assertions were changed to the actual route contracts rather than weakening error collection.
4. Headless mobile Chromium with a live WebGL context intermittently stalled during context teardown. The committed mobile route project now validates the explicit no-WebGL responsive state, while the separate headed production smoke provides real-mobile WebGL interaction and cleanup evidence. Desktop E2E continues to exercise real WebGL in the committed suite.
5. During E2E, Next emitted an existing server-side cache warning because one OpenF1 interval payload was about 5.6 MB, above Next's 2 MB incremental-cache item limit. It did not become a browser error or fail the route suite; the data/cache architecture document treats cache design as future Race Week work.
6. `npm.cmd audit --omit=dev --json` exits non-zero for the four dependency advisories listed above. They predate and are not caused by the new development-only Playwright dependency.

## What this verification does not claim

- It does not claim the missing favicon, oversized OpenF1 cache entry, dependency advisories or undeclared Node-version floor are fixed.
- It does not claim the mock live-timing endpoint, static standings or placeholder Race Pulse data are real-time.
- It does not deploy or validate a production environment.
- Preview status is a repository-hosting concern and is reported in the Draft PR/final delivery, not fabricated from local checks.
