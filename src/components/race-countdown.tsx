"use client";

import { useEffect, useMemo, useState } from "react";

function formatRemaining(diffMs: number) {
  if (diffMs <= 0) return "比赛进行中或已结束";
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days} 天 ${hours} 小时 ${minutes} 分钟`;
}

export function RaceCountdown({ targetTime }: { targetTime: string }) {
  const target = useMemo(() => new Date(targetTime).getTime(), [targetTime]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return <span>{formatRemaining(target - now)}</span>;
}
