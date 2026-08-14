export type AtlasFavorites = {
  eventIds: readonly string[];
  circuitIds: readonly string[];
};

export const EMPTY_ATLAS_FAVORITES: AtlasFavorites = {
  eventIds: [],
  circuitIds: [],
};

export const ATLAS_FAVORITES_STORAGE_KEY = "griddelta-atlas-favorites-v1";

export function getAtlasStorage(): Pick<Storage, "getItem" | "setItem"> | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function unique(values: readonly unknown[]) {
  return [...new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0))];
}

export function normalizeAtlasFavorites(value: unknown): AtlasFavorites {
  if (!value || typeof value !== "object") return EMPTY_ATLAS_FAVORITES;
  const candidate = value as { eventIds?: unknown; circuitIds?: unknown };
  return {
    eventIds: unique(Array.isArray(candidate.eventIds) ? candidate.eventIds : []),
    circuitIds: unique(Array.isArray(candidate.circuitIds) ? candidate.circuitIds : []),
  };
}

export function toggleFavoriteEvent(
  favorites: AtlasFavorites,
  eventId: string,
): AtlasFavorites {
  const eventIds = favorites.eventIds.includes(eventId)
    ? favorites.eventIds.filter((id) => id !== eventId)
    : [...favorites.eventIds, eventId];
  return { ...favorites, eventIds };
}

export function toggleFavoriteCircuit(
  favorites: AtlasFavorites,
  circuitId: string,
): AtlasFavorites {
  const circuitIds = favorites.circuitIds.includes(circuitId)
    ? favorites.circuitIds.filter((id) => id !== circuitId)
    : [...favorites.circuitIds, circuitId];
  return { ...favorites, circuitIds };
}

export function readAtlasFavorites(storage: Pick<Storage, "getItem"> | null) {
  if (!storage) return EMPTY_ATLAS_FAVORITES;
  try {
    const raw = storage.getItem(ATLAS_FAVORITES_STORAGE_KEY);
    return raw ? normalizeAtlasFavorites(JSON.parse(raw)) : EMPTY_ATLAS_FAVORITES;
  } catch {
    return EMPTY_ATLAS_FAVORITES;
  }
}

export function writeAtlasFavorites(
  storage: Pick<Storage, "setItem"> | null,
  favorites: AtlasFavorites,
) {
  if (!storage) return;
  try {
    storage.setItem(ATLAS_FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Private browsing and storage quotas must not block Atlas interaction.
  }
}
