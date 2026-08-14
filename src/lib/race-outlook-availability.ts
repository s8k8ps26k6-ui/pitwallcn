import type { UnifiedRace } from "@/lib/atlas/race-detail";

const VERIFIED_OUTLOOK_EVENTS: ReadonlySet<string> = new Set();

/**
 * Client-safe capability signal. A report is not exposed until verified
 * session/qualifying inputs have been ingested by the server-side pipeline.
 */
export function hasRaceOutlook(race: UnifiedRace) {
  return VERIFIED_OUTLOOK_EVENTS.has(race.eventId);
}
