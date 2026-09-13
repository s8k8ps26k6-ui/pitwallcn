import type { VenueModule } from './environment-model';

export type SpatialFamily = 'permanent-landmark' | 'park-natural' | 'dense-street' | 'modern-urban';
export type SpatialField = {
  family: SpatialFamily;
  haze: { x: number; y: number; rx: number; ry: number };
};

/** Camera and spatial field belong to the family; materials and state do not. */
const fields: Record<SpatialFamily, SpatialField> = {
  'permanent-landmark': { family: 'permanent-landmark', haze: { x: 745, y: 260, rx: 480, ry: 175 } },
  'park-natural': { family: 'park-natural', haze: { x: 1130, y: 240, rx: 540, ry: 85 } },
  'dense-street': { family: 'dense-street', haze: { x: 1040, y: 200, rx: 110, ry: 210 } },
  'modern-urban': { family: 'modern-urban', haze: { x: 950, y: 275, rx: 380, ry: 150 } },
};
export function spatialField(venue: VenueModule): SpatialField {
  return fields[venue === 'monza' ? 'park-natural' : venue === 'monaco' ? 'dense-street'
    : venue === 'urban-fallback' ? 'modern-urban' : 'permanent-landmark'];
}
