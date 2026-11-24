import type { Metadata } from 'next';
import { GlobeHomepage } from '@/components/home-globe/home-globe';
export const metadata: Metadata = {title:'全球赛事 · LAPMETRY 3.0 原型',robots:{index:false,follow:false}};
export default function HomeNextPage() { return <GlobeHomepage />; }
