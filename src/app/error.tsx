"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="页面数据暂时无法加载。请重试；若 OpenF1 暂时不可用，稍后恢复后页面会自动重新获取数据。"
      error={error}
      reset={reset}
      title="页面加载失败"
    />
  );
}
