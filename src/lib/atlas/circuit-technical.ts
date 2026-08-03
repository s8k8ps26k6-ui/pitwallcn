import type { CircuitOutlinePoint } from "./circuit-registry";

export type TechnicalMarkerKind =
  | "corner"
  | "pit-entry"
  | "pit-exit"
  | "drs-detection"
  | "drs-activation"
  | "speed-trap"
  | "braking";

export type TechnicalMarker = {
  id: string;
  kind: TechnicalMarkerKind;
  position: CircuitOutlinePoint;
  label: string;
  detail: string;
};

export type TechnicalSector = {
  id: "S1" | "S2" | "S3";
  from: number;
  to: number;
};

export type CircuitTechnicalConfig = {
  source: string;
  lastVerified: string;
  startFinish: "outline-origin";
  direction: "outline-order";
  sectors?: readonly TechnicalSector[];
  markers?: readonly TechnicalMarker[];
  notes?: readonly string[];
};

/**
 * A separate map-only registry. Markers are intentionally absent until an
 * event-specific FIA/official circuit map is converted to our normalized
 * coordinate system. This prevents seasonal DRS/over-take rules or locations
 * being guessed from an older track diagram.
 */
export const CIRCUIT_TECHNICAL_2026: Readonly<Record<string, CircuitTechnicalConfig>> = {
  netherlands: {
    source: "FIA 2025 Dutch Grand Prix Circuit Map; F1 circuit guide (facility facts only)",
    lastVerified: "2026-08-04",
    startFinish: "outline-origin",
    direction: "outline-order",
    notes: ["14 turns", "Turn 3 and Turn 14 banking recorded by Formula 1"],
  },
  belgium: {
    source: "FIA 2026 Belgian Grand Prix competition notes / circuit map index",
    lastVerified: "2026-08-04",
    startFinish: "outline-origin",
    direction: "outline-order",
  },
};

export function getCircuitTechnicalConfig(circuitId: string) {
  return CIRCUIT_TECHNICAL_2026[circuitId] ?? null;
}
