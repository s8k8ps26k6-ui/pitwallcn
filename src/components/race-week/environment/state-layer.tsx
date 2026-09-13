import type { EnvironmentState } from './environment-model';
import styles from './environment.module.css';

/** Lighting only: no session simulation, countdown, weather feed or track-control signal. */
export function EnvironmentStateLayer({ state }: { state: EnvironmentState }) {
  return <g data-environment-layer="state" className={styles.stateOverlay}>
    <path d="M0 0H1440V620H0Z" fill="#05090e" opacity="var(--rw-night-shade, 0)"/>
    <ellipse cx="745" cy="260" rx="480" ry="175" fill="url(#rw-haze)" opacity="var(--rw-haze, .4)"/>
    {state.weather === 'wet' && <path d="M400 534Q875 398 777 362" stroke="url(#rw-reflection)" strokeWidth="70" filter="url(#rw-soft)" fill="none" opacity=".5"/>}
    <path d="M0 0H1440V620H0Z" fill="url(#rw-shadow)" opacity=".28"/>
  </g>;
}
