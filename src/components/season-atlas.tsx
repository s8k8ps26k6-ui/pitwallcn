"use client";

import Link from "next/link";
import { PointerEvent, useMemo, useRef, useState } from "react";
import { officialRaceCalendar2026 } from "@/lib/race-calendar";

type RegionId = "americas" | "europe" | "middle-east" | "asia-pacific";

type AtlasRace = {
  id: string;
  region: RegionId;
  code: string;
  globe: { x: number; y: number };
  map: { x: number; y: number };
};

const regions: Record<RegionId, { label: string; short: string; anchor: { x: number; y: number }; note: string }> = {
  americas: { label: "美洲赛段", short: "AMERICAS", anchor: { x: 19, y: 54 }, note: "迈阿密 · 蒙特利尔 · 奥斯汀 · 墨西哥城 · 圣保罗 · 拉斯维加斯" },
  europe: { label: "欧洲赛段", short: "EUROPE", anchor: { x: 17, y: 17 }, note: "斯帕 · 布达佩斯 · 赞德福特 · 蒙扎 · 马德里" },
  "middle-east": { label: "中东赛段", short: "MIDDLE EAST", anchor: { x: 76, y: 35 }, note: "巴林 · 吉达 · 卢赛尔 · 阿布扎比" },
  "asia-pacific": { label: "亚太赛段", short: "ASIA PACIFIC", anchor: { x: 77, y: 65 }, note: "墨尔本 · 上海 · 铃鹿 · 新加坡" },
};

const atlasRaces: AtlasRace[] = [
  { id: "2026-miami", region: "americas", code: "MIA", globe: { x: 18, y: 51 }, map: { x: 40, y: 55 } },
  { id: "2026-canada", region: "americas", code: "YUL", globe: { x: 22, y: 36 }, map: { x: 52, y: 31 } },
  { id: "2026-united-states", region: "americas", code: "AUS", globe: { x: 15, y: 59 }, map: { x: 27, y: 69 } },
  { id: "2026-mexico", region: "americas", code: "MEX", globe: { x: 15, y: 66 }, map: { x: 22, y: 75 } },
  { id: "2026-brazil", region: "americas", code: "SAO", globe: { x: 28, y: 77 }, map: { x: 68, y: 81 } },
  { id: "2026-monaco", region: "europe", code: "MON", globe: { x: 48, y: 42 }, map: { x: 48, y: 64 } },
  { id: "2026-barcelona-catalunya", region: "europe", code: "BCN", globe: { x: 44, y: 44 }, map: { x: 34, y: 70 } },
  { id: "2026-austria", region: "europe", code: "SPI", globe: { x: 51, y: 39 }, map: { x: 59, y: 51 } },
  { id: "2026-great-britain", region: "europe", code: "SIL", globe: { x: 45, y: 34 }, map: { x: 30, y: 31 } },
  { id: "2026-belgium", region: "europe", code: "SPA", globe: { x: 47, y: 36 }, map: { x: 42, y: 40 } },
  { id: "2026-hungary", region: "europe", code: "BUD", globe: { x: 54, y: 43 }, map: { x: 68, y: 65 } },
  { id: "2026-netherlands", region: "europe", code: "ZAN", globe: { x: 47, y: 31 }, map: { x: 44, y: 22 } },
  { id: "2026-italy", region: "europe", code: "MNZ", globe: { x: 50, y: 47 }, map: { x: 59, y: 78 } },
  { id: "2026-spain-madrid", region: "europe", code: "MAD", globe: { x: 43, y: 46 }, map: { x: 29, y: 76 } },
  { id: "2026-bahrain", region: "middle-east", code: "BAH", globe: { x: 60, y: 48 }, map: { x: 34, y: 57 } },
  { id: "2026-saudi-arabia", region: "middle-east", code: "JED", globe: { x: 58, y: 55 }, map: { x: 26, y: 68 } },
  { id: "2026-qatar", region: "middle-east", code: "LOS", globe: { x: 64, y: 48 }, map: { x: 66, y: 49 } },
  { id: "2026-abkhazia", region: "middle-east", code: "AUH", globe: { x: 66, y: 52 }, map: { x: 72, y: 66 } },
  { id: "2026-australia", region: "asia-pacific", code: "MEL", globe: { x: 77, y: 76 }, map: { x: 76, y: 74 } },
  { id: "2026-china", region: "asia-pacific", code: "SHA", globe: { x: 72, y: 47 }, map: { x: 53, y: 42 } },
  { id: "2026-japan", region: "asia-pacific", code: "SUZ", globe: { x: 79, y: 44 }, map: { x: 68, y: 35 } },
  { id: "2026-singapore", region: "asia-pacific", code: "SIN", globe: { x: 70, y: 62 }, map: { x: 47, y: 63 } },
];

const raceOverrides: Record<string, { raceName: string; country: string; location: string; circuitName: string }> = {
  "2026-bahrain": { raceName: "巴林大奖赛", country: "巴林", location: "萨基尔", circuitName: "巴林国际赛道" },
  "2026-saudi-arabia": { raceName: "沙特阿拉伯大奖赛", country: "沙特阿拉伯", location: "吉达", circuitName: "吉达滨海赛道" },
  "2026-qatar": { raceName: "卡塔尔大奖赛", country: "卡塔尔", location: "卢赛尔", circuitName: "卢赛尔国际赛道" },
  "2026-abkhazia": { raceName: "阿布扎比大奖赛", country: "阿联酋", location: "阿布扎比", circuitName: "亚斯码头赛道" },
  "2026-mexico": { raceName: "墨西哥城大奖赛", country: "墨西哥", location: "墨西哥城", circuitName: "罗德里格斯兄弟赛道" },
  "2026-brazil": { raceName: "圣保罗大奖赛", country: "巴西", location: "圣保罗", circuitName: "英特拉格斯赛道" },
};

const defaultRace = {
  raceName: "比利时大奖赛",
  country: "比利时",
  location: "斯帕-弗朗科尔尚",
  circuitName: "斯帕-弗朗科尔尚赛道",
  startDate: "2026-07-17T12:00:00Z",
  endDate: "2026-07-19T13:00:00Z",
};

function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", timeZone: "Asia/Shanghai" }).format(new Date(iso));
}

export function SeasonAtlas() {
  const [activeRegion, setActiveRegion] = useState<RegionId>("europe");
  const [activeRaceId, setActiveRaceId] = useState("2026-belgium");
  const [rotation, setRotation] = useState(0);
  const dragStart = useRef<number | null>(null);
  const dragged = useRef(false);

  const activeRace = useMemo(() => {
    const found = officialRaceCalendar2026.find((race) => race.id === activeRaceId);
    return found ? { ...found, ...raceOverrides[activeRaceId] } : { ...defaultRace, ...raceOverrides[activeRaceId] };
  }, [activeRaceId]);

  const visibleRaces = atlasRaces.filter((race) => race.region === activeRegion);

  function selectRegion(region: RegionId) {
    setActiveRegion(region);
    const nextRace = atlasRaces.find((race) => race.region === region);
    if (nextRace) setActiveRaceId(nextRace.id);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    dragStart.current = event.clientX;
    dragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStart.current === null) return;
    const delta = event.clientX - dragStart.current;
    if (Math.abs(delta) > 4) dragged.current = true;
    setRotation((value) => value + delta * 0.16);
    dragStart.current = event.clientX;
  }

  function handlePointerUp() {
    dragStart.current = null;
  }

  return (
    <main className="atlas-root">
      <section className="atlas-scene" aria-label="2026 F1 赛季全球地图概念预览">
        <div className="atlas-stars" aria-hidden="true" />
        <div className="atlas-vignette" aria-hidden="true" />

        <div className="atlas-topline">
          <div>
            <p className="atlas-kicker">GRIDDELTA / SEASON ATLAS</p>
            <p className="atlas-subline">2026 F1 赛季导航概念预览</p>
          </div>
          <div className="atlas-status"><span /> LIVE SEASON SIGNAL</div>
        </div>

        <div className="atlas-intro">
          <p>赛季不是一串卡片。</p>
          <h1>从全球，进入<br />一个比赛周。</h1>
          <p className="atlas-intro-copy">拖动地球切换视角，或沿光轨进入赛区。当前信号已锁定在欧洲。</p>
        </div>

        <svg className="atlas-trails" viewBox="0 0 1000 760" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="trail-main" x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="#ff7e5d" stopOpacity="0" />
              <stop offset="0.32" stopColor="#ff9175" stopOpacity=".75" />
              <stop offset=".65" stopColor="#ff5e53" stopOpacity=".9" />
              <stop offset="1" stopColor="#ff9770" stopOpacity="0" />
            </linearGradient>
            <filter id="trail-glow"><feGaussianBlur stdDeviation="2.4" /></filter>
          </defs>
          <path d="M495 395 C346 325 262 204 152 164" className="atlas-trail-glow" />
          <path d="M495 395 C346 325 262 204 152 164" className="atlas-trail" />
          <path d="M495 395 C684 307 754 269 834 286" className="atlas-trail-glow" />
          <path d="M495 395 C684 307 754 269 834 286" className="atlas-trail" />
          <path d="M495 395 C688 502 768 563 858 594" className="atlas-trail-glow" />
          <path d="M495 395 C688 502 768 563 858 594" className="atlas-trail" />
          <path d="M495 395 C340 525 248 524 124 548" className="atlas-trail-glow" />
          <path d="M495 395 C340 525 248 524 124 548" className="atlas-trail" />
        </svg>

        <div
          className="atlas-globe-wrap"
          style={{ transform: `rotate(${rotation * 0.015}deg)` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="presentation"
        >
          <div className="atlas-globe" style={{ transform: `rotateY(${rotation}deg)` }}>
            <div className="atlas-globe-grid" aria-hidden="true" />
            <svg className="atlas-land" viewBox="0 0 1000 1000" aria-hidden="true">
              <path d="M125 246C170 180 276 157 358 179l55 36-23 48-77 17-26 49-68 10-60-42-33-31Z" />
              <path d="M257 364l96-5 52 56-25 88-33 71-42 137-49-15-16-116 17-75-42-77Z" />
              <path d="M446 221l68-29 46 47 65-10 53 51-8 47-78 16-37 69-69-5-45-85 3-70Z" />
              <path d="M476 420l100 26 45 80-31 82-36 127-73-24-33-107 18-85-23-51Z" />
              <path d="M647 365l99-7 80 52 44 81-23 65-94-6-51-55-61-35Z" />
              <path d="M750 621l69 17 42 70-40 49-91-25-24-58Z" />
            </svg>
            <div className="atlas-atmosphere" aria-hidden="true" />
            {atlasRaces.map((race) => (
              <button
                type="button"
                key={race.id}
                aria-label={`选择 ${race.code}`}
                className={`atlas-globe-point ${activeRaceId === race.id ? "is-active" : ""} ${activeRegion === race.region ? "is-region" : ""}`}
                style={{ left: `${race.globe.x}%`, top: `${race.globe.y}%` }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!dragged.current) {
                    setActiveRegion(race.region);
                    setActiveRaceId(race.id);
                  }
                }}
              >
                <span />
              </button>
            ))}
            <div className="atlas-globe-label">DRAG / EXPLORE</div>
          </div>
        </div>

        {(Object.keys(regions) as RegionId[]).map((region) => {
          const data = regions[region];
          const isActive = activeRegion === region;
          return (
            <button
              type="button"
              key={region}
              className={`atlas-region atlas-region--${region} ${isActive ? "is-active" : ""}`}
              style={{ left: `${data.anchor.x}%`, top: `${data.anchor.y}%` }}
              onClick={() => selectRegion(region)}
            >
              <span className="atlas-region-index">0{(Object.keys(regions) as RegionId[]).indexOf(region) + 1}</span>
              <span className="atlas-region-name">{data.label}</span>
              <span className="atlas-region-short">{data.short}</span>
            </button>
          );
        })}

        <section className="atlas-projection" aria-live="polite">
          <div className="atlas-projection-heading">
            <p>{regions[activeRegion].short} / REGIONAL PROJECTION</p>
            <button type="button" onClick={() => selectRegion(activeRegion)}>已锁定</button>
          </div>
          <div className="atlas-projection-map">
            <svg viewBox="0 0 1000 560" aria-hidden="true">
              <path className="atlas-projection-land" d={activeRegion === "europe" ? "M103 354 145 274 233 245l57-97 101 15 77-72 118 42 104 7 61 80-38 71-88 7-72 56-119-13-74 67-92-14-88 42Z" : activeRegion === "americas" ? "M183 72 345 35l137 87-59 66-87 12-45 87-77-35-49-78Zm170 238 94-44 89 63-31 92-70 105-57-89 13-62Z" : activeRegion === "middle-east" ? "M232 160 395 103l129 43 127 1 107 76-57 90-94-11-78 73-148-30-92-79Z" : "M221 110 395 74l100 73 130 13 135 103-52 83-146-18-113 54-126-72-95-83Z"} />
              <path className="atlas-projection-coast" d="M86 470 C235 389 347 488 483 410 S757 417 925 310" />
              <path className="atlas-projection-coast is-second" d="M116 146 C263 195 382 117 510 203 S767 183 901 229" />
            </svg>
            {visibleRaces.map((race) => (
              <button
                type="button"
                key={race.id}
                className={`atlas-projection-point ${activeRaceId === race.id ? "is-active" : ""}`}
                style={{ left: `${race.map.x}%`, top: `${race.map.y}%` }}
                onClick={() => setActiveRaceId(race.id)}
              >
                <span>{race.code}</span>
              </button>
            ))}
          </div>
          <p className="atlas-projection-note">{regions[activeRegion].note}</p>
        </section>

        <aside className="atlas-race-detail">
          <p className="atlas-kicker">NEXT SIGNAL / ROUND 10</p>
          <p className="atlas-race-location">{activeRace.country.toUpperCase()} · {activeRace.location}</p>
          <h2>{activeRace.raceName}</h2>
          <div className="atlas-race-meta">
            <span>{activeRace.circuitName}</span>
            <span>{formatShortDate(activeRace.startDate)} — {formatShortDate(activeRace.endDate)}</span>
          </div>
          <Link href="/race-weekend" className="atlas-enter-link">进入比赛周 <span>↗</span></Link>
        </aside>

        <div className="atlas-footer-note">CONCEPT 01 · THE RACE SEASON AS A PLACE, NOT A LIST</div>
      </section>

      <style jsx>{`
        .atlas-root {
          --ink: #02050b;
          --surface: #071323;
          --blue: #61a4ff;
          --mist: #bed7ff;
          --signal: #ff745f;
          background: var(--ink);
          color: #f4f7ff;
          overflow: hidden;
        }

        .atlas-scene {
          isolation: isolate;
          position: relative;
          min-height: calc(100svh - 4rem);
          overflow: hidden;
          background:
            radial-gradient(ellipse at 48% 52%, rgba(20, 69, 130, 0.22), transparent 31%),
            radial-gradient(ellipse at 89% 4%, rgba(23, 47, 93, 0.24), transparent 28%),
            linear-gradient(135deg, #03070f 4%, #07101d 52%, #02050b 100%);
        }

        .atlas-stars,
        .atlas-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .atlas-stars {
          opacity: 0.62;
          background-image:
            radial-gradient(circle at 16px 18px, rgba(224, 239, 255, 0.92) 0 1px, transparent 1.7px),
            radial-gradient(circle at 109px 57px, rgba(126, 172, 255, 0.66) 0 1px, transparent 1.5px),
            radial-gradient(circle at 48px 105px, rgba(210, 228, 255, 0.6) 0 0.8px, transparent 1.4px),
            radial-gradient(circle at 175px 142px, rgba(210, 228, 255, 0.75) 0 0.8px, transparent 1.5px);
          background-size: 224px 178px, 288px 256px, 180px 173px, 312px 294px;
          mask-image: linear-gradient(to bottom, black, transparent 92%);
        }

        .atlas-vignette {
          z-index: 12;
          box-shadow: inset 0 0 130px 45px rgba(0, 0, 0, 0.7);
        }

        .atlas-topline,
        .atlas-intro,
        .atlas-race-detail,
        .atlas-footer-note {
          position: absolute;
          z-index: 20;
        }

        .atlas-topline {
          top: clamp(1.25rem, 3.1vw, 3rem);
          left: clamp(1.25rem, 4vw, 4.5rem);
          right: clamp(1.25rem, 4vw, 4.5rem);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .atlas-kicker,
        .atlas-subline,
        .atlas-status,
        .atlas-projection-heading,
        .atlas-footer-note {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.61rem;
          font-weight: 700;
          letter-spacing: 0.19em;
          text-transform: uppercase;
        }

        .atlas-kicker { color: rgba(174, 205, 255, 0.76); }
        .atlas-subline { margin-top: 0.6rem; color: rgba(139, 165, 207, 0.55); font-weight: 500; letter-spacing: 0.12em; }

        .atlas-status {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          color: rgba(230, 238, 255, 0.74);
          white-space: nowrap;
        }

        .atlas-status span {
          width: 0.42rem;
          height: 0.42rem;
          border-radius: 50%;
          background: var(--signal);
          box-shadow: 0 0 0 4px rgba(255, 116, 95, 0.11), 0 0 16px rgba(255, 116, 95, 0.95);
          animation: atlas-pulse 1.8s ease-in-out infinite;
        }

        .atlas-intro {
          top: clamp(7rem, 16vh, 10rem);
          left: clamp(1.25rem, 8vw, 9.5rem);
          width: min(28rem, 32vw);
        }

        .atlas-intro > p:first-child {
          margin: 0;
          color: rgba(173, 202, 245, 0.66);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
        }

        .atlas-intro h1 {
          margin: 1rem 0 0;
          font-size: clamp(2.2rem, 4.4vw, 5rem);
          font-weight: 520;
          line-height: 0.96;
          letter-spacing: -0.072em;
          text-wrap: balance;
        }

        .atlas-intro-copy {
          max-width: 20rem;
          margin: 1.35rem 0 0;
          color: rgba(177, 198, 229, 0.63);
          font-size: 0.82rem;
          line-height: 1.8;
        }

        .atlas-trails {
          position: absolute;
          z-index: 2;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
        }

        .atlas-trail-glow {
          fill: none;
          stroke: url(#trail-main);
          stroke-width: 5;
          opacity: 0.24;
          filter: url(#trail-glow);
        }

        .atlas-trail {
          fill: none;
          stroke: url(#trail-main);
          stroke-width: 1.1;
          stroke-linecap: round;
          stroke-dasharray: 7 8;
          animation: atlas-dash 13s linear infinite;
        }

        .atlas-globe-wrap {
          position: absolute;
          z-index: 4;
          top: 50%;
          left: 50%;
          width: min(48vw, 44rem);
          aspect-ratio: 1;
          transform-origin: center;
          translate: -50% -46%;
          touch-action: none;
          cursor: grab;
        }

        .atlas-globe-wrap:active { cursor: grabbing; }

        .atlas-globe {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border: 1px solid rgba(133, 183, 255, 0.35);
          border-radius: 50%;
          background:
            radial-gradient(circle at 34% 29%, rgba(117, 177, 255, 0.33), transparent 18%),
            radial-gradient(circle at 72% 66%, rgba(33, 87, 161, 0.52), transparent 42%),
            radial-gradient(circle at 54% 44%, #143a72 0%, #0c2753 44%, #06172f 74%, #020a18 100%);
          box-shadow:
            inset -58px -48px 100px rgba(0, 0, 12, 0.7),
            inset 35px 22px 80px rgba(129, 184, 255, 0.12),
            0 0 0 1px rgba(94, 150, 240, 0.08),
            0 0 62px rgba(42, 117, 234, 0.18),
            0 36px 90px rgba(0, 0, 0, 0.56);
          transition: transform 100ms linear;
        }

        .atlas-globe::before,
        .atlas-globe::after {
          position: absolute;
          content: "";
          pointer-events: none;
        }

        .atlas-globe::before {
          z-index: 5;
          inset: -12%;
          border: 1px solid rgba(137, 188, 255, 0.11);
          border-radius: 50%;
          filter: blur(1px);
        }

        .atlas-globe::after {
          z-index: 8;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(circle at 30% 23%, transparent 0 42%, rgba(0, 0, 0, 0.1) 60%, rgba(0, 0, 9, 0.85) 100%);
          mix-blend-mode: multiply;
        }

        .atlas-globe-grid {
          position: absolute;
          z-index: 1;
          inset: 0;
          opacity: 0.34;
          background:
            repeating-radial-gradient(ellipse at 50% 50%, transparent 0 11.6%, rgba(144, 188, 255, 0.16) 11.8% 12%, transparent 12.3% 22.4%),
            repeating-linear-gradient(90deg, transparent 0 10%, rgba(144, 188, 255, 0.13) 10.15% 10.4%, transparent 10.65% 20%);
          transform: scale(1.03);
        }

        .atlas-land {
          position: absolute;
          z-index: 3;
          inset: 5%;
          width: 90%;
          height: 90%;
          opacity: 0.77;
          filter: drop-shadow(0 0 12px rgba(128, 188, 255, 0.16));
          transform: rotate(-6deg) scale(1.08);
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .atlas-land path {
          fill: rgba(92, 147, 207, 0.23);
          stroke: rgba(171, 208, 255, 0.3);
          stroke-width: 1.5;
          vector-effect: non-scaling-stroke;
        }

        .atlas-atmosphere {
          position: absolute;
          z-index: 9;
          inset: -5%;
          border: 1px solid rgba(129, 189, 255, 0.25);
          border-radius: 50%;
          box-shadow: 0 0 25px rgba(90, 162, 255, 0.22), inset 0 0 23px rgba(89, 166, 255, 0.09);
          pointer-events: none;
        }

        .atlas-globe-point {
          position: absolute;
          z-index: 11;
          display: grid;
          width: 1.1rem;
          height: 1.1rem;
          padding: 0;
          place-items: center;
          border: 0;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          transform: translate(-50%, -50%);
        }

        .atlas-globe-point::before {
          width: 0.22rem;
          height: 0.22rem;
          border-radius: inherit;
          background: rgba(200, 222, 255, 0.68);
          box-shadow: 0 0 10px rgba(152, 195, 255, 0.82);
          content: "";
          transition: 180ms ease;
        }

        .atlas-globe-point.is-region::before { background: #ffb29a; box-shadow: 0 0 12px rgba(255, 112, 87, 0.95); }
        .atlas-globe-point.is-active::before { width: 0.46rem; height: 0.46rem; background: #fff8ee; box-shadow: 0 0 0 4px rgba(255, 112, 87, 0.14), 0 0 17px rgba(255, 112, 87, 1); }
        .atlas-globe-point.is-active span { position: absolute; width: 1.55rem; height: 1.55rem; border: 1px solid rgba(255, 151, 116, 0.55); border-radius: 50%; animation: atlas-ring 2s ease-out infinite; }

        .atlas-globe-label {
          position: absolute;
          z-index: 10;
          bottom: 12%;
          left: 50%;
          color: rgba(205, 223, 255, 0.42);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.54rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          transform: translateX(-50%);
          white-space: nowrap;
        }

        .atlas-region {
          position: absolute;
          z-index: 18;
          display: grid;
          min-width: 10rem;
          padding: 0.55rem 0.8rem 0.6rem;
          grid-template-columns: 1.6rem 1fr;
          border: 0;
          border-top: 1px solid rgba(151, 190, 248, 0.22);
          background: linear-gradient(90deg, rgba(4, 12, 25, 0.65), transparent);
          color: #c8dcff;
          text-align: left;
          cursor: pointer;
          transform: translate(-50%, -50%);
          transition: 240ms ease;
        }

        .atlas-region:hover,
        .atlas-region.is-active { border-color: rgba(255, 126, 95, 0.75); background: linear-gradient(90deg, rgba(24, 19, 27, 0.86), transparent); transform: translate(-50%, -50%) scale(1.03); }
        .atlas-region-index { grid-row: span 2; color: rgba(255, 157, 128, 0.9); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.62rem; letter-spacing: 0.07em; }
        .atlas-region-name { font-size: 0.9rem; font-weight: 600; letter-spacing: -0.03em; }
        .atlas-region-short { margin-top: 0.15rem; color: rgba(176, 207, 255, 0.45); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.52rem; font-weight: 700; letter-spacing: 0.17em; }
        .atlas-region--europe { transform-origin: right bottom; }

        .atlas-projection {
          position: absolute;
          z-index: 16;
          top: 13%;
          right: clamp(1.25rem, 5vw, 5.5rem);
          width: min(30vw, 26rem);
          padding-top: 0.65rem;
          border-top: 1px solid rgba(128, 174, 244, 0.36);
          transition: opacity 260ms ease;
        }

        .atlas-projection-heading { display: flex; align-items: center; justify-content: space-between; color: rgba(188, 215, 255, 0.62); }
        .atlas-projection-heading button { border: 0; background: transparent; color: rgba(255, 146, 118, 0.9); font: inherit; cursor: default; }
        .atlas-projection-map { position: relative; margin-top: 1rem; aspect-ratio: 1.67; overflow: hidden; border-bottom: 1px solid rgba(121, 162, 220, 0.16); background: linear-gradient(135deg, rgba(14, 35, 65, 0.22), rgba(3, 10, 20, 0)); }
        .atlas-projection-map::after { position: absolute; inset: 0; background-image: linear-gradient(rgba(146, 186, 245, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(146, 186, 245, 0.05) 1px, transparent 1px); background-size: 18% 25%; content: ""; pointer-events: none; }
        .atlas-projection-map svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .atlas-projection-land { fill: rgba(90, 140, 205, 0.18); stroke: rgba(153, 194, 255, 0.41); stroke-width: 2; }
        .atlas-projection-coast { fill: none; stroke: rgba(125, 177, 242, 0.2); stroke-width: 1.2; stroke-dasharray: 3 7; }
        .atlas-projection-coast.is-second { opacity: 0.55; }
        .atlas-projection-point { position: absolute; z-index: 3; border: 0; background: transparent; color: rgba(206, 226, 255, 0.62); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.52rem; font-weight: 700; letter-spacing: 0.09em; cursor: pointer; transform: translate(-50%, -50%); }
        .atlas-projection-point::before { display: block; width: 0.36rem; height: 0.36rem; margin: auto auto 0.22rem; border-radius: 50%; background: #b7d7ff; box-shadow: 0 0 10px rgba(117, 180, 255, 0.8); content: ""; }
        .atlas-projection-point.is-active { color: #fff5e8; }
        .atlas-projection-point.is-active::before { width: 0.52rem; height: 0.52rem; background: var(--signal); box-shadow: 0 0 0 4px rgba(255, 116, 95, 0.14), 0 0 15px rgba(255, 116, 95, 1); }
        .atlas-projection-note { margin: 0.8rem 0 0; color: rgba(163, 188, 225, 0.45); font-size: 0.68rem; line-height: 1.6; }

        .atlas-race-detail {
          right: clamp(1.25rem, 5vw, 5.5rem);
          bottom: clamp(2.6rem, 9vh, 5.5rem);
          width: min(28rem, 31vw);
        }

        .atlas-race-location { margin: 0.9rem 0 0; color: rgba(255, 165, 139, 0.8); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.14em; }
        .atlas-race-detail h2 { max-width: 28rem; margin: 0.45rem 0 0; font-size: clamp(2rem, 3.3vw, 4.1rem); font-weight: 510; line-height: 0.98; letter-spacing: -0.065em; }
        .atlas-race-meta { display: flex; margin-top: 1.1rem; padding-top: 0.78rem; gap: 1rem; border-top: 1px solid rgba(144, 181, 236, 0.2); color: rgba(192, 211, 239, 0.6); font-size: 0.72rem; line-height: 1.55; }
        .atlas-race-meta span { flex: 1; }
        .atlas-enter-link { display: inline-flex; align-items: center; gap: 1.1rem; margin-top: 1.45rem; padding-bottom: 0.45rem; border-bottom: 1px solid rgba(255, 131, 101, 0.7); color: #fff7f3; font-size: 0.9rem; font-weight: 600; text-decoration: none; transition: 180ms ease; }
        .atlas-enter-link span { color: var(--signal); font-size: 1.25rem; transition: transform 180ms ease; }
        .atlas-enter-link:hover { border-color: white; }
        .atlas-enter-link:hover span { transform: translate(0.18rem, -0.18rem); }

        .atlas-footer-note { bottom: 1.2rem; left: clamp(1.25rem, 4vw, 4.5rem); color: rgba(138, 162, 198, 0.32); font-size: 0.5rem; }

        @keyframes atlas-dash { to { stroke-dashoffset: -180; } }
        @keyframes atlas-pulse { 50% { opacity: 0.45; transform: scale(0.76); } }
        @keyframes atlas-ring { from { opacity: 0.8; transform: scale(0.65); } to { opacity: 0; transform: scale(1.7); } }

        @media (max-width: 920px) {
          .atlas-scene { min-height: max(52rem, calc(100svh - 4rem)); }
          .atlas-intro { top: 6.8rem; width: min(22rem, 57vw); left: 1.5rem; }
          .atlas-intro h1 { font-size: clamp(2.2rem, 7vw, 4rem); }
          .atlas-globe-wrap { width: min(59vw, 33rem); left: 46%; top: 47%; }
          .atlas-projection { top: 15%; width: 31vw; right: 1.5rem; }
          .atlas-race-detail { width: min(28rem, 43vw); right: 1.5rem; }
          .atlas-region { min-width: 8.7rem; }
          .atlas-region--europe { left: 13% !important; top: 31% !important; }
          .atlas-region--americas { left: 17% !important; top: 58% !important; }
          .atlas-region--middle-east { left: 79% !important; top: 38% !important; }
          .atlas-region--asia-pacific { left: 78% !important; top: 68% !important; }
        }

        @media (max-width: 640px) {
          .atlas-scene { min-height: max(52rem, calc(100svh - 4rem)); }
          .atlas-topline { top: 1.25rem; left: 1.15rem; right: 1.15rem; }
          .atlas-status { font-size: 0.49rem; letter-spacing: 0.12em; }
          .atlas-subline { font-size: 0.5rem; }
          .atlas-intro { top: 5.7rem; left: 1.15rem; width: calc(100% - 2.3rem); }
          .atlas-intro h1 { margin-top: 0.7rem; font-size: clamp(2.35rem, 11vw, 3.4rem); }
          .atlas-intro-copy { max-width: 17rem; margin-top: 0.95rem; font-size: 0.72rem; line-height: 1.65; }
          .atlas-globe-wrap { top: 40%; left: 50%; width: min(88vw, 27rem); translate: -50% -26%; }
          .atlas-trails { top: 6.4rem; height: 48rem; }
          .atlas-region { min-width: 7rem; padding: 0.36rem 0.45rem 0.42rem; grid-template-columns: 1.1rem 1fr; }
          .atlas-region-index { font-size: 0.48rem; }
          .atlas-region-name { font-size: 0.68rem; }
          .atlas-region-short { display: none; }
          .atlas-region--europe { left: 18% !important; top: 34% !important; }
          .atlas-region--americas { left: 18% !important; top: 58% !important; }
          .atlas-region--middle-east { left: 80% !important; top: 48% !important; }
          .atlas-region--asia-pacific { left: 78% !important; top: 66% !important; }
          .atlas-projection { top: auto; right: 1.15rem; bottom: 13.7rem; width: calc(100% - 2.3rem); }
          .atlas-projection-map { margin-top: 0.65rem; }
          .atlas-projection-note { display: none; }
          .atlas-race-detail { right: 1.15rem; bottom: 2.5rem; width: calc(100% - 2.3rem); }
          .atlas-race-detail h2 { font-size: 2.05rem; }
          .atlas-race-meta { margin-top: 0.75rem; font-size: 0.65rem; }
          .atlas-enter-link { margin-top: 0.8rem; font-size: 0.82rem; }
          .atlas-footer-note { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .atlas-status span,
          .atlas-trail,
          .atlas-globe-point.is-active span { animation: none; }
          .atlas-globe, .atlas-region, .atlas-enter-link, .atlas-enter-link span { transition: none; }
        }
      `}</style>
    </main>
  );
}
