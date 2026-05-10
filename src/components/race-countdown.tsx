"use client";

import { useEffect, useMemo, useState } from "react";

function getTimeLeft(targetDate: Date) {
  const diff = targetDate.getTime() - Date.now();

  if (diff <= 0) {
    return {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
      isStarted: true
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    isStarted: false
  };
}

export function RaceCountdown({ targetIso }: { targetIso: string }) {
  const targetDate = useMemo(() => new Date(targetIso), [targetIso]);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetDate));
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const items = [
    { value: timeLeft.days, label: "天" },
    { value: timeLeft.hours, label: "小时" },
    { value: timeLeft.minutes, label: "分钟" },
    { value: timeLeft.seconds, label: "秒" }
  ];

  return (
    <div className="grid min-w-0 grid-cols-4 gap-2 rounded-2xl border border-zinc-800/80 bg-black/25 p-3 text-center lg:min-w-[22rem]">
      {items.map((item) => (
        <div key={item.label}>
          <p className="font-mono text-3xl font-bold text-blue-400 sm:text-4xl">{item.value}</p>
          <p className="mt-1 text-xs text-zinc-500">{item.label}</p>
        </div>
      ))}
      {timeLeft.isStarted ? <p className="col-span-4 mt-1 text-xs font-semibold text-pitGreen">比赛周末进行中</p> : null}
    </div>
  );
}
