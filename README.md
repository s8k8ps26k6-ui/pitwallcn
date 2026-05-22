# GridDelta CN

GridDelta CN is an unofficial Formula 1 data dashboard for Chinese F1 fans.

Live site:

```text
https://pitwallcn-57ny.vercel.app
```

Repository:

```text
https://github.com/s8k8ps26k6-ui/pitwallcn
```

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

## Public Changelog

### v1.8 Race Weekend Recap

- Added `/race-weekend` single-session recap page
- Combined session results, race-control messages, lap-analysis summary and weather data into one overview
- Added Race Weekend Recap entry to the home dashboard and sitemap

### v1.7 Brand Rename

- Renamed the public-facing project from Pitwall CN to GridDelta CN
- Updated homepage brand text, site metadata, package name and public project copy
- Kept the existing repository name and Vercel URL unchanged for now to avoid unnecessary deployment risk

### v1.6 Weather Center

- Added `/weather` track-weather page
- Added OpenF1 weather samples: track temperature, air temperature, humidity, pressure, rainfall, wind direction and wind speed
- Added weather shortcut beside the GridDelta CN brand instead of crowding the main navigation

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

Run linting:

```bash
npm run lint
```

## Notes

GridDelta CN avoids unnecessary frontend third-party resources where possible. Major external data requests are handled through service files, which makes future caching and mirror deployment easier.

## Disclaimer

GridDelta CN is an unofficial fan-made project. It is not affiliated with Formula 1, FIA, OpenF1, any Formula 1 team or any driver. Data availability depends on public data sources and may be incomplete for some sessions.
