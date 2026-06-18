import "server-only";

const DEFAULT_OPENF1_BASE_URL = "https://api.openf1.org/v1";
const DEFAULT_OPENF1_TIMEOUT_MS = 6500;
export const OPENF1_REVALIDATE_SECONDS = 30;

const OPENF1_BASE_URL = (process.env.OPENF1_BASE_URL ?? DEFAULT_OPENF1_BASE_URL).replace(/\/$/, "");
const OPENF1_PATH_PATTERN = /^\/[a-z_]+$/;

type OpenF1Params = Record<string, string | number>;

type OpenF1FetchOptions = {
  timeoutMs?: number;
  /** Retained for backwards compatibility. OpenF1 responses always revalidate after 30 seconds. */
  revalidate?: number;
};

export class OpenF1RequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenF1RequestError";
  }
}

export function buildOpenF1Url(path: string, params: OpenF1Params) {
  if (!OPENF1_PATH_PATTERN.test(path)) {
    throw new OpenF1RequestError("Invalid OpenF1 endpoint path");
  }

  const url = new URL(`${OPENF1_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  return url.toString();
}

export async function fetchOpenF1<T>(path: string, params: OpenF1Params, options: OpenF1FetchOptions = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_OPENF1_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildOpenF1Url(path, params), {
      headers: {
        Accept: "application/json"
      },
      next: { revalidate: OPENF1_REVALIDATE_SECONDS },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new OpenF1RequestError(`OpenF1 request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new OpenF1RequestError(`OpenF1 request timed out after ${timeoutMs}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
