"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CircuitOutlinePoint } from "@/lib/atlas/circuit-registry";
import { fitCircuit, getCircuitAspect } from "./circuit-geometry";
import styles from "./homepage-v3.module.css";

export function CircuitField({ outline, title, circuitKey }: {
  outline: readonly CircuitOutlinePoint[] | undefined; title: string; circuitKey?: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 600, height: 400 });
  const id = useId().replace(/:/g, "");
  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize(old => old.width === width && old.height === height ? old : { width, height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const fit = fitCircuit(outline, size.width, size.height, getCircuitAspect(circuitKey));
  const d = fit ? fit.points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ") + " Z" : "";
  return <div ref={viewport} className={styles.circuitViewport} data-home-field>
    {fit ? <svg className={styles.circuitSvg} viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={title}>
      <defs>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#e5e8dc"/><stop offset="1" stopColor="#818d84"/></linearGradient>
        <filter id={`${id}-shadow`} filterUnits="userSpaceOnUse" x={fit.visualBounds.x} y={fit.visualBounds.y} width={fit.visualBounds.width} height={fit.visualBounds.height}><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d={d} stroke="#000" strokeWidth="18" opacity=".65" filter={`url(#${id}-shadow)`} transform="translate(0 12)"/>
        <path d={d} stroke="#39433f" strokeWidth="15" transform="translate(0 6)"/>
        <path d={d} stroke={`url(#${id}-edge)`} strokeWidth="14"/>
        <path d={d} stroke="#e5e8dc" strokeWidth="9"/>
        <path d={d} stroke="#667169" strokeWidth="5"/>
        <path d={d} className={styles.trackAccent} strokeWidth="2" pathLength="100" strokeDasharray="4 96"/>
      </g>
      {Object.entries(fit.anchors).map(([name, [cx, cy]]) => <circle key={name} data-home-anchor={name} cx={cx} cy={cy} r="1" fill="transparent"/>)}
    </svg> : <p className={styles.missingCircuit}>赛道轮廓待确认</p>}
  </div>;
}
