export type LiveTimingRow = {
  position: number;
  driver: string;
  team: string;
  gap: string;
  lastLap: string;
  bestLap: string;
  pitStatus: "IN" | "OUT" | "PIT";
};

export type RaceControlMessage = {
  id: string;
  timestamp: string;
  category: "FLAG" | "SAFETY_CAR" | "INCIDENT" | "NOTICE";
  message: string;
};
