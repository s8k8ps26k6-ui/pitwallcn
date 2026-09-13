import styles from './race-week.module.css';
import environmentStyles from './environment/environment.module.css';
import { EnvironmentDefinitions, EnvironmentSky, EnvironmentSurface } from './environment/shared-base';
import { VenueEnvironment } from './environment/venue-layer';
import { EnvironmentStateLayer } from './environment/state-layer';
import { resolveVenue, type EnvironmentState } from './environment/environment-model';

/** Shared composition + replaceable venue identity + independent lightweight state. */
export function RaceEnvironment({ circuitId, state }: { circuitId: string; state: EnvironmentState }) {
  const venue = resolveVenue(circuitId);
  return <div className={`${styles.environment} ${environmentStyles.root}`} aria-hidden="true"
    data-venue={venue} data-phase={state.phase} data-time={state.time} data-weather={state.weather}>
    <svg viewBox="0 0 1440 620" preserveAspectRatio="xMidYMid slice" focusable="false">
      <EnvironmentDefinitions />
      <EnvironmentSky />
      <VenueEnvironment venue={venue} />
      <EnvironmentSurface />
      <EnvironmentStateLayer state={state} />
    </svg>
  </div>;
}
