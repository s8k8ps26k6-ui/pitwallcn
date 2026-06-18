"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function ScheduleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorState
      description="赛历或 OpenF1 赛段时间暂时不可用。项目仍保留本地赛历，请重试加载。"
      error={error}
      reset={reset}
      title="赛程数据加载失败"
    />
  );
}
