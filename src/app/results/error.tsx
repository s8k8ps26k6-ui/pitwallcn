"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function ResultsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorState
      description="比赛结果暂时为空或 OpenF1 请求失败。请切换赛段或重新加载。"
      error={error}
      reset={reset}
      title="比赛结果加载失败"
    />
  );
}
