# Pitwall CN

Dark, mobile-first Formula 1 data dashboard built with Next.js (App Router), TypeScript, Tailwind CSS, and Recharts.

## Features
- Home overview placeholders for countdown, standings, and latest results.
- Live Timing page with 10-second auto-refresh UI.
- Race Control feed with flags and incidents.
- Driver detail dynamic route at `/drivers/[driverCode]`.
- Mock API layer at:
  - `/api/f1/standings`
  - `/api/f1/live`
  - `/api/f1/race-control`

## Setup
1. Copy environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```

Then open `http://localhost:3000`.

## Notes for future API integration
- Keep API keys server-side in environment variables.
- Extend `src/lib/f1-service.ts` to switch from mock data to OpenF1 requests.
- Keep client pages calling internal `/api/f1/*` endpoints.
