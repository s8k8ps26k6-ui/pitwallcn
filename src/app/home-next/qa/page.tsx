import type { Metadata } from 'next';
import { GlobeHomepage } from '@/components/home-globe/home-globe';
export const metadata: Metadata = {title:'Homepage CSS viewport QA',robots:{index:false,follow:false}};
export default async function QA({searchParams}:{searchParams:Promise<{viewport?:string}>}) {
  const {viewport} = await searchParams;
  const width = viewport === '430' ? 430 : 390;
  return <GlobeHomepage viewport={{width,height:width===430?932:844}} />;
}
