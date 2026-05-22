const OPENF1_BASE_URL = "https://api.openf1.org/v1";
const DEFAULT_OPENF1_TIMEOUT_MS = 6500;

type OpenF1Params = Record<string, string | number>;

type OpenF1FetchOptions = {
  timeoutMs?: number;
  revalidate?: number;
};

export class OpenF1RequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenF1RequestError";
  }
}

export function buildOpenF1Url(path: string, params: OpenF1Params) {
  const url = new URL(`${OPENF1_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  return url.toString();
}

export async function fetchOpenF1<T>(path: string, params: OpenF1Params, options: OpenF1FetchOptions = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_OPENF1_TIMEOUT_MS);

  try {
    const response = await fetch(buildOpenF1Url(path, params), {
      next: { revalidate: options.revalidate ?? 120 },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new OpenF1RequestError(`OpenF1 request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new OpenF1RequestError(`OpenF1 request timed out after ${options.timeoutMs ?? DEFAULT_OPENF1_TIMEOUT_MS}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
