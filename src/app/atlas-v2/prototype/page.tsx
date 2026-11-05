import type { Metadata } from 'next';
import { AtlasPrototype } from '@/components/atlas-prototype/atlas-prototype';
export const metadata: Metadata = {
  title: 'Atlas 2.0 · Prototype',
  robots: { index: false, follow: false },
};
export default function AtlasPrototypePage() { return <AtlasPrototype />; }
