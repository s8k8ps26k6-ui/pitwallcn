"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function StandingsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorState
      description="积分榜数据暂时无法生成，页面会保留静态后备数据；请重新加载。"
      error={error}
      reset={reset}
      title="积分榜加载失败"
    />
  );
}
