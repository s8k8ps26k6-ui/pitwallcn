import { fetchOpenF1 } from "@/lib/openf1-client";
import type { LiveTimingRow } from "@/lib/types";

type OpenF1Driver = {
  driver_number: number;
  broadcast_name?: string;
  full_name?: string;
  name_acronym?: string;
  team_name?: string;
};

type OpenF1Position = {
  driver_number: number;
  position?: number;
  date?: string;
};

type OpenF1Interval = {
  driver_number: number;
  gap_to_leader?: string | number | null;
  interval?: string | number | null;
  date?: string;
};

type OpenF1Lap = {
  driver_number: number;
  lap_number?: number;
  lap_duration?: number | null;
};

export type LiveTimingSource = "openf1" | "openf1-waiting" | "openf1-error";

export type LiveTimingPayload = {
  data: LiveTimingRow[];
  source: LiveTimingSource;
  sessionName: string;
  updatedAt: string;
};

const fallbackDriverNames: Record<number, string> = {
  1: "VER",
  4: "NOR",
  5: "BOR",
  6: "HAD",
  7: "DOO",
  10: "GAS",
  12: "ANT",
  14: "ALO",
  16: "LEC",
  18: "STR",
  22: "TSU",
  23: "ALB",
  27: "HUL",
  30: "LAW",
  31: "OCO",
  44: "HAM",
  55: "SAI",
  63: "RUS",
  81: "PIA",
  87: "BEA"
};

function formatLapTime(seconds?: number | null) {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return "--";
  const minutes = Math.floor(seconds / 60);
  const remaining = (seconds % 60).toFixed(3).padStart(6, "0");
  return `${minutes}:${remaining}`;
}

function formatGap(value?: string | number | null) {
  if (value === null || value === undefined) return "--";

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "--";
    if (value === 0) return "LEADER";
    return `+${value.toFixed(3)}`;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === "0") return "LEADER";
  if (trimmed.startsWith("+") || trimmed.toLowerCase().includes("lap")) return trimmed;
  return `+${trimmed}`;
}

function buildDriverMap(drivers: OpenF1Driver[]) {
  const map = new Map<number, { name: string; team: string }>();

  for (const driver of drivers) {
    map.set(driver.driver_number, {
      name: driver.name_acronym || driver.broadcast_name || driver.full_name || fallbackDriverNames[driver.driver_number] || `#${driver.driver_number}`,
      team: driver.team_name || "车队暂无"
    });
  }

  return map;
}

function latestPositionMap(positions: OpenF1Position[]) {
  const map = new Map<number, OpenF1Position>();

  for (const position of positions) {
    const current = map.get(position.driver_number);
    if (!current || new Date(position.date ?? 0).getTime() >= new Date(current.date ?? 0).getTime()) {
      map.set(position.driver_number, position);
    }
  }

  return map;
}

function latestIntervalMap(intervals: OpenF1Interval[]) {
  const map = new Map<number, OpenF1Interval>();

  for (const interval of intervals) {
    const current = map.get(interval.driver_number);
    if (!current || new Date(interval.date ?? 0).getTime() >= new Date(current.date ?? 0).getTime()) {
      map.set(interval.driver_number, interval);
    }
  }

  return map;
}

function lapStatsMap(laps: OpenF1Lap[]) {
  const map = new Map<number, { lastLap: string; bestLap: string; latestLapNumber: number }>();

  for (const lap of laps) {
    const current = map.get(lap.driver_number) ?? { lastLap: "--", bestLap: "--", latestLapNumber: 0 };
    const lapNumber = lap.lap_number ?? 0;
    const lapTime = formatLapTime(lap.lap_duration);

    if (lapNumber >= current.latestLapNumber) {
      current.latestLapNumber = lapNumber;
      current.lastLap = lapTime;
    }

    if (lapTime !== "--") {
      const currentBest = current.bestLap;
      const toSeconds = (value: string) => {
        const [minutes, seconds] = value.split(":");
        return Number(minutes) * 60 + Number(seconds);
      };
      if (currentBest === "--" || toSeconds(lapTime) < toSeconds(currentBest)) {
        current.bestLap = lapTime;
      }
    }

    map.set(lap.driver_number, current);
  }

  return map;
}

export async function getOpenF1LiveTiming(): Promise<LiveTimingPayload> {
  try {
    const [drivers, positions, intervals, laps] = await Promise.all([
      fetchOpenF1<OpenF1Driver[]>("/drivers", { session_key: "latest" }, { timeoutMs: 8000, revalidate: 30 }).catch(() => []),
      fetchOpenF1<OpenF1Position[]>("/position", { session_key: "latest" }, { timeoutMs: 8000, revalidate: 15 }),
      fetchOpenF1<OpenF1Interval[]>("/intervals", { session_key: "latest" }, { timeoutMs: 8000, revalidate: 15 }).catch(() => []),
      fetchOpenF1<OpenF1Lap[]>("/laps", { session_key: "latest" }, { timeoutMs: 8000, revalidate: 30 }).catch(() => [])
    ]);

    if (!positions.length) {
      return { data: [], source: "openf1-waiting", sessionName: "Latest OpenF1 session", updatedAt: new Date().toISOString() };
    }

    const driversByNumber = buildDriverMap(drivers);
    const latestPositions = latestPositionMap(positions);
    const latestIntervals = latestIntervalMap(intervals);
    const lapStats = lapStatsMap(laps);

    const data = [...latestPositions.entries()]
      .map(([driverNumber, position]) => {
        const driver = driversByNumber.get(driverNumber) ?? { name: fallbackDriverNames[driverNumber] ?? `#${driverNumber}`, team: "车队暂无" };
        const interval = latestIntervals.get(driverNumber);
        const lapsForDriver = lapStats.get(driverNumber);

        return {
          position: position.position ?? 99,
          driver: `${driverNumber} ${driver.name}`,
          team: driver.team,
          gap: formatGap(interval?.gap_to_leader ?? interval?.interval ?? (position.position === 1 ? 0 : null)),
          lastLap: lapsForDriver?.lastLap ?? "--",
          bestLap: lapsForDriver?.bestLap ?? "--",
          pitStatus: "OUT" as const
        } satisfies LiveTimingRow;
      })
      .sort((a, b) => a.position - b.position);

    return {
      data,
      source: "openf1",
      sessionName: "Latest OpenF1 session",
      updatedAt: new Date().toISOString()
    };
  } catch {
    return {
      data: [],
      source: "openf1-error",
      sessionName: "OpenF1 unavailable",
      updatedAt: new Date().toISOString()
    };
  }
}
