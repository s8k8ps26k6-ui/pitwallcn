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

export type ScheduleSession = {
  name: string;
  startTime: string;
  isTimeConfirmed?: boolean;
};

export type RaceWeekend = {
  id: string;
  raceName: string;
  country: string;
  location: string;
  circuitName: string;
  timeZone?: string;
  startDate: string;
  endDate: string;
  sessions: ScheduleSession[];
  countdownTarget: string;
};
