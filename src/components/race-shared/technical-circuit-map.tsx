"use client";

import { useMemo, useState } from "react";
import type { CircuitOutlinePoint } from "@/lib/atlas/circuit-registry";
import { getCircuitTechnicalConfig, type TechnicalMarker } from "@/lib/atlas/circuit-technical";
import styles from "./technical-circuit-map.module.css";

type TechnicalCircuitMapProps = {
  circuitId: string;
  outline: readonly CircuitOutlinePoint[] | undefined;
  title: string;
  compact?: boolean;
};

function asPoint([x, y]: CircuitOutlinePoint) {
  return { x: x * 100, y: (1 - y) * 100 };
}

function markerLabel(marker: TechnicalMarker) {
  const labels: Record<TechnicalMarker["kind"], string> = {
    corner: "弯角",
    "pit-entry": "维修区入口",
    "pit-exit": "维修区出口",
    "drs-detection": "DRS 检测",
    "drs-activation": "DRS 启用",
    "speed-trap": "测速点",
    braking: "重刹区",
  };
  return labels[marker.kind];
}

export function TechnicalCircuitMap({ circuitId, outline, title, compact = false }: TechnicalCircuitMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<TechnicalMarker | null>(null);
  const config = getCircuitTechnicalConfig(circuitId);
  const points = useMemo(
    () => outline?.map((point) => {
      const { x, y } = asPoint(point);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ") ?? "",
    [outline],
  );

  if (!outline?.length) {
    return <div className={styles.unavailable}>赛道线路待核验</div>;
  }

  const start = asPoint(outline[0]);
  const next = asPoint(outline[1] ?? outline[0]);
  const angle = Math.atan2(next.y - start.y, next.x - start.x) * (180 / Math.PI) + 90;
  const markers = config?.markers ?? [];

  return (
    <figure className={styles.map} data-compact={compact}>
      <svg viewBox="0 0 100 100" role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
        <polyline className={styles.underlay} points={points} pathLength="1" />
        <polyline className={styles.track} points={points} pathLength="1" />
        <g className={styles.startFinish} transform={`translate(${start.x} ${start.y}) rotate(${angle})`}>
          <line x1="-2.7" x2="2.7" y1="0" y2="0" />
          <line x1="-2.7" x2="2.7" y1=".95" y2=".95" />
        </g>
        <g className={styles.direction} transform={`translate(${next.x} ${next.y}) rotate(${angle - 90})`}>
          <path d="M-1.6,-1.4 L1.8,0 L-1.6,1.4" />
        </g>
        {markers.map((marker) => {
          const position = asPoint(marker.position);
          return (
            <g className={styles.marker} key={marker.id} transform={`translate(${position.x} ${position.y})`}>
              <circle r="1.7" onClick={() => setSelectedMarker(marker)} role="button" tabIndex={0} aria-label={`${markerLabel(marker)}：${marker.label}`} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedMarker(marker); }} />
              {!compact ? <text x="2.8" y="-.8">{marker.label}</text> : null}
            </g>
          );
        })}
      </svg>
      <figcaption>
        <span>起终点 / 行驶方向</span>
        {config ? <span>{config.source}</span> : <span>事件技术标记待官方赛会图核验</span>}
      </figcaption>
      {selectedMarker ? (
        <div className={styles.detail} role="status">
          <strong>{markerLabel(selectedMarker)} · {selectedMarker.label}</strong>
          <p>{selectedMarker.detail}</p>
          <button type="button" onClick={() => setSelectedMarker(null)}>关闭</button>
        </div>
      ) : null}
    </figure>
  );
}
