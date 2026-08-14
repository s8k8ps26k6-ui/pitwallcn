"use client";

import { useCallback } from "react";
import {
  ATLAS_RENDER_DEFAULTS,
  getAtlasFixedUtcInputValue,
  toAtlasFixedUtc,
  type AtlasRenderSettings,
} from "@/lib/atlas/render-settings";
import type { SolarState } from "@/lib/atlas/solar";
import styles from "./season-atlas.module.css";

type AtlasDebugPanelProps = {
  settings: AtlasRenderSettings;
  onChange: (next: AtlasRenderSettings) => void;
  solarState: SolarState;
};

type RangeControlProps = {
  label: string;
  setting: keyof Pick<
    AtlasRenderSettings,
    | "exposure"
    | "nightSurfaceFloor"
    | "daylightStrength"
    | "saturation"
    | "cityLightsIntensity"
    | "cloudsOpacity"
    | "atmosphereAlpha"
    | "bloomStrength"
    | "vignetteStrength"
  >;
  min: number;
  max: number;
  step: number;
  settings: AtlasRenderSettings;
  onChange: (next: AtlasRenderSettings) => void;
};

function RangeControl({
  label,
  setting,
  min,
  max,
  step,
  settings,
  onChange,
}: RangeControlProps) {
  const value = settings[setting];

  return (
    <label className={styles.debugRange}>
      <span>
        {label}
        <output>{value.toFixed(2)}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange({ ...settings, [setting]: Number(event.target.value) })
        }
      />
    </label>
  );
}

export function AtlasDebugPanel({ settings, onChange, solarState }: AtlasDebugPanelProps) {
  const copySettings = useCallback(async () => {
    const payload = JSON.stringify(settings, null, 2);

    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      // The panel is only an opt-in local calibration helper. Clipboard access
      // can be blocked by a preview iframe without affecting the scene.
    }
  }, [settings]);

  return (
    <aside className={styles.debugPanel} aria-label="Atlas render calibration">
      <div className={styles.debugHeader}>
        <span>ATLAS CALIBRATION</span>
        <small>SESSION ONLY</small>
      </div>

      <div className={styles.debugSolar}>
        <span>UTC</span>
        <output>{solarState.utc.replace("T", " ").replace(".000Z", "Z")}</output>
        <span>SUBPOINT</span>
        <output>
          {solarState.latitude.toFixed(2)}° {solarState.latitude >= 0 ? "N" : "S"} / {Math.abs(solarState.longitude).toFixed(2)}° {solarState.longitude >= 0 ? "E" : "W"}
        </output>
        <span>DIRECTION</span>
        <output>{solarState.direction.map((value) => value.toFixed(3)).join(" / ")}</output>
      </div>

      <RangeControl label="Exposure" setting="exposure" min={0.7} max={1.35} step={0.01} settings={settings} onChange={onChange} />
      <RangeControl label="Night floor" setting="nightSurfaceFloor" min={0.1} max={0.42} step={0.01} settings={settings} onChange={onChange} />
      <RangeControl label="Daylight" setting="daylightStrength" min={0.65} max={1.25} step={0.01} settings={settings} onChange={onChange} />
      <RangeControl label="Saturation" setting="saturation" min={0.65} max={1.15} step={0.01} settings={settings} onChange={onChange} />
      <RangeControl label="City lights" setting="cityLightsIntensity" min={0} max={0.8} step={0.01} settings={settings} onChange={onChange} />
      <RangeControl label="Clouds" setting="cloudsOpacity" min={0} max={1.2} step={0.01} settings={settings} onChange={onChange} />
      <RangeControl label="Atmosphere" setting="atmosphereAlpha" min={0} max={1.2} step={0.01} settings={settings} onChange={onChange} />
      <RangeControl label="Bloom" setting="bloomStrength" min={0} max={0.3} step={0.01} settings={settings} onChange={onChange} />
      <RangeControl label="Vignette" setting="vignetteStrength" min={0} max={1} step={0.01} settings={settings} onChange={onChange} />

      <label className={styles.debugToggle}>
        <span>Grid overlay</span>
        <input
          type="checkbox"
          checked={settings.gridOverlay}
          onChange={(event) => onChange({ ...settings, gridOverlay: event.target.checked })}
        />
      </label>
      <label className={styles.debugToggle}>
        <span>Day factor grayscale</span>
        <input
          type="checkbox"
          checked={settings.dayFactorDebug}
          onChange={(event) => onChange({ ...settings, dayFactorDebug: event.target.checked })}
        />
      </label>
      <label className={styles.debugToggle}>
        <span>Day texture only</span>
        <input
          type="checkbox"
          checked={settings.dayTextureDebug}
          onChange={(event) => onChange({ ...settings, dayTextureDebug: event.target.checked })}
        />
      </label>
      <label className={styles.debugToggle}>
        <span>Live UTC</span>
        <input
          type="checkbox"
          checked={settings.timeMode === "live"}
          onChange={(event) =>
            onChange({ ...settings, timeMode: event.target.checked ? "live" : "fixed" })
          }
        />
      </label>
      {settings.timeMode === "fixed" ? (
        <label className={styles.debugDate}>
          <span>Fixed UTC</span>
          <input
            type="datetime-local"
            value={getAtlasFixedUtcInputValue(settings.fixedUtc)}
            onChange={(event) => onChange({ ...settings, fixedUtc: toAtlasFixedUtc(event.target.value) })}
          />
        </label>
      ) : null}

      <div className={styles.debugActions}>
        <button type="button" onClick={() => onChange(ATLAS_RENDER_DEFAULTS)}>
          RESET
        </button>
        <button type="button" onClick={copySettings}>
          COPY SETTINGS
        </button>
      </div>
    </aside>
  );
}
