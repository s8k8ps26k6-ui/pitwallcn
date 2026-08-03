import "server-only";

import type { NewsArticle } from "./news-types";

export type NewsSourceConfig = {
  id: string;
  name: string;
  mode: "rss" | "api";
  feedUrl: string;
  enabled: boolean;
};

/**
 * Server-side source registry. Sources remain disabled until their licence,
 * feed terms and parsing policy are recorded; the browser never fetches media.
 */
export const NEWS_SOURCES: readonly NewsSourceConfig[] = [
  { id: "formula1", name: "Formula 1", mode: "rss", feedUrl: "https://www.formula1.com/", enabled: false },
];

let cachedArticles: readonly NewsArticle[] = [];
let cachedAt = 0;

export async function getNewsFeed() {
  // The first release intentionally does not scrape or proxy third-party pages.
  // Once an approved RSS/API adapter is enabled, this cache becomes its shared
  // last-known-good response and protects page loads from feed failures.
  if (Date.now() - cachedAt > 15 * 60_000) {
    cachedArticles = [];
    cachedAt = Date.now();
  }
  return cachedArticles;
}
