"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AtlasGlobe } from "./atlas-globe";
import {
  getSeason2026,
  type SeasonRace,
} from "@/lib/atlas/season-2026";
import styles from "./season-atlas.module.css";

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

function statusLabel(race: SeasonRace, selected: boolean) {
  if (selected) return "LOCKED FOCUS";
  if (race.status === "current") return "CURRENT / NEXT RACE";
  if (race.status === "completed") return "RACE COMPLETE";
  return "UPCOMING";
}

export function SeasonAtlas() {
  const rootRef = useRef<HTMLElement>(null);
  const races = useMemo(() => getSeason2026(), []);
  const currentRace = useMemo(
    () => races.find((race) => race.status === "current") ?? races[0],
    [races],
  );
  const [hoveredRaceId, setHoveredRaceId] = useState<string | null>(null);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const webglState = useWebGLState();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const compact = useMediaQuery("(max-width: 720px), (pointer: coarse)");
  const documentVisible = useDocumentVisibility();

  const hoveredRace = useMemo(
    () => races.find((race) => race.id === hoveredRaceId) ?? null,
    [hoveredRaceId, races],
  );
  const selectedRace = useMemo(
    () => races.find((race) => race.id === selectedRaceId) ?? null,
    [races, selectedRaceId],
  );
  const focusedRace = selectedRace ?? hoveredRace ?? currentRace;
  const scrollStage: AtlasScrollStage =
    scrollProgress > 0.72 ? "season-data-reserved" : "global-core";

  const handleHoverRace = useCallback((raceId: string | null) => {
    setHoveredRaceId(raceId);
  }, []);

  const handleSelectRace = useCallback((raceId: string | null) => {
    setSelectedRaceId((current) => (current === raceId ? null : raceId));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedRaceId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
  } as CSSProperties;

  return (
    <main
      ref={rootRef}
      className={styles.root}
      style={rootStyle}
      data-atlas-scroll-stage={scrollStage}
      data-atlas-node-count={races.length}
    >
      <section className={styles.stage} aria-label="2026 Formula 1 season atlas">
        <div className={styles.canvasLayer} aria-hidden="true">
          {webglState === "ready" ? (
            <AtlasGlobe
              races={races}
              hoveredRace={hoveredRace}
              selectedRace={selectedRace}
              currentRace={currentRace}
              reducedMotion={reducedMotion}
              compact={compact}
              active={documentVisible}
              onHoverRace={handleHoverRace}
              onSelectRace={handleSelectRace}
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

        <header className={styles.identity}>
          <span className={styles.identityRule} aria-hidden="true" />
          <p>GRIDDELTA CN</p>
          <h1>SEASON ATLAS</h1>
          <span>2026 · GLOBAL CORE</span>
        </header>

        <aside className={styles.focusPanel} aria-live="polite">
          <div className={styles.focusKicker}>
            <span>{statusLabel(focusedRace, Boolean(selectedRace))}</span>
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
            <span>{focusedRace.isSprint ? "SPRINT WEEKEND" : "GRAND PRIX WEEKEND"}</span>
            {selectedRace ? (
              <button type="button" onClick={() => setSelectedRaceId(null)}>
                RELEASE FOCUS
              </button>
            ) : (
              <span>DRAG · HOVER · SELECT</span>
            )}
          </div>
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
