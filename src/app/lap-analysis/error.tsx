"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function LapAnalysisError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorState
      description="圈速、分段或轮胎数据暂时不可用。请切换赛段或重新加载。"
      error={error}
      reset={reset}
      title="圈速分析加载失败"
    />
  );
}
