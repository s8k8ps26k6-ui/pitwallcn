import type { Metadata } from 'next';
import { AtlasPrototype } from '@/components/atlas-prototype/atlas-prototype';
export const metadata: Metadata = { title:'Atlas viewport QA', robots:{index:false,follow:false} };
/** CSS viewport harness only; does not impersonate mobile Safari or a touch device. */
export default async function ViewportQA({searchParams}:{searchParams:Promise<{viewport?:string}>}) {
  const {viewport} = await searchParams;
  const width = viewport === '430' ? 430 : 390;
  const height = width === 430 ? 932 : 844;
  return <AtlasPrototype viewport={{width,height}} />;
}
