"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function WeatherError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorState
      description="赛道天气样本暂时为空或 OpenF1 请求失败。请切换赛段或重新加载。"
      error={error}
      reset={reset}
      title="赛道天气加载失败"
    />
  );
}
