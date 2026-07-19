"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import dynamic from "next/dynamic";
import {
  AtlasGlobe,
  EUROPE_ENTRY_ID,
  type AtlasViewMode,
} from "./atlas-globe";
import {
  getSeason2026,
  getSeasonRaceSelection2026,
  type SeasonSelectionPhase,
  type SeasonRace,
} from "@/lib/atlas/season-2026";
import {
  ATLAS_RENDER_DEFAULTS,
  type AtlasRenderSettings,
} from "@/lib/atlas/render-settings";
import styles from "./season-atlas.module.css";

const AtlasDebugPanel = dynamic(
  () => import("./atlas-debug-panel").then((module) => module.AtlasDebugPanel),
  { ssr: false },
);

export type AtlasScrollStage = "global-core" | "season-data-reserved";

type WebGLState = "checking" | "ready" | "blocked";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

function useWebGLState() {
  const [state, setState] = useState<WebGLState>("checking");

  useEffect(() => {
    const canvas = document.createElement("canvas");
    let supported = false;

    try {
      supported = Boolean(
        canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ??
          canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }),
      );
    } catch {
      supported = false;
    }

    setState(supported ? "ready" : "blocked");
  }, []);

  return state;
}

function useDocumentVisibility() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return visible;
}

function useSeasonClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return now;
}

function formatRaceDates(race: SeasonRace) {
  const start = new Date(`${race.startDate}T12:00:00Z`);
  const end = new Date(`${race.endDate}T12:00:00Z`);
  const month = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    timeZone: "UTC",
  })
    .format(start)
    .toUpperCase();
  const startDay = String(start.getUTCDate()).padStart(2, "0");
  const endDay = String(end.getUTCDate()).padStart(2, "0");
  const endMonth = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    timeZone: "UTC",
  })
    .format(end)
    .toUpperCase();

  return start.getUTCMonth() === end.getUTCMonth()
    ? `${startDay}–${endDay} ${month}`
    : `${startDay} ${month}–${endDay} ${endMonth}`;
}

function statusLabel(
  phase: SeasonSelectionPhase,
  selected: boolean,
  isAutomaticRace: boolean,
) {
  if (selected) return "LOCKED FOCUS";
  if (!isAutomaticRace) return "STATION PREVIEW";
  if (phase === "current") return "CURRENT RACE";
  if (phase === "next") return "NEXT RACE";
  return "OFF SEASON / LAST ROUND";
}

export function SeasonAtlas() {
  const rootRef = useRef<HTMLElement>(null);
  const initialFocusRequestedRef = useRef(false);
  const now = useSeasonClock();
  const races = useMemo(() => getSeason2026(now), [now]);
  const automaticSelection = useMemo(
    () => getSeasonRaceSelection2026(now),
    [now],
  );
  const currentRace = automaticSelection.race;
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<AtlasViewMode>("global");
  const [navigationVersion, setNavigationVersion] = useState(0);
  const [autoFocusVersion, setAutoFocusVersion] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [renderSettings, setRenderSettings] = useState<AtlasRenderSettings>(
    ATLAS_RENDER_DEFAULTS,
  );
  const [debugEnabled, setDebugEnabled] = useState(false);
  const webglState = useWebGLState();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const compact = useMediaQuery("(max-width: 720px), (pointer: coarse)");
  const documentVisible = useDocumentVisibility();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ATLAS_DEBUG !== "1") return;
    setDebugEnabled(
      new URLSearchParams(window.location.search).get("atlasDebug") === "1",
    );
  }, []);

  const hoveredRace = useMemo(
    () => races.find((race) => race.id === hoveredTargetId) ?? null,
    [hoveredTargetId, races],
  );
  const selectedRace = useMemo(
    () => races.find((race) => race.id === selectedRaceId) ?? null,
    [races, selectedRaceId],
  );
  const focusedRace = selectedRace ?? hoveredRace ?? currentRace;
  const showEuropeSummary =
    viewMode === "europe-focus" && !selectedRace && !hoveredRace;
  const scrollStage: AtlasScrollStage =
    scrollProgress > 0.72 ? "season-data-reserved" : "global-core";

  const handleHoverTarget = useCallback((targetId: string | null) => {
    setHoveredTargetId(targetId);
  }, []);

  const handleSelectTarget = useCallback(
    (targetId: string) => {
      setHoveredTargetId(null);
      setNavigationVersion((version) => version + 1);
      if (targetId === EUROPE_ENTRY_ID) {
        setSelectedRaceId(
          currentRace.region === "EUROPE" ? currentRace.id : null,
        );
        setViewMode("europe-focus");
        return;
      }
      setSelectedRaceId(targetId);
      setViewMode("station-focus");
    },
    [currentRace.id, currentRace.region],
  );

  const handleBackToGlobe = useCallback(() => {
    setHoveredTargetId(null);
    setSelectedRaceId(null);
    setViewMode("global");
    setNavigationVersion((version) => version + 1);
  }, []);

  const handleReturnToCurrentRace = useCallback(() => {
    setHoveredTargetId(null);
    setSelectedRaceId(null);
    setViewMode("global");
    setNavigationVersion((version) => version + 1);
    setAutoFocusVersion((version) => version + 1);
  }, []);

  const handleSceneReady = useCallback(() => {
    if (initialFocusRequestedRef.current) return;
    initialFocusRequestedRef.current = true;
    setAutoFocusVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (viewMode === "europe-focus" && currentRace.region === "EUROPE") {
      setSelectedRaceId(currentRace.id);
    }
  }, [currentRace.id, currentRace.region, viewMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && viewMode !== "global") {
        event.preventDefault();
        handleBackToGlobe();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleBackToGlobe, viewMode]);

  useEffect(() => {
    const syncScroll = () => {
      const root = rootRef.current;
      if (!root) return;
      const bounds = root.getBoundingClientRect();
      const range = Math.max(1, root.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -bounds.top / range));
      setScrollProgress(progress);
    };

    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("resize", syncScroll);
    return () => {
      window.removeEventListener("scroll", syncScroll);
      window.removeEventListener("resize", syncScroll);
    };
  }, []);

  const rootStyle = {
    "--atlas-scroll-progress": scrollProgress.toFixed(3),
    "--atlas-vignette-strength": renderSettings.vignetteStrength.toFixed(2),
    "--atlas-grid-opacity": renderSettings.gridOverlay ? "1" : "0",
  } as CSSProperties;

  return (
    <main
      ref={rootRef}
      className={styles.root}
      style={rootStyle}
      data-atlas-scroll-stage={scrollStage}
      data-atlas-node-count={races.length}
      data-atlas-mode={viewMode}
      data-atlas-hover-target={hoveredTargetId ?? ""}
      data-atlas-selected-station={selectedRaceId ?? ""}
      data-atlas-active-race={currentRace.id}
      data-atlas-selection-phase={automaticSelection.phase}
    >
      <section className={styles.stage} aria-label="2026 Formula 1 season atlas">
        <div className={styles.canvasLayer}>
          {webglState === "ready" ? (
            <AtlasGlobe
              races={races}
              hoveredTargetId={hoveredTargetId}
              hoveredRace={hoveredRace}
              selectedRace={selectedRace}
              currentRace={currentRace}
              autoFocusRace={currentRace}
              autoFocusVersion={autoFocusVersion}
              viewMode={viewMode}
              navigationVersion={navigationVersion}
              reducedMotion={reducedMotion}
              compact={compact}
              active={documentVisible}
              renderSettings={renderSettings}
              onHoverTarget={handleHoverTarget}
              onSelectTarget={handleSelectTarget}
              onSceneReady={handleSceneReady}
            />
          ) : (
            <div className={styles.loadingState}>
              <span className={styles.loadingOrbit} aria-hidden="true" />
              <p>
                {webglState === "blocked"
                  ? "WEBGL IS REQUIRED FOR THE LIVE GLOBE"
                  : "INITIALISING GLOBAL CORE"}
              </p>
            </div>
          )}
        </div>

        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.frameLines} aria-hidden="true" />
        {debugEnabled ? (
          <AtlasDebugPanel
            settings={renderSettings}
            onChange={setRenderSettings}
          />
        ) : null}

        <header className={styles.identity}>
          <span className={styles.identityRule} aria-hidden="true" />
          <p>GRIDDELTA CN</p>
          <h1>SEASON ATLAS</h1>
          <span>2026 · GLOBAL CORE</span>
        </header>

        {viewMode !== "global" ? (
          <button
            type="button"
            className={styles.backToGlobe}
            onClick={handleBackToGlobe}
            data-atlas-action="back-to-globe"
          >
            <span aria-hidden="true">←</span> BACK TO GLOBE
          </button>
        ) : null}

        <button
          type="button"
          className={styles.returnToCurrent}
          onClick={handleReturnToCurrentRace}
          data-atlas-action="return-to-current-race"
        >
          <span aria-hidden="true">↺</span> RETURN TO CURRENT RACE
        </button>

        <aside className={styles.focusPanel} aria-live="polite">
          {showEuropeSummary ? (
            <>
              <div className={styles.focusKicker}>
                <span>REGIONAL SEASON</span>
                <span>EUROPE</span>
              </div>
              <div className={styles.focusRound}>
                <span>ROUNDS</span>
                <strong>09</strong>
              </div>
              <h2>EUROPE SEASON</h2>
              <p className={styles.focusCircuit}>
                NINE CIRCUITS · ONE GEOGRAPHIC FOCUS
              </p>
              <div className={styles.focusRule} aria-hidden="true" />
              <dl className={styles.focusMeta}>
                <div>
                  <dt>RANGE</dt>
                  <dd>ROUND 06–14</dd>
                </div>
                <div>
                  <dt>NEW FOR 2026</dt>
                  <dd>MADRID · MADRING</dd>
                </div>
              </dl>
              <div className={styles.focusFooter}>
                <span>TRUE CIRCUIT COORDINATES</span>
                <span>SELECT STATION</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.focusKicker}>
                <span>
                  {statusLabel(
                    automaticSelection.phase,
                    Boolean(selectedRace),
                    focusedRace.id === currentRace.id,
                  )}
                </span>
                <span>{focusedRace.region.replace("_", " ")}</span>
              </div>
              <div className={styles.focusRound}>
                <span>ROUND</span>
                <strong>{String(focusedRace.round).padStart(2, "0")}</strong>
              </div>
              <h2>{focusedRace.name}</h2>
              <p className={styles.focusCircuit}>{focusedRace.circuitName}</p>
              <div className={styles.focusRule} aria-hidden="true" />
              <dl className={styles.focusMeta}>
                <div>
                  <dt>DATE</dt>
                  <dd>{formatRaceDates(focusedRace)}</dd>
                </div>
                <div>
                  <dt>LOCATION</dt>
                  <dd>{focusedRace.city}</dd>
                </div>
                <div>
                  <dt>COORD</dt>
                  <dd>
                    {Math.abs(focusedRace.latitude).toFixed(3)}°
                    {focusedRace.latitude >= 0 ? "N" : "S"} /{" "}
                    {Math.abs(focusedRace.longitude).toFixed(3)}°
                    {focusedRace.longitude >= 0 ? "E" : "W"}
                  </dd>
                </div>
              </dl>
              <div className={styles.focusFooter}>
                <span>
                  {focusedRace.isSprint ? "SPRINT WEEKEND" : "GRAND PRIX WEEKEND"}
                </span>
                <span>{selectedRace ? "STATION LOCKED" : "AUTO RACE FOCUS"}</span>
              </div>
            </>
          )}
        </aside>

        <div className={styles.scrollPrompt} aria-hidden="true">
          <span className={styles.scrollGlyph} />
          <p>继续滚动进入赛季数据</p>
          <small>SEASON DATA / NEXT STAGE</small>
        </div>

        <p className={styles.srInstructions}>
          交互式 2026 F1 地球。拖动旋转，滚轮缩放，轻触或点击赛站锁定焦点，
          Escape 取消锁定。全部 22 个赛站节点始终保留在球面上。
        </p>
      </section>

      <section className={styles.reservedStage} aria-label="Season data stage reserved">
        <span>GDL / STAGE 02</span>
        <p>SEASON DATA INTERFACE RESERVED</p>
      </section>
    </main>
  );
}
