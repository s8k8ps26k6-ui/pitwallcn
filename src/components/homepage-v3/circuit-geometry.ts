import metadata from "./geometry-metadata.json";
export type Point = readonly [number, number];
export type Bounds = { x: number; y: number; width: number; height: number };
// Stroke radius + three blur sigma + extrusion; matches CircuitField layers.
export const VISUAL_PADDING = { left: 32, right: 32, top: 32, bottom: 48 } as const;
export function getBounds(points: readonly Point[]): Bounds | null {
  if (points.length < 3 || points.some(p => !p.every(Number.isFinite))) return null;
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  const width = Math.max(...xs) - x, height = Math.max(...ys) - y;
  return width > 0 && height > 0 ? { x, y, width, height } : null;
}
export function getCircuitAspect(key?: string) {
  return key && key in metadata.circuits ? metadata.circuits[key as keyof typeof metadata.circuits].aspect : undefined;
}
/** Canonical shape is independent of viewport: restore source aspect once. */
export function canonicalCircuit(outline: readonly Point[] | undefined, aspect = 1) {
  if (!Number.isFinite(aspect) || aspect <= 0) return null;
  const points: Point[] = outline?.map(([x, y]) => [x * aspect, 1 - y] as const) ?? [];
  const bounds = getBounds(points);
  return bounds ? { points, bounds } : null;
}
/** Only translation and one positive uniform scale may depend on the viewport. */
export function fitCircuit(outline: readonly Point[] | undefined, width: number, height: number, aspect = 1) {
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  const canonical = canonicalCircuit(outline, aspect);
  const aw = width - VISUAL_PADDING.left - VISUAL_PADDING.right;
  const ah = height - VISUAL_PADDING.top - VISUAL_PADDING.bottom;
  if (!canonical || aw <= 0 || ah <= 0) return null;
  const { points: source, bounds } = canonical;
  const scale = Math.min(aw / bounds.width, ah / bounds.height);
  const offset: Point = [VISUAL_PADDING.left + (aw - bounds.width * scale) / 2 - bounds.x * scale,
    VISUAL_PADDING.top + (ah - bounds.height * scale) / 2 - bounds.y * scale];
  const points = source.map(([x, y]) => [x * scale + offset[0], y * scale + offset[1]] as const);
  const fitted = getBounds(points)!;
  return { points, scale, offset, bounds: fitted,
    visualBounds: { x: fitted.x - VISUAL_PADDING.left, y: fitted.y - VISUAL_PADDING.top,
      width: fitted.width + VISUAL_PADDING.left + VISUAL_PADDING.right,
      height: fitted.height + VISUAL_PADDING.top + VISUAL_PADDING.bottom },
    anchors: { session: points.reduce((a, b) => b[0] > a[0] ? b : a),
      season: points.reduce((a, b) => b[1] > a[1] ? b : a) } };
}
