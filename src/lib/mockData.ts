import { LiveTimingRow, RaceControlMessage, RaceWeekend } from "./types";

export const mockLiveTiming: LiveTimingRow[] = [
  { position: 1, driver: "VER", team: "Red Bull", gap: "LEADER", lastLap: "1:33.918", bestLap: "1:33.622", pitStatus: "OUT" },
  { position: 2, driver: "NOR", team: "McLaren", gap: "+1.421", lastLap: "1:34.004", bestLap: "1:33.800", pitStatus: "OUT" },
  { position: 3, driver: "LEC", team: "Ferrari", gap: "+3.786", lastLap: "1:34.223", bestLap: "1:34.002", pitStatus: "PIT" }
];

export const mockRaceControl: RaceControlMessage[] = [
  { id: "1", timestamp: "14:06:22", category: "FLAG", message: "第 2 分段黄旗" },
  { id: "2", timestamp: "14:08:03", category: "SAFETY_CAR", message: "虚拟安全车已部署" },
  { id: "3", timestamp: "14:10:48", category: "INCIDENT", message: "81 号车因赛道边界被记录" },
  { id: "4", timestamp: "14:14:10", category: "FLAG", message: "绿旗" }
];

export const mockSchedule: RaceWeekend[] = [
  {
    id: "2026-cn",
    raceName: "中国大奖赛",
    country: "中国",
    location: "上海",
    circuitName: "上海国际赛车场",
    startDate: "2026-05-15T03:30:00Z",
    endDate: "2026-05-17T08:00:00Z",
    countdownTarget: "2026-05-17T07:00:00Z",
    sessions: [
      { name: "练习赛 1", startTime: "2026-05-15T03:30:00Z" },
      { name: "练习赛 2", startTime: "2026-05-15T07:00:00Z" },
      { name: "排位赛", startTime: "2026-05-16T07:00:00Z" },
      { name: "正赛", startTime: "2026-05-17T07:00:00Z" }
    ]
  },
  {
    id: "2026-jp",
    raceName: "日本大奖赛",
    country: "日本",
    location: "铃鹿",
    circuitName: "铃鹿赛道",
    startDate: "2026-05-29T03:30:00Z",
    endDate: "2026-05-31T08:00:00Z",
    countdownTarget: "2026-05-31T07:00:00Z",
    sessions: [
      { name: "练习赛 1", startTime: "2026-05-29T03:30:00Z" },
      { name: "练习赛 2", startTime: "2026-05-29T07:00:00Z" },
      { name: "排位赛", startTime: "2026-05-30T07:00:00Z" },
      { name: "正赛", startTime: "2026-05-31T07:00:00Z" }
    ]
  }
];
