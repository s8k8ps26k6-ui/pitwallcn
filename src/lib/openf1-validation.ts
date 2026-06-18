export const OPENF1_ENDPOINTS = [
  "meetings",
  "sessions",
  "race_control",
  "session_result",
  "drivers",
  "laps",
  "stints",
  "position",
  "intervals",
  "weather"
] as const;

export type OpenF1Endpoint = (typeof OPENF1_ENDPOINTS)[number];

type ValidationSuccess = {
  ok: true;
  params: Record<string, string>;
};

type ValidationFailure = {
  ok: false;
  error: string;
};

type ValidationResult = ValidationSuccess | ValidationFailure;

const ENDPOINT_PARAMS: Record<OpenF1Endpoint, readonly string[]> = {
  meetings: ["year", "meeting_key"],
  sessions: ["year", "meeting_key", "session_key"],
  race_control: ["session_key", "meeting_key", "driver_number", "lap_number", "date>="],
  session_result: ["session_key", "driver_number"],
  drivers: ["session_key", "meeting_key", "driver_number"],
  laps: ["session_key", "driver_number", "lap_number"],
  stints: ["session_key", "driver_number", "stint_number", "compound"],
  position: ["session_key", "driver_number"],
  intervals: ["session_key", "driver_number"],
  weather: ["session_key", "meeting_key"]
};

const KEY_PATTERN = /^(?:latest|\d{1,10})$/;
const DRIVER_NUMBER_PATTERN = /^\d{1,3}$/;
const POSITIVE_INTEGER_PATTERN = /^\d{1,4}$/;
const YEAR_PATTERN = /^\d{4}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
const COMPOUNDS = new Set(["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET", "UNKNOWN"]);

function isIntegerInRange(value: string, minimum: number, maximum: number) {
  if (!POSITIVE_INTEGER_PATTERN.test(value)) return false;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum;
}

function validateParam(key: string, value: string) {
  switch (key) {
    case "session_key":
    case "meeting_key":
      return KEY_PATTERN.test(value);
    case "driver_number":
      return DRIVER_NUMBER_PATTERN.test(value) && isIntegerInRange(value, 1, 999);
    case "lap_number":
      return isIntegerInRange(value, 1, 999);
    case "stint_number":
      return isIntegerInRange(value, 1, 99);
    case "year": {
      if (!YEAR_PATTERN.test(value)) return false;
      const year = Number(value);
      return year >= 2023 && year <= 2100;
    }
    case "compound":
      return COMPOUNDS.has(value.toUpperCase());
    case "date>=":
      return ISO_DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(value));
    default:
      return false;
  }
}

export function isOpenF1Endpoint(value: string): value is OpenF1Endpoint {
  return (OPENF1_ENDPOINTS as readonly string[]).includes(value);
}

export function validateOpenF1SearchParams(endpoint: OpenF1Endpoint, searchParams: URLSearchParams): ValidationResult {
  const entries = Array.from(searchParams.entries());
  if (!entries.length) {
    return {
      ok: false,
      error: "At least one validated OpenF1 query parameter is required"
    };
  }

  const allowedParams = ENDPOINT_PARAMS[endpoint];
  const validatedParams: Record<string, string> = {};

  for (const [key, rawValue] of entries) {
    if (!allowedParams.includes(key)) {
      return {
        ok: false,
        error: `Unsupported query parameter for ${endpoint}: ${key}`
      };
    }

    if (searchParams.getAll(key).length !== 1) {
      return {
        ok: false,
        error: `Duplicate query parameter is not allowed: ${key}`
      };
    }

    const value = rawValue.trim();
    if (!value || !validateParam(key, value)) {
      return {
        ok: false,
        error: `Invalid value for query parameter: ${key}`
      };
    }

    validatedParams[key] = key === "compound" ? value.toUpperCase() : value;
  }

  return {
    ok: true,
    params: validatedParams
  };
}
