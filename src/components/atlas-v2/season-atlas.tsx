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
import { getSolarState } from "@/lib/atlas/solar";
import {
  getSeasonCalendarEntries2026,
  type SeasonCalendarEntry,
} from "@/lib/atlas/events-2026";
import {
  getCircuitForRace,
} from "@/lib/atlas/circuit-registry";
import {
  EMPTY_ATLAS_FAVORITES,
  getAtlasStorage,
  readAtlasFavorites,
  toggleFavoriteCircuit,
  toggleFavoriteEvent,
  writeAtlasFavorites,
  type AtlasFavorites,
} from "@/lib/atlas/favorites";
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

function formatLocalRaceStart(
  timeZone: string | undefined,
  sessionStartTime?: string,
) {
  if (!timeZone || !sessionStartTime) return "LOCAL TIME NOT CONFIRMED";
  const parsed = new Date(sessionStartTime);
  if (Number.isNaN(parsed.getTime())) return "LOCAL TIME NOT PROVIDED";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  })
    .format(parsed)
    .toUpperCase();
}

function getNextSession(entry: SeasonCalendarEntry, now: Date) {
  const nowMs = now.getTime();
  return entry.sessions.find((session) => {
    if (!session.isTimeConfirmed) return false;
    const startMs = Date.parse(session.startTime);
    return Number.isFinite(startMs) && startMs >= nowMs;
  }) ?? null;
}

function formatSessionTime(iso: string, timeZone: string | undefined) {
  if (!timeZone) return "LOCAL TIME NOT PROVIDED";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "LOCAL TIME NOT PROVIDED";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  })
    .format(date)
    .toUpperCase();
}

function CircuitTrace({
  outline,
}: {
  outline: readonly (readonly [number, number])[] | undefined;
}) {
  if (!outline?.length) {
    return <span className={styles.focusTraceUnavailable}>OUTLINE NOT VERIFIED</span>;
  }
  const points = outline
    .map(([x, y]) => `${(x * 100).toFixed(2)},${((1 - y) * 100).toFixed(2)}`)
    .join(" ");
  return (
    <svg
      className={styles.focusTraceSvg}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Circuit outline"
    >
      <polyline points={points} pathLength="1" />
    </svg>
  );
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
  const [focusExpanded, setFocusExpanded] = useState(false);
  const [favorites, setFavorites] = useState<AtlasFavorites>(
    EMPTY_ATLAS_FAVORITES,
  );
  const webglState = useWebGLState();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const compact = useMediaQuery("(max-width: 720px), (pointer: coarse)");
  const documentVisible = useDocumentVisibility();
  const solarState = useMemo(() => {
    const fixed = new Date(renderSettings.fixedUtc);
    const sourceDate =
      renderSettings.timeMode === "fixed" && !Number.isNaN(fixed.getTime())
        ? fixed
        : now;
    return getSolarState(sourceDate);
  }, [now, renderSettings.fixedUtc, renderSettings.timeMode]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ATLAS_DEBUG !== "1") return;
    setDebugEnabled(
      new URLSearchParams(window.location.search).get("atlasDebug") === "1",
    );
  }, []);

  useEffect(() => {
    setFavorites(readAtlasFavorites(getAtlasStorage()));
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
  const focusedCircuit = useMemo(
    () => getCircuitForRace(focusedRace, races),
    [focusedRace, races],
  );
  const calendarEntries = useMemo(
    () => getSeasonCalendarEntries2026(races),
    [races],
  );
  const focusedCalendarEntry = useMemo(
    () =>
      calendarEntries.find(
        (entry) =>
          entry.eventId ===
          (focusedRace.eventId ?? `${focusedRace.id}-gp-2026`),
      ) ?? null,
    [calendarEntries, focusedRace.eventId, focusedRace.id],
  );
  const nextSession = useMemo(
    () =>
      focusedCalendarEntry ? getNextSession(focusedCalendarEntry, now) : null,
    [focusedCalendarEntry, now],
  );
  const focusedEventId = focusedRace.eventId ?? `${focusedRace.id}-gp-2026`;
  const eventIsFavorite = favorites.eventIds.includes(focusedEventId);
  const circuitIsFavorite = focusedCircuit
    ? favorites.circuitIds.includes(focusedCircuit.id)
    : false;
  const toggleEventFavorite = useCallback(() => {
    const eventId = focusedRace.eventId ?? `${focusedRace.id}-gp-2026`;
    setFavorites((current) => {
      const next = toggleFavoriteEvent(current, eventId);
      writeAtlasFavorites(getAtlasStorage(), next);
      return next;
    });
  }, [focusedRace.eventId, focusedRace.id]);

  const toggleCircuitFavorite = useCallback(() => {
    if (!focusedCircuit) return;
    setFavorites((current) => {
      const next = toggleFavoriteCircuit(current, focusedCircuit.id);
      writeAtlasFavorites(getAtlasStorage(), next);
      return next;
    });
  }, [focusedCircuit]);
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
        setFocusExpanded(false);
        setSelectedRaceId(
          currentRace.region === "EUROPE" ? currentRace.id : null,
        );
        setViewMode("europe-focus");
        return;
      }
      setSelectedRaceId(targetId);
      setFocusExpanded(true);
      setViewMode("station-focus");
    },
    [currentRace.id, currentRace.region],
  );

  const handleBackToGlobe = useCallback(() => {
    setHoveredTargetId(null);
    setSelectedRaceId(null);
    setFocusExpanded(false);
    setViewMode("global");
    setNavigationVersion((version) => version + 1);
  }, []);

  const handleReturnToCurrentRace = useCallback(() => {
    setHoveredTargetId(null);
    setSelectedRaceId(null);
    setFocusExpanded(false);
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
      data-atlas-calendar-entry-count={calendarEntries.length}
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
            solarState={solarState}
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

        <aside
          className={`${styles.focusPanel} ${focusExpanded ? styles.focusPanelExpanded : ""}`}
          aria-live="polite"
          data-atlas-focus-panel={focusExpanded ? "expanded" : "collapsed"}
        >
          <button
            type="button"
            className={styles.focusToggle}
            onClick={() => setFocusExpanded((expanded) => !expanded)}
            aria-expanded={focusExpanded}
          >
            {focusExpanded ? "COLLAPSE PROFILE" : "EXPAND RACE PROFILE"}
          </button>
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
              <div className={styles.focusTrace}>
                <span>TRACE</span>
                <CircuitTrace outline={focusedCircuit?.outline} />
              </div>
              <div className={styles.focusFavorites} aria-label="Atlas favorites">
                <button
                  type="button"
                  className={eventIsFavorite ? styles.favoriteActive : styles.favoriteButton}
                  aria-pressed={eventIsFavorite}
                  onClick={toggleEventFavorite}
                >
                  <span aria-hidden="true">{eventIsFavorite ? "★" : "☆"}</span>
                  EVENT
                </button>
                <button
                  type="button"
                  className={circuitIsFavorite ? styles.favoriteActive : styles.favoriteButton}
                  aria-pressed={circuitIsFavorite}
                  onClick={toggleCircuitFavorite}
                  disabled={!focusedCircuit}
                >
                  <span aria-hidden="true">{circuitIsFavorite ? "★" : "☆"}</span>
                  CIRCUIT
                </button>
              </div>
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
                <div>
                  <dt>NEXT SESSION</dt>
                  <dd>
                    {nextSession?.name ?? "SESSION TIMETABLE NOT CONFIRMED"}
                    {nextSession ? (
                      <small>
                        {formatSessionTime(
                          nextSession.startTime,
                          focusedCircuit?.timeZone,
                        )}
                      </small>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt>LOCAL TIME</dt>
                  <dd>
                    {formatLocalRaceStart(
                      focusedCircuit?.timeZone,
                      nextSession?.startTime,
                    )} · {focusedCircuit?.timeZone ?? "TIMEZONE NOT PROVIDED"}
                  </dd>
                </div>
                <div>
                  <dt>TRACK</dt>
                  <dd>
                    {focusedCircuit?.lengthKm
                      ? `${focusedCircuit.lengthKm.toFixed(3)} KM · ${focusedCircuit.laps ?? "—"} LAPS`
                      : "TRACK METRICS NOT PROVIDED"}
                  </dd>
                </div>
              </dl>
              <div className={styles.focusFooter}>
                <span>
                  {focusedRace.isSprint ? "SPRINT WEEKEND" : "GRAND PRIX WEEKEND"}
                </span>
                <span>{selectedRace ? "STATION LOCKED" : "AUTO RACE FOCUS"}</span>
                {selectedRace ? (
                  <button type="button" onClick={() => setFocusExpanded(true)}>
                    ENTER RACE WEEK CONTROL →
                  </button>
                ) : null}
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
