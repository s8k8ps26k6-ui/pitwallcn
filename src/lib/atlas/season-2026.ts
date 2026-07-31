export type AtlasRegion =
  | "AMERICAS"
  | "APAC"
  | "EUROPE"
  | "EURASIA"
  | "MIDDLE_EAST";

export type RaceStatus = "completed" | "current" | "upcoming";

export type SeasonSelectionPhase = "current" | "next" | "off-season";

export type SeasonRace = {
  id: string;
  /** Stable links into the event and circuit registries. */
  eventId?: string;
  circuitId?: string;
  round: number;
  name: string;
  country: string;
  city: string;
  circuitName: string;
  latitude: number;
  longitude: number;
  region: AtlasRegion;
  startDate: string;
  endDate: string;
  status: RaceStatus;
  isSprint: boolean;
};

type RaceDefinition = Omit<SeasonRace, "status">;

export type SeasonRaceSelection = {
  phase: SeasonSelectionPhase;
  race: SeasonRace;
};

export const SEASON_2026_SOURCES = {
  calendar: "https://www.formula1.com/en/racing/2026",
  calendarRevision:
    "https://www.fia.com/news/2026-fia-sporting-calendars-approved-world-motor-sport-council",
  cancellations:
    "https://www.fia.com/news/bahrain-and-saudi-arabian-grands-prix-will-not-take-place-april",
  sprintCalendar:
    "https://www.fia.com/news/fia-and-formula-1-announce-2026-sprint-calendar",
  coordinates: "https://www.wikidata.org/wiki/Wikidata:Main_Page",
} as const;

// Calendar order and dates follow the current official 22-round 2026 calendar.
// Coordinates are circuit locations, not positions inferred from concept artwork.
const RACE_DEFINITIONS = [
  {
    id: "australia",
    round: 1,
    name: "Australian Grand Prix",
    country: "Australia",
    city: "Melbourne",
    circuitName: "Melbourne Grand Prix Circuit",
    latitude: -37.8497,
    longitude: 144.968,
    region: "APAC",
    startDate: "2026-03-06",
    endDate: "2026-03-08",
    isSprint: false,
  },
  {
    id: "china",
    round: 2,
    name: "Chinese Grand Prix",
    country: "China",
    city: "Shanghai",
    circuitName: "Shanghai International Circuit",
    latitude: 31.3389,
    longitude: 121.2197,
    region: "APAC",
    startDate: "2026-03-13",
    endDate: "2026-03-15",
    isSprint: true,
  },
  {
    id: "japan",
    round: 3,
    name: "Japanese Grand Prix",
    country: "Japan",
    city: "Suzuka",
    circuitName: "Suzuka International Racing Course",
    latitude: 34.8417,
    longitude: 136.5389,
    region: "APAC",
    startDate: "2026-03-27",
    endDate: "2026-03-29",
    isSprint: false,
  },
  {
    id: "miami",
    round: 4,
    name: "Miami Grand Prix",
    country: "United States",
    city: "Miami",
    circuitName: "Miami International Autodrome",
    latitude: 25.9581,
    longitude: -80.2389,
    region: "AMERICAS",
    startDate: "2026-05-01",
    endDate: "2026-05-03",
    isSprint: true,
  },
  {
    id: "canada",
    round: 5,
    name: "Canadian Grand Prix",
    country: "Canada",
    city: "Montréal",
    circuitName: "Circuit Gilles-Villeneuve",
    latitude: 45.5006,
    longitude: -73.5225,
    region: "AMERICAS",
    startDate: "2026-05-22",
    endDate: "2026-05-24",
    isSprint: true,
  },
  {
    id: "monaco",
    round: 6,
    name: "Monaco Grand Prix",
    country: "Monaco",
    city: "Monaco",
    circuitName: "Circuit de Monaco",
    latitude: 43.7347,
    longitude: 7.4206,
    region: "EUROPE",
    startDate: "2026-06-05",
    endDate: "2026-06-07",
    isSprint: false,
  },
  {
    id: "barcelona-catalunya",
    round: 7,
    name: "Barcelona-Catalunya Grand Prix",
    country: "Spain",
    city: "Barcelona",
    circuitName: "Circuit de Barcelona-Catalunya",
    latitude: 41.57,
    longitude: 2.2611,
    region: "EUROPE",
    startDate: "2026-06-12",
    endDate: "2026-06-14",
    isSprint: false,
  },
  {
    id: "austria",
    round: 8,
    name: "Austrian Grand Prix",
    country: "Austria",
    city: "Spielberg",
    circuitName: "Red Bull Ring",
    latitude: 47.2197,
    longitude: 14.7647,
    region: "EUROPE",
    startDate: "2026-06-26",
    endDate: "2026-06-28",
    isSprint: false,
  },
  {
    id: "great-britain",
    round: 9,
    name: "British Grand Prix",
    country: "United Kingdom",
    city: "Silverstone",
    circuitName: "Silverstone Circuit",
    latitude: 52.075,
    longitude: -1.0167,
    region: "EUROPE",
    startDate: "2026-07-03",
    endDate: "2026-07-05",
    isSprint: true,
  },
  {
    id: "belgium",
    round: 10,
    name: "Belgian Grand Prix",
    country: "Belgium",
    city: "Spa-Francorchamps",
    circuitName: "Circuit de Spa-Francorchamps",
    latitude: 50.4372,
    longitude: 5.9714,
    region: "EUROPE",
    startDate: "2026-07-17",
    endDate: "2026-07-19",
    isSprint: false,
  },
  {
    id: "hungary",
    round: 11,
    name: "Hungarian Grand Prix",
    country: "Hungary",
    city: "Budapest",
    circuitName: "Hungaroring",
    latitude: 47.5822,
    longitude: 19.2511,
    region: "EUROPE",
    startDate: "2026-07-24",
    endDate: "2026-07-26",
    isSprint: false,
  },
  {
    id: "netherlands",
    round: 12,
    name: "Dutch Grand Prix",
    country: "Netherlands",
    city: "Zandvoort",
    circuitName: "Circuit Zandvoort",
    latitude: 52.3883,
    longitude: 4.543,
    region: "EUROPE",
    startDate: "2026-08-21",
    endDate: "2026-08-23",
    isSprint: true,
  },
  {
    id: "italy",
    round: 13,
    name: "Italian Grand Prix",
    country: "Italy",
    city: "Monza",
    circuitName: "Autodromo Nazionale Monza",
    latitude: 45.6206,
    longitude: 9.2894,
    region: "EUROPE",
    startDate: "2026-09-04",
    endDate: "2026-09-06",
    isSprint: false,
  },
  {
    id: "madrid",
    round: 14,
    name: "Spanish Grand Prix",
    country: "Spain",
    city: "Madrid",
    circuitName: "Madring",
    latitude: 40.4636,
    longitude: -3.6178,
    region: "EUROPE",
    startDate: "2026-09-11",
    endDate: "2026-09-13",
    isSprint: false,
  },
  {
    id: "azerbaijan",
    round: 15,
    name: "Azerbaijan Grand Prix",
    country: "Azerbaijan",
    city: "Baku",
    circuitName: "Baku City Circuit",
    latitude: 40.3725,
    longitude: 49.8533,
    region: "EURASIA",
    startDate: "2026-09-24",
    endDate: "2026-09-26",
    isSprint: false,
  },
  {
    id: "singapore",
    round: 16,
    name: "Singapore Grand Prix",
    country: "Singapore",
    city: "Singapore",
    circuitName: "Marina Bay Street Circuit",
    latitude: 1.2914,
    longitude: 103.864,
    region: "APAC",
    startDate: "2026-10-09",
    endDate: "2026-10-11",
    isSprint: true,
  },
  {
    id: "united-states",
    round: 17,
    name: "United States Grand Prix",
    country: "United States",
    city: "Austin",
    circuitName: "Circuit of The Americas",
    latitude: 30.1328,
    longitude: -97.6411,
    region: "AMERICAS",
    startDate: "2026-10-23",
    endDate: "2026-10-25",
    isSprint: false,
  },
  {
    id: "mexico",
    round: 18,
    name: "Mexico City Grand Prix",
    country: "Mexico",
    city: "Mexico City",
    circuitName: "Autódromo Hermanos Rodríguez",
    latitude: 19.4042,
    longitude: -99.0887,
    region: "AMERICAS",
    startDate: "2026-10-30",
    endDate: "2026-11-01",
    isSprint: false,
  },
  {
    id: "sao-paulo",
    round: 19,
    name: "São Paulo Grand Prix",
    country: "Brazil",
    city: "São Paulo",
    circuitName: "Autódromo José Carlos Pace",
    latitude: -23.7011,
    longitude: -46.6972,
    region: "AMERICAS",
    startDate: "2026-11-06",
    endDate: "2026-11-08",
    isSprint: false,
  },
  {
    id: "las-vegas",
    round: 20,
    name: "Las Vegas Grand Prix",
    country: "United States",
    city: "Las Vegas",
    circuitName: "Las Vegas Strip Circuit",
    latitude: 36.11,
    longitude: -115.1618,
    region: "AMERICAS",
    startDate: "2026-11-19",
    endDate: "2026-11-21",
    isSprint: false,
  },
  {
    id: "qatar",
    round: 21,
    name: "Qatar Grand Prix",
    country: "Qatar",
    city: "Lusail",
    circuitName: "Lusail International Circuit",
    latitude: 25.49,
    longitude: 51.4542,
    region: "MIDDLE_EAST",
    startDate: "2026-11-27",
    endDate: "2026-11-29",
    isSprint: false,
  },
  {
    id: "abu-dhabi",
    round: 22,
    name: "Abu Dhabi Grand Prix",
    country: "United Arab Emirates",
    city: "Abu Dhabi",
    circuitName: "Yas Marina Circuit",
    latitude: 24.4702,
    longitude: 54.6061,
    region: "MIDDLE_EAST",
    startDate: "2026-12-04",
    endDate: "2026-12-06",
    isSprint: false,
  },
] as const satisfies readonly RaceDefinition[];

function startOfRaceWeekend(startDate: string) {
  return Date.parse(`${startDate}T00:00:00.000Z`);
}

function endOfRaceWeekend(endDate: string) {
  return Date.parse(`${endDate}T23:59:59.999Z`);
}

function getSelectionDefinition(now: Date) {
  const timestamp = now.getTime();
  const activeRace = RACE_DEFINITIONS.find(
    (race) =>
      startOfRaceWeekend(race.startDate) <= timestamp &&
      endOfRaceWeekend(race.endDate) >= timestamp,
  );
  if (activeRace) return { phase: "current" as const, race: activeRace };

  const nextRace = RACE_DEFINITIONS.find(
    (race) => startOfRaceWeekend(race.startDate) > timestamp,
  );
  if (nextRace) return { phase: "next" as const, race: nextRace };

  return {
    phase: "off-season" as const,
    race: RACE_DEFINITIONS[RACE_DEFINITIONS.length - 1],
  };
}

export function getSeasonRaceSelection2026(
  now = new Date(),
): SeasonRaceSelection {
  const selection = getSelectionDefinition(now);
  const races = getSeason2026(now);
  const race = races.find((entry) => entry.id === selection.race.id);

  return {
    phase: selection.phase,
    race: race ?? { ...selection.race, status: "completed" },
  };
}

export function getSeason2026(now = new Date()): SeasonRace[] {
  const selection = getSelectionDefinition(now);
  const timestamp = now.getTime();

  return RACE_DEFINITIONS.map((race) => ({
    ...race,
    eventId: `${race.id}-gp-2026`,
    circuitId: race.id,
    status:
      endOfRaceWeekend(race.endDate) < timestamp
        ? "completed"
        : selection.phase !== "off-season" && race.id === selection.race.id
          ? "current"
          : "upcoming",
  }));
}

export const F1_2026_CALENDAR: readonly SeasonRace[] = getSeason2026();

export const EUROPE_2026_RACES = F1_2026_CALENDAR.filter(
  (race) => race.region === "EUROPE",
);
