"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function DriversError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorState
      description="车手列表暂时无法显示，请重新加载页面。"
      error={error}
      reset={reset}
      title="车手数据加载失败"
    />
  );
}
