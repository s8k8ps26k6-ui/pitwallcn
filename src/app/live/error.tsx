"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function LiveError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorState
      description="实时计时数据暂时无法刷新。请重新加载；已有数据不会因单次请求失败而被清空。"
      error={error}
      reset={reset}
      title="实时计时加载失败"
    />
  );
}
