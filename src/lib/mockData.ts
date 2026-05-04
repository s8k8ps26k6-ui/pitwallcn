import { LiveTimingRow, RaceControlMessage } from "./types";

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
