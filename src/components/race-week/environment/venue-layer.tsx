import type { VenueModule } from './environment-model';
import { SuzukaEnvironment } from './suzuka';
import { MonzaEnvironment } from './monza';
import { MonacoEnvironment } from './monaco';
import { FallbackEnvironment } from './fallback';
import { PermanentTrackField } from './permanent-track-field';

export function VenueEnvironment({ venue }: { venue: VenueModule }) {
  switch (venue) {
    case 'suzuka': return <><SuzukaEnvironment /><PermanentTrackField /></>;
    case 'monza': return <MonzaEnvironment />;
    case 'monaco': return <MonacoEnvironment />;
    case 'urban-fallback': return <><FallbackEnvironment urban /><PermanentTrackField /></>;
    default: return <><FallbackEnvironment urban={false} /><PermanentTrackField /></>;
  }
}
