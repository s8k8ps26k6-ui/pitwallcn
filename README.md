# Pitwall CN

Pitwall CN is a Chinese-facing, unofficial Formula 1 data dashboard built as a product-style web application rather than a static fan page. It focuses on race-weekend workflows: schedule, race control, results, lap analysis, track weather, drivers and standings.

Live site:

```text
https://pitwallcn-57ny.vercel.app
```

Repository:

```text
https://github.com/s8k8ps26k6-ui/pitwallcn
```

## Project Goal

The goal of Pitwall CN is to make F1 race-weekend data easier to read for Chinese fans.

Most F1 data tools are either English-first, overly technical, or spread across multiple sources. Pitwall CN organizes the information into a mobile-friendly dashboard with Chinese copy, dark motorsport UI, and separate modules for each race-weekend use case.

This project is also intended as a long-term personal portfolio project for front-end engineering, product design, API integration and deployment practice.

## Current Status

Pitwall CN has moved beyond the early mock-data prototype stage. Several modules now use OpenF1-powered data services, while some lower-priority sections may still use local or mock data as placeholders.

Current version focus:

- Real race-weekend data modules where OpenF1 data is available
- Mobile-first dashboard experience
- Server-side data fetching to reduce client-side dependency on external APIs
- Chinese UI and race-control message localization
- Clean incremental development through GitHub branches, pull requests and Vercel deployments

## Core Features

### Home Dashboard `/`

- Dark F1 command-center style landing page
- Next-race card powered by local official race calendar with OpenF1 session enrichment where available
- Race Weekend Command Center linking results, race control, lap analysis and schedule
- Primary module grid for all major sections
- Mobile-first responsive layout

### Schedule `/schedule`

- Local official race calendar foundation
- Next race countdown
- Race-weekend session list
- Designed to avoid broken or incorrect external calendar data overwriting the local verified schedule

### Race Control `/race-control`

- OpenF1 race-control feed integration
- Meeting and session selector
- URL query support, for example:

```text
/race-control?session=11249
```

- Chinese rule-based translation for common race-control messages, including:
  - green flag / yellow flag / red flag
  - safety car / virtual safety car
  - DRS enabled or disabled
  - lap time deleted
  - track limits
  - incidents and investigations
- Formal empty state when no race-control messages are available

### Results `/results`

- OpenF1 `session_result` integration
- Meeting and session selector
- Supports race, sprint and qualifying result sessions where available
- Results table with:
  - position
  - driver number and abbreviation/name
  - team
  - time or gap
  - completed laps
  - status: 完赛 / 退赛 / 未起步 / 取消成绩
- Summary strip for participant count, finishers, abnormal statuses and top driver
- No mock result data

### Lap Analysis `/lap-analysis`

- OpenF1 integration for:
  - laps
  - stints
  - position
  - intervals
  - drivers
- Session selector
- Driver number plus abbreviation/name display, for example: `1 VER`, `4 NOR`, `16 LEC`, `44 HAM`, `81 PIA`
- Numeric position sorting fixed, so `P1/P2/P3` sort correctly instead of lexicographic order such as `P1/P10/P11/P2`
- Formal empty state when no lap data is available

### Weather `/weather`

- OpenF1 weather data integration
- Meeting and session selector
- Latest weather sample card
- Track temperature trend visualization
- Weather sampling table with:
  - track temperature
  - air temperature
  - humidity
  - pressure
  - rainfall
  - wind direction
  - wind speed
- Weather entry is placed beside the Pitwall CN brand instead of crowding the main 4 + 4 navigation grid

### Live Timing `/live`

- Live timing interface prototype
- Ranking, gap, lap and pit-state style layout
- Designed as a future target for deeper live data integration

### Drivers `/drivers` and `/drivers/[driverCode]`

- Driver index and driver detail structure
- Search and filtering experience
- Prepared as a future area for richer driver profiles and recent-result connections

### Standings `/standings`

- Drivers and constructors standings interface
- Current lower-priority module compared with race-weekend pages
- Future target for real championship standings data or a maintained local standings model

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Recharts
- OpenF1 API
- Vercel deployment
- GitHub pull-request workflow

## Architecture Notes

### Server-side API Fetching

Pitwall CN avoids calling OpenF1 directly from the browser for major modules. Data fetching is handled in service files and rendered through Next.js server routes/pages. This keeps the browser focused on loading Pitwall CN itself and makes the project easier to adapt for future caching or China-facing mirrors.

Important service files:

```text
src/lib/race-control-service.ts
src/lib/lap-analysis-service.ts
src/lib/results-service.ts
src/lib/weather-service.ts
src/lib/race-calendar.ts
```

### Data Reliability Strategy

The project separates verified local data from live external data:

- Race calendar: local verified calendar first
- OpenF1: used for sessions, race control, lap analysis, results and weather where available
- Empty states: formal user-facing messages instead of pretending data exists
- Mock data: avoided for real results/race-control/lap-analysis/weather displays

### China-facing Considerations

The project is designed with future China access in mind, but the current priority is building a strong portfolio-quality product first.

Current principles:

- No Google Fonts dependency
- No third-party map embeds
- No unnecessary frontend CDN scripts
- External data requests handled server-side where possible
- Service-layer structure makes future caching or mirror deployment easier

If mainland access becomes a serious issue later, the project can be adapted toward a mirror strategy with server-side caching rather than rewriting the UI.

## Development Workflow

The project is developed with small, controlled changes:

1. Create a clean branch from latest `main`
2. Keep each feature scoped to a small set of files
3. Open a pull request
4. Check changed files before merging
5. Let Vercel build verify the deployment
6. Merge only when the diff is clean and the build passes

This workflow is important because earlier polluted branches showed how easily broad AI-generated edits can accidentally reintroduce outdated dashboards, incorrect schedules or mock data.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

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

## Portfolio Narrative

Pitwall CN can be described as a self-directed motorsport data dashboard project.

A concise resume version:

> Built Pitwall CN, a Chinese-facing Formula 1 race-weekend data dashboard using Next.js, TypeScript, Tailwind CSS and OpenF1. Implemented server-side data modules for race control, session results, lap analysis and track weather, with mobile-first dashboard UI, Chinese race-control localization, formal empty states and Vercel deployment.

A more interview-friendly explanation:

> I wanted to build something connected to my real interest in Formula 1, but not just a fan page. I designed Pitwall CN as a race-weekend command center for Chinese fans. The project separates schedule, race control, results, lap analysis and weather into different modules, and uses OpenF1 where real data is available. I also learned to protect the codebase through GitHub pull requests, changed-file review and Vercel deployment checks.

## AI-assisted Development Disclosure

This project was developed with AI assistance for coding, debugging and iteration. The product direction, feature selection, acceptance checks, UI decisions, testing feedback and deployment decisions were human-led.

This distinction matters: the project is not presented as a purely hand-coded exercise, but as a realistic example of using modern AI tools to build, review and ship a working web product responsibly.

## Roadmap

Near-term:

- Improve mobile interaction speed and page loading states
- Add clearer project screenshots to this README
- Connect driver pages with recent results where possible
- Improve standings data source or maintain a reliable local standings model
- Add better error states for temporary OpenF1 downtime

Medium-term:

- Build individual race-weekend recap pages
- Add team and driver comparison views
- Add stronger caching strategy for external data
- Prepare a China-facing mirror strategy if needed
- Refine UI polish for portfolio presentation

## Disclaimer

Pitwall CN is an unofficial fan-made project. It is not affiliated with Formula 1, FIA, OpenF1, any Formula 1 team or any driver. Data availability depends on public data sources and may be incomplete for some sessions.
