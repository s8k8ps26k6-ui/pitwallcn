"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function RaceWeekendError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorState
      description="比赛周末汇总暂时无法生成。你仍可返回首页进入单独的数据模块。"
      error={error}
      reset={reset}
      title="比赛周末页面加载失败"
    />
  );
}
