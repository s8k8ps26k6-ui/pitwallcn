"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function ProjectError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorState
      description="项目介绍暂时无法显示，请重新加载页面。"
      error={error}
      reset={reset}
      title="项目页面加载失败"
    />
  );
}
