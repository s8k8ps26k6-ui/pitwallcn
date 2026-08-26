export type StandingsSource = "jolpica" | "unavailable";

export type DriverStanding = {
  position: number;
  code: string;
  name: string;
  number: string;
  team: string;
  points: number;
  wins: number;
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

type JolpicaDriverStanding = {
  position: string;
  points: string;
  wins: string;
  Driver: {
    code?: string;
    permanentNumber?: string;
    givenName: string;
    familyName: string;
  };
  Constructors?: Array<{ name: string }>;
};

type JolpicaConstructorStanding = {
  position: string;
  points: string;
  Constructor: { name: string };
};

type JolpicaResponse = {
  MRData?: {
    StandingsTable?: {
      StandingsLists?: Array<{
        season: string;
        round: string;
        DriverStandings?: JolpicaDriverStanding[];
        ConstructorStandings?: JolpicaConstructorStanding[];
      }>;
    };
  };
};

const SOURCE_LABEL = "JOLPICA F1 · CURRENT SEASON";

async function fetchStandings(path: string) {
  const response = await fetch(`https://api.jolpi.ca/ergast/f1/current/${path}/`, {
    headers: { accept: "application/json" },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(9000)
  });
  if (!response.ok) throw new Error(`Jolpica standings request failed: ${response.status}`);
  return response.json() as Promise<JolpicaResponse>;
}

function numberOrZero(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getDriverStandings(): Promise<DriverStandingsResult> {
  try {
    const [driverPayload, constructorPayload] = await Promise.all([
      fetchStandings("driverstandings"),
      fetchStandings("constructorstandings")
    ]);
    const driverRows = driverPayload.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
    const constructorRows = constructorPayload.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
    if (!driverRows.length || !constructorRows.length) throw new Error("Current standings are empty");

    const updatedAt = new Date().toISOString();
    const drivers = driverRows.map((row) => {
      const code = row.Driver.code || row.Driver.familyName.slice(0, 3).toUpperCase();
      return {
        position: numberOrZero(row.position),
        code,
        name: `${row.Driver.givenName} ${row.Driver.familyName}`,
        number: row.Driver.permanentNumber ?? "—",
        team: row.Constructors?.[0]?.name ?? "车队未知",
        points: numberOrZero(row.points),
        wins: numberOrZero(row.wins),
        href: `/drivers/${code}` as const,
        sourceLabel: SOURCE_LABEL,
        updatedAt
      };
    });

    const constructors = constructorRows.map((row) => ({
      position: numberOrZero(row.position),
      team: row.Constructor.name,
      points: numberOrZero(row.points),
      drivers: drivers.filter((driver) => driver.team === row.Constructor.name).map((driver) => driver.code),
      sourceLabel: SOURCE_LABEL,
      updatedAt
    }));

    return { drivers, constructors, source: "jolpica", sourceLabel: SOURCE_LABEL, updatedAt };
  } catch {
    return {
      drivers: [],
      constructors: [],
      source: "unavailable",
      sourceLabel: "CHAMPIONSHIP SOURCE UNAVAILABLE",
      updatedAt: null
    };
  }
}
