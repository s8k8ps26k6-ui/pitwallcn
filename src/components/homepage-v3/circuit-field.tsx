import type { CircuitOutlinePoint } from "@/lib/atlas/circuit-registry";
import styles from "./homepage-v3.module.css";

/** An affine viewport projection, never a cropped image or replacement geometry. */
export function projectCircuit(points: readonly CircuitOutlinePoint[], desktop: boolean) {
  const box = desktop ? { x: 270, y: 242, w: 856, h: 364 } : { x: 38, y: 255, w: 306, h: 309 };
  const projected = points.map(([x, y]) => [x, 1 - y - .22 * x] as const);
  const low = Math.min(...projected.map(p => p[1]));
  const high = Math.max(...projected.map(p => p[1]));
  return projected.map(([x, y]) => [box.x + x * box.w, box.y + (y-low) / (high-low || 1) * box.h] as const);
}

export function CircuitField({ outline, desktop, title }: {
  outline: readonly CircuitOutlinePoint[] | undefined; desktop: boolean; title: string;
}) {
  if (!outline?.length) return <p className={styles.missingCircuit}>赛道轮廓待确认</p>;
  const points = projectCircuit(outline, desktop);
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ") + " Z";
  const [sx, sy] = points[0];
  const bottom = points.reduce((a, b) => b[1] > a[1] ? b : a);
  const accentPoints = points.filter(p => p[1] >= bottom[1] - (desktop ? 14 : 12));
  const accent = accentPoints.map(([x,y],i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const end = desktop ? [480, 746] : [86, 650];
  const session = desktop ? [610, 485] : [155, 496];
  const id = desktop ? "home-track-desktop" : "home-track-mobile";
  return <svg className={desktop ? styles.desktopField : styles.mobileField}
    viewBox={desktop ? "0 0 1440 900" : "0 0 390 844"} preserveAspectRatio="none" role="img" aria-label={title}>
    <defs>
      <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0.8" y2="1"><stop stopColor="#e5e8dc"/><stop offset="1" stopColor="#818d84"/></linearGradient>
      <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="180%"><feGaussianBlur stdDeviation={desktop ? 8 : 5}/></filter>
    </defs>
    <g fill="none" strokeLinejoin="round" strokeLinecap="round" className={styles.circuitGeometry}>
      <path d={d} stroke="#000" strokeWidth={desktop ? 24 : 18} transform="translate(0 16)" opacity=".65" filter={`url(#${id}-shadow)`}/>
      <path d={d} stroke="#39433f" strokeWidth={desktop ? 22 : 15} transform="translate(0 7)"/>
      <path d={d} stroke={`url(#${id}-edge)`} strokeWidth={desktop ? 21 : 14}/>
      <path d={d} stroke="#e5e8dc" strokeWidth={desktop ? 15 : 9}/>
      <path d={d} stroke="#667169" strokeWidth={desktop ? 10 : 5}/>
      <path d={accent} className={styles.trackAccent} strokeWidth={desktop ? 3 : 2}/>
      <path d={`M${sx-8} ${sy}h16`} stroke="#e5e8dc" strokeWidth="2"/>
    </g>
    <g className={styles.relationships}>
      <path d={`M${sx} ${sy} Q${(sx + session[0])/2} ${sy+14} ${session[0]} ${session[1]}`}/>
      <path d={`M${bottom[0]} ${bottom[1]+8} C${bottom[0]} ${bottom[1]+60} ${end[0]-50} ${end[1]-15} ${end[0]} ${end[1]}`}/>
      <path d={desktop ? "M100 800 C230 800 340 757 480 746 C700 718 1040 795 1320 755" : "M-12 710 Q35 691 86 650 Q211 687 356 714"}/>
    </g>
    <circle cx={end[0]} cy={end[1]} r="5" className={styles.currentDot}/>
    <g className={styles.seasonDots}><circle cx={desktop ? 100 : 28} cy={desktop ? 800 : 690} r="3"/><circle cx={desktop ? 1320 : 356} cy={desktop ? 755 : 714} r="3"/></g>
  </svg>;
}
