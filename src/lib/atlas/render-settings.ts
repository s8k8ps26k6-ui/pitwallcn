export type AtlasTimeMode = "live" | "fixed";

export type AtlasRenderSettings = {
  exposure: number;
  nightSurfaceFloor: number;
  daylightStrength: number;
  saturation: number;
  cityLightsIntensity: number;
  cloudsOpacity: number;
  atmosphereAlpha: number;
  bloomStrength: number;
  vignetteStrength: number;
  gridOverlay: boolean;
  timeMode: AtlasTimeMode;
  fixedUtc: string;
  dayFactorDebug: boolean;
  dayTextureDebug: boolean;
};

/**
 * Calibrated production defaults. The debug panel can temporarily override
 * these values for the current browser session, but nothing is persisted.
 */
export const ATLAS_RENDER_DEFAULTS: AtlasRenderSettings = {
  exposure: 1.08,
  nightSurfaceFloor: 0.28,
  daylightStrength: 1,
  saturation: 0.94,
  cityLightsIntensity: 0.38,
  cloudsOpacity: 0.8,
  atmosphereAlpha: 0.72,
  bloomStrength: 0.08,
  vignetteStrength: 0.72,
  gridOverlay: false,
  timeMode: "live",
  fixedUtc: "2026-07-19T16:09:00.000Z",
  dayFactorDebug: false,
  dayTextureDebug: false,
};

export function getAtlasFixedUtcInputValue(utcValue: string) {
  const date = new Date(utcValue);
  if (Number.isNaN(date.getTime())) return "2026-07-19T16:09";

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}T${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

export function toAtlasFixedUtc(value: string) {
  const date = new Date(`${value}:00.000Z`);
  return Number.isNaN(date.getTime())
    ? ATLAS_RENDER_DEFAULTS.fixedUtc
    : date.toISOString();
}
