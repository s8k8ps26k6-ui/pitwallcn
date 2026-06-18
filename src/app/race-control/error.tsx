"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function RaceControlError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorState
      description="赛会控制消息暂时没有返回可用数据。请重试或稍后再查看。"
      error={error}
      reset={reset}
      title="赛会控制数据加载失败"
    />
  );
}
