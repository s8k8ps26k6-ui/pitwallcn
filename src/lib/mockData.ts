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
    id: "2026-ca",
    raceName: "加拿大大奖赛",
    country: "加拿大",
    location: "蒙特利尔",
    circuitName: "吉尔斯·维伦纽夫赛道",
    startDate: "2026-05-22T16:30:00Z",
    endDate: "2026-05-24T22:00:00Z",
    countdownTarget: "2026-05-24T20:00:00Z",
    sessions: [
      { name: "第一次自由练习赛", startTime: "2026-05-22T16:30:00Z" },
      { name: "冲刺排位赛", startTime: "2026-05-22T20:30:00Z" },
      { name: "冲刺赛", startTime: "2026-05-23T16:00:00Z" },
      { name: "排位赛", startTime: "2026-05-23T20:00:00Z" },
      { name: "正赛", startTime: "2026-05-24T20:00:00Z" }
    ]
  },
  {
    id: "2026-mc",
    raceName: "摩纳哥大奖赛",
    country: "摩纳哥",
    location: "蒙特卡洛",
    circuitName: "摩纳哥赛道",
    startDate: "2026-06-05T11:30:00Z",
    endDate: "2026-06-07T15:00:00Z",
    countdownTarget: "2026-06-07T13:00:00Z",
    sessions: [
      { name: "第一次自由练习赛", startTime: "2026-06-05T11:30:00Z" },
      { name: "第二次自由练习赛", startTime: "2026-06-05T15:00:00Z" },
      { name: "第三次自由练习赛", startTime: "2026-06-06T10:30:00Z" },
      { name: "排位赛", startTime: "2026-06-06T14:00:00Z" },
      { name: "正赛", startTime: "2026-06-07T13:00:00Z" }
    ]
  }
];
