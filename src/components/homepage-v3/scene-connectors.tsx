"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./homepage-v3.module.css";

type Position = { x: number; y: number };
type Line = { from: Position; to: Position; kind: string };

/** Read DOM geometry only inside this scene. Content owns layout; lines follow. */
export function SceneConnectors({ eventId }: { eventId: string }) {
  const layer = useRef<SVGSVGElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  useEffect(() => {
    const scene = layer.current?.parentElement;
    if (!scene) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const origin = scene.getBoundingClientRect();
        const point = (node: Element, side: "center" | "left" | "top") => {
          const box = node.getBoundingClientRect();
          return { x: box.left - origin.left + (side === "left" ? -8 : box.width / 2),
            y: box.top - origin.top + (side === "top" ? -8 : box.height / 2) };
        };
        const result: Line[] = [];
        for (const kind of ["session"]) {
          const anchor = scene.querySelector(`[data-home-anchor="${kind}"]`);
          const target = scene.querySelector(`[data-home-target="${kind}"]`);
          if (!anchor || !target) continue;
          let from = point(anchor, "center");
          const box = target.getBoundingClientRect();
          // Approach the reserved content edge, never its text center.
          const to = point(target, box.left - origin.left > from.x + 24 ? "left" : "top");
          // Wide compositions use the nearest rendered centerline point, so
          // a track's rightmost vertex cannot create an unnecessarily long line.
          // This only reads the fitted path; it never changes circuit geometry.
          if (scene.clientWidth >= 640) {
            const path = scene.querySelector<SVGPathElement>('[data-home-field] g path:not([transform])');
            const matrix = path?.getScreenCTM();
            if (path && matrix) {
              const length = path.getTotalLength();
              let distance = Infinity;
              for (let i = 0; i < 128; i++) {
                const sample = path.getPointAtLength(length * i / 128).matrixTransform(matrix);
                const candidate = { x: sample.x - origin.left, y: sample.y - origin.top };
                const nextDistance = Math.hypot(candidate.x - to.x, candidate.y - to.y);
                if (nextDistance < distance) { from = candidate; distance = nextDistance; }
              }
            }
          }
          result.push({ from, to, kind });
        }
        const current = scene.querySelector('[data-home-target="season"]');
        const previous = scene.querySelector('[data-home-previous]');
        const next = scene.querySelector('[data-home-next]');
        if (current) {
          const nodes = [previous, current, next].filter((node): node is Element => Boolean(node));
          const baseline = Math.max(...nodes.map(node => node.getBoundingClientRect().bottom)) - origin.top + 8;
          const center = (node: Element) => ({ x: point(node, "center").x, y: baseline });
          if (previous) result.push({ from: center(previous), to: center(current), kind: "previous" });
          if (next) result.push({ from: center(current), to: center(next), kind: "next" });
        }
        setLines(old => JSON.stringify(old) === JSON.stringify(result) ? old : result);
      });
    };
    const resize = new ResizeObserver(measure);
    resize.observe(scene);
    scene.querySelectorAll("[data-home-field], [data-home-target], [data-home-previous], [data-home-next], header, h1").forEach(node => resize.observe(node));
    // Fitting updates SVG anchor attributes after the viewport resize callback.
    const mutation = new MutationObserver(measure);
    const field = scene.querySelector("[data-home-field]");
    if (field) mutation.observe(field, { subtree: true, childList: true, attributes: true, attributeFilter: ["cx", "cy", "viewBox"] });
    window.addEventListener("resize", measure);
    document.fonts?.addEventListener("loadingdone", measure);
    measure();
    return () => { resize.disconnect(); mutation.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure); document.fonts?.removeEventListener("loadingdone", measure); };
  }, [eventId]);
  return <svg ref={layer} className={styles.connectors} aria-hidden="true">
    {lines.map(({ from, to, kind }) => <path key={kind} data-kind={kind} d={`M${from.x} ${from.y} Q${from.x} ${to.y} ${to.x} ${to.y}`}/>)}
  </svg>;
}
