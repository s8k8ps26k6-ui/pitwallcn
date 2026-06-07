import { drivers } from "@/lib/drivers";

export type StandingsSource = "api" | "static-fallback";

export type DriverStanding = {
  position: number;
  code: string;
  name: string;
  team: string;
  points: number;
  wins: number | null;
  href: `/drivers/${string}`;
  sourceLabel: string;
  updatedAt: string | null;
};

export type ConstructorStanding = {
  position: number;
  team: string;
  points: number;
  drivers: string[];
  sourceLabel: string;
  updatedAt: string | null;
};

export type DriverStandingsResult = {
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
  source: StandingsSource;
  sourceLabel: string;
  updatedAt: string | null;
};

const STATIC_FALLBACK_SOURCE_LABEL = "STATIC FALLBACK";

function parsePoints(points: string) {
  const parsed = Number(points);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildStaticFallbackStandings(): DriverStandingsResult {
  const updatedAt = null;
  const driverStandings = [...drivers]
    .sort((a, b) => parsePoints(b.points) - parsePoints(a.points))
    .map((driver, index) => ({
      position: index + 1,
      code: driver.code,
      name: driver.name,
      team: driver.team,
      points: parsePoints(driver.points),
      wins: null,
      href: driver.href,
      sourceLabel: STATIC_FALLBACK_SOURCE_LABEL,
      updatedAt
    }));

  const constructors = Array.from(
    driverStandings.reduce((map, driver) => {
      const current = map.get(driver.team) ?? {
        team: driver.team,
        points: 0,
        drivers: [] as string[]
      };
      current.points += driver.points;
      current.drivers.push(driver.code);
      map.set(driver.team, current);
      return map;
    }, new Map<string, { team: string; points: number; drivers: string[] }>())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.points - a.points)
    .map((team, index) => ({
      position: index + 1,
      team: team.team,
      points: team.points,
      drivers: team.drivers,
      sourceLabel: STATIC_FALLBACK_SOURCE_LABEL,
      updatedAt
    }));

  return {
    drivers: driverStandings,
    constructors,
    source: "static-fallback",
    sourceLabel: STATIC_FALLBACK_SOURCE_LABEL,
    updatedAt
  };
}

export async function getDriverStandings() {
  try {
    return buildStaticFallbackStandings();
  } catch {
    return buildStaticFallbackStandings();
  }
}
