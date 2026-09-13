import type { SpatialField } from './spatial-family';
import styles from './environment.module.css';

/** Lighting only: no session simulation, countdown, weather feed or track-control signal. */
export function EnvironmentStateLayer({ field }: { field: SpatialField }) {
  return <g data-environment-layer="state" className={styles.stateOverlay}>
    <path d="M0 0H1440V620H0Z" fill="#05090e" opacity="var(--rw-night-shade, 0)"/>
    <ellipse cx={field.haze.x} cy={field.haze.y} rx={field.haze.rx} ry={field.haze.ry} fill="url(#rw-haze)" opacity="var(--rw-haze, .4)"/>
    <path d="M0 0H1440V620H0Z" fill="url(#rw-shadow)" opacity=".28"/>
  </g>;
}
