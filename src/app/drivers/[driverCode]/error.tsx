"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function DriverDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorState
      description="该车手的详情或图表暂时无法显示，请重新加载。"
      error={error}
      reset={reset}
      title="车手详情加载失败"
    />
  );
}
