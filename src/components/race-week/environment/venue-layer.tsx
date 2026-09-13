import type { VenueModule } from './environment-model';
import { SuzukaEnvironment } from './suzuka';
import { MonzaEnvironment } from './monza';
import { MonacoEnvironment } from './monaco';
import { FallbackEnvironment } from './fallback';

export function VenueEnvironment({ venue }: { venue: VenueModule }) {
  switch (venue) {
    case 'suzuka': return <SuzukaEnvironment />;
    case 'monza': return <MonzaEnvironment />;
    case 'monaco': return <MonacoEnvironment />;
    case 'urban-fallback': return <FallbackEnvironment urban />;
    default: return <FallbackEnvironment urban={false} />;
  }
}
