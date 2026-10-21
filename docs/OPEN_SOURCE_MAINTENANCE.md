# LAPMETRY: maintainer and project evidence

This document explains how to inspect the project and the ongoing work. It is **not** evidence of download counts, active users, sponsorship, or external adoption. Do not use it to imply metrics that are not measured.

## What the project does

LAPMETRY is an unofficial, Chinese-language Formula 1 data and spatial-visualization project. Its code covers race schedules, results, race control, lap analysis, weather, driver and standings interfaces, and a season Atlas/track-focused experience. It is intended to help readers explore race context and data with legible provenance and state handling.

- Web application: `src/app/`
- F1/data clients and services: `src/lib/`
- Atlas season and circuit helpers: `src/lib/atlas/`
- Components: `src/components/`
- Unit tests: `src/lib/atlas/*.test.ts`, `scripts/*.test.mjs`
- E2E tests: `tests/e2e/`
- Architecture notes: `docs/architecture/`
- Maintainer history: Git commit history and pull requests

Some spatial/visual updates are developed on branches and are **not** part of default-branch releases until reviewed and merged.

## Maintenance process

1. Issues are used to record reproducible bugs, feature proposals and known limitations.
2. Changes are reviewed through pull requests when practical; substantial visual changes require viewport review.
3. GitHub Actions check lint, types, unit tests and production builds for relevant pull requests and updates.
4. A version is considered released only after validation and publication; historical README change notes are not the same thing as GitHub Releases.
5. Security concerns should follow `SECURITY.md`. Public issue discussions must exclude exploitation details and secrets.
6. Data from third-party APIs can be incomplete, delayed, rate limited or unavailable; the UI should make such states visible rather than invent values.

## Evidence for an external application

Link to independently verifiable evidence:

- Repository and visible commit history: https://github.com/s8k8ps26k6-ui/pitwallcn
- PR reviews and completed changes: https://github.com/s8k8ps26k6-ui/pitwallcn/pulls?q=is%3Apr
- Open and closed issues: https://github.com/s8k8ps26k6-ui/pitwallcn/issues
- Checks: https://github.com/s8k8ps26k6-ui/pitwallcn/actions
- Contribution guidance: `CONTRIBUTING.md`
- Roadmap and feature status: `README.md`, `docs/architecture/`

Any user numbers, stars, download counts, deployments, revenue or community reach used in applications must be checked against actual records at the time of submission. Stars should be acquired organically, without manipulation or incentives.

## Licensing and third-party rights

**Decision required:** The maintainer must choose and approve an OSI-recognized license before representing this repository as an open-source project. A public repository alone is not sufficient.

Before licensing, audit asset sources and third-party materials such as:

- F1/FIA, team and driver names, logos, photos or imagery;
- circuit, geography and other geospatial datasets;
- icons, custom graphics, fonts and external snippets;
- OpenF1/API data terms, attribution and redistribution permissions.

A code license cannot grant rights that belong to someone else. External assets should be removed, replaced with permitted assets, or clearly separated and documented as independently licensed or excluded where appropriate.

## Remaining steps (not yet complete)

- [ ] Maintainer selects and approves a code license, after checking asset rights.
- [ ] License is added to the default branch.
- [ ] Current stable functionality is selectively reviewed and merged from development branches.
- [ ] Deployment URL and end-to-end access are verified.
- [ ] GitHub About description and repository topics are filled in by the maintainer.
- [ ] First genuine tagged release is created after checks and validation.
- [ ] Real-world adoption and usage are measured and reported accurately, if available.

The OpenAI Codex for Open Source program makes an independent selection based on usage, ecosystem importance and active maintenance; completing these steps does **not** guarantee selection.
