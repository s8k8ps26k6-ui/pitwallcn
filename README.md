# LAPMETRY

**Motorsport first. Data second.**

LAPMETRY 是一个面向中文 F1 观众的独立数据与赛道可视化项目（F1 / Motorsport Data Intelligence）。它将比赛日程、成绩、赛控信息、圈速、天气与赛季空间信息组织为可以探索的网页体验。

LAPMETRY is an independent, unofficial Chinese-language Formula 1 data and race-context visualization project. It combines race data interfaces with an interactive season Atlas and circuit-oriented experiences.

- **Repository:** https://github.com/s8k8ps26k6-ui/pitwallcn
- **Demo URL documented in the project:** https://pitwallcn-57ny.vercel.app (availability must be verified independently)
- **Repository homepage URL:** https://pitwallcn.vercel.app (as configured in GitHub settings; availability not verified here)
- **Project type:** community-oriented fan-made software, not affiliated with Formula 1 or FIA.

> **Development and licensing status:** This is a publicly visible development repository. A software license has not yet been approved by the maintainer, so public visibility does not by itself grant permission to reuse or redistribute the code. Stable features on `main` and experimental development branches may differ. See [maintainer evidence and pending steps](docs/OPEN_SOURCE_MAINTENANCE.md).

## Project scope and status

| Area | What is in the repository |
| --- | --- |
| Race data | Routes and services for results, race control, lap analysis, weather, drivers and standings |
| Race context | Race calendar, race-weekend views and route-specific presentation |
| Atlas and circuits | Season Atlas, circuit outlines, race-detail helpers and associated unit tests |
| Product work | Design and architecture notes, prototypes and separate development branches |
| Maintenance | Issues, pull requests, contribution and security guidance, and automated code-quality checks |

**Important:** A route or prototype existing in the source does not guarantee that every live dataset, session or deployment URL is currently operational. Some features use static or mock data, while others depend on OpenF1 availability. We aim to communicate missing or delayed data explicitly.

## Current Modules

- `/` Home dashboard
- `/schedule` Race calendar and next-race countdown
- `/race-control` Race Control message feed
- `/race-weekend` Race-weekend recap page
- `/results` Session results and classification table
- `/lap-analysis` Lap, stint, position and interval analysis
- `/weather` Track-weather dashboard
- `/drivers` Driver index and detail pages
- `/standings` Drivers and constructors standings interface
- `/live` Live timing interface prototype
- `/atlas-v2` Interactive 2026 season Atlas route
- `/project` Product and design change log
- `/races` Race-oriented routes and detail experiences (see source for supported paths)

## Data Sources

- Verified local race calendar for schedule structure
- OpenF1 for available race-weekend data, including race control, session results, lap data and weather samples
- Formal empty states when a selected session has no available data

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Recharts
- OpenF1 API
- Vercel deployment

## Historical Changelog (README notes)

The following entries describe earlier product milestones. They are **not** independently published GitHub Releases, and the current architecture includes later work on separate branches.


### v1.8 Race Weekend Recap

- Added `/race-weekend` single-session recap page
- Combined session results, race-control messages, lap-analysis summary and weather data into one overview
- Added Race Weekend Recap entry to the home dashboard and sitemap

### v1.7 Brand Migration

- Standardized the public-facing brand as LAPMETRY
- Updated public copy and metadata while preserving existing technical identifiers
- Kept the repository name and Vercel URL unchanged to avoid unnecessary deployment risk

### v1.6 Weather Center

- Added `/weather` track-weather page
- Added OpenF1 weather samples: track temperature, air temperature, humidity, pressure, rainfall, wind direction and wind speed
- Added weather shortcut beside the LAPMETRY brand instead of crowding the main navigation

### v1.5 Loading and Performance

- Added route-level loading state
- Reduced selector-loading latency for OpenF1 data pages
- Improved perceived response when moving between data-heavy pages

### v1.4 Home Dashboard Update

- Added Race Weekend Command Center section
- Added stronger links between results, race control, lap analysis and schedule
- Added Results module to the home dashboard module grid

### v1.3 Results Center

- Added `/results` page
- Added OpenF1 `session_result` integration
- Added result table, session shortcuts and result summary strip

### v1.2 Race Control and Lap Analysis

- Added OpenF1 Race Control feed
- Added OpenF1 Lap Analysis data services
- Added Chinese rule-based translation for common race-control messages
- Fixed numeric position sorting in lap analysis

### v1.1 Base Dashboard

- Built the initial dashboard structure
- Added home, schedule, live timing, drivers, standings and lap-analysis interfaces
- Established the dark F1 data-dashboard visual direction

## Roadmap

Near-term:

- Improve race-weekend recap depth and cross-module linking
- Connect driver pages with recent results
- Improve standings data source or maintain a reliable local standings model
- Add clearer error states for temporary OpenF1 downtime
- Improve weather sample coverage and session-level explanations

Medium-term:

- Add team and driver comparison views
- Add stronger server-side caching for external data
- Improve mobile performance
- Prepare a mirror/caching strategy if mainland access becomes a real issue

## Local Development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build production version:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

Run local quality checks:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

Browser E2E checks (optional; installs a Chromium browser first):

```bash
npm run test:e2e:install
npm run test:e2e
```

A GitHub Actions quality workflow runs lint, TypeScript checks, unit tests and build checks for pull requests and pushes to `main`. Each check's result must be verified in its actual workflow run.

## Contributions, maintenance and security

- [Contribution guide](CONTRIBUTING.md): how to propose changes and record validation evidence.
- [Security policy](SECURITY.md): responsible vulnerability reporting.
- [Maintainer activity and evidence](docs/OPEN_SOURCE_MAINTENANCE.md): where to inspect code, tests, PRs, and ongoing work.
- [Pull requests](https://github.com/s8k8ps26k6-ui/pitwallcn/pulls) and [issues](https://github.com/s8k8ps26k6-ui/pitwallcn/issues) are the source of record for contributions and triage.

**License decision pending.** Before this repository is described as open-source software, the maintainer must choose an appropriate license and complete a third-party asset rights review. See the outstanding checklist in `docs/OPEN_SOURCE_MAINTENANCE.md`. Please discuss substantial outside code submissions first.

## Notes

LAPMETRY avoids unnecessary frontend third-party resources where possible. Major external data requests are handled through service files, which makes future caching and mirror deployment easier.

## Disclaimer and third-party rights

LAPMETRY is an unofficial fan-made project. It is not affiliated with Formula 1, FIA, OpenF1, any Formula 1 team or any driver. Formula 1 and related marks belong to their respective owners. Third-party APIs, fonts, imagery, geographic data and other assets remain subject to their own terms; including them in this repository does not imply that the maintainer can relicense them. Data availability depends on upstream sources and may be incomplete or delayed for some sessions.
