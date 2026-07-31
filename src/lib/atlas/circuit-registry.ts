import type { AtlasRegion, SeasonRace } from "./season-2026";

export type CircuitStatus =
  | "active"
  | "reserve"
  | "inactive"
  | "historic"
  | "retired";

export type CircuitOutlinePoint = readonly [number, number];

export type CircuitRegistryEntry = {
  id: string;
  name: string;
  aliases: readonly string[];
  country: string;
  city: string;
  region: AtlasRegion;
  latitude: number;
  longitude: number;
  timeZone: string;
  outline?: readonly CircuitOutlinePoint[];
  lengthKm?: number;
  laps?: number;
  status: CircuitStatus;
  source: string;
  lastVerified: string;
};

type CircuitOverride = Partial<
  Pick<
    CircuitRegistryEntry,
    "aliases" | "timeZone" | "outline" | "lengthKm" | "laps" | "status"
  >
>;

const CIRCUIT_OVERRIDES: Record<string, CircuitOverride> = {
  australia: { timeZone: "Australia/Melbourne", lengthKm: 5.278, laps: 58 },
  china: { timeZone: "Asia/Shanghai", lengthKm: 5.451, laps: 56 },
  japan: { timeZone: "Asia/Tokyo", lengthKm: 5.807, laps: 53 },
  miami: { timeZone: "America/New_York", lengthKm: 5.412, laps: 57 },
  canada: { timeZone: "America/Toronto", lengthKm: 4.361, laps: 70 },
  monaco: { timeZone: "Europe/Monaco", lengthKm: 3.337, laps: 78 },
  "barcelona-catalunya": {
    timeZone: "Europe/Madrid",
    lengthKm: 4.657,
    laps: 66,
  },
  austria: { timeZone: "Europe/Vienna", lengthKm: 4.318, laps: 71 },
  "great-britain": { timeZone: "Europe/London", lengthKm: 5.891, laps: 52 },
  belgium: { timeZone: "Europe/Brussels", lengthKm: 7.004, laps: 44 },
  hungary: { timeZone: "Europe/Budapest", lengthKm: 4.381, laps: 70 },
  netherlands: { timeZone: "Europe/Amsterdam", lengthKm: 4.259, laps: 72 },
  italy: { timeZone: "Europe/Rome", lengthKm: 5.793, laps: 53 },
  madrid: { timeZone: "Europe/Madrid" },
  azerbaijan: { timeZone: "Asia/Baku", lengthKm: 6.003, laps: 51 },
  singapore: { timeZone: "Asia/Singapore", lengthKm: 4.94, laps: 62 },
  "united-states": { timeZone: "America/Chicago", lengthKm: 5.513, laps: 56 },
  mexico: { timeZone: "America/Mexico_City", lengthKm: 4.304, laps: 71 },
  "sao-paulo": { timeZone: "America/Sao_Paulo", lengthKm: 4.309, laps: 71 },
  "las-vegas": { timeZone: "America/Los_Angeles", lengthKm: 6.201, laps: 50 },
  qatar: { timeZone: "Asia/Qatar", lengthKm: 5.419, laps: 57 },
  "abu-dhabi": { timeZone: "Asia/Abu_Dhabi", lengthKm: 5.281, laps: 58 },
};

function createCircuitEntry(race: SeasonRace): CircuitRegistryEntry {
  const override = CIRCUIT_OVERRIDES[race.id] ?? {};
  return {
    id: race.id,
    name: race.circuitName,
    aliases: override.aliases ?? [],
    country: race.country,
    city: race.city,
    region: race.region,
    latitude: race.latitude,
    longitude: race.longitude,
    timeZone: override.timeZone ?? "UTC",
    outline: override.outline,
    lengthKm: override.lengthKm,
    laps: override.laps,
    status: override.status ?? "active",
    source: "2026 F1 calendar + circuit registry verification",
    lastVerified: "2026-07-26",
  };
}

/**
 * The registry is deliberately separate from the event/calendar layer. During
 * a circuit change, render code keeps using the circuit id while the season
 * entry selects which active circuit is instantiated.
 */
export function getCircuitRegistry2026(races: readonly SeasonRace[]) {
  return races.map(createCircuitEntry);
}

export function getCircuitForRace(
  race: SeasonRace,
  races: readonly SeasonRace[],
) {
  const circuitId = race.circuitId ?? race.id;
  return getCircuitRegistry2026(races).find((circuit) => circuit.id === circuitId);
}
