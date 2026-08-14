/**
 * A deliberately conservative extension point for venue sandtables. The Atlas
 * outline data is verified; no surrounding building, terrain, or grandstand
 * geometry is drawn until it has its own source and verification date.
 */
export type VenueModel = {
  circuitId: string;
  fidelity: "track-verified" | "venue-verified";
  source: string;
  lastVerified: string;
  note: string;
};

export function getVenueModel(circuitId: string): VenueModel {
  return {
    circuitId,
    fidelity: "track-verified",
    source: "bacinger/f1-circuits GeoJSON (MIT) / LAPMETRY circuit registry",
    lastVerified: "2026-07-26",
    note: "Verified track centreline. Venue terrain and structures are pending dedicated source verification.",
  };
}
