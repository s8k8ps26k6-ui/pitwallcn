export type NewsConfidence =
  | "official"
  | "authoritative"
  | "multi-source"
  | "rumour"
  | "estimate";

export type NewsSource = {
  name: string;
  canonicalUrl: string;
  publishedAt: string;
  paywalled?: boolean;
};

export type NewsArticle = {
  id: string;
  title: string;
  summaryZh: string;
  confidence: NewsConfidence;
  primarySource: NewsSource;
  corroboratingSources?: readonly NewsSource[];
};

export const NEWS_CONFIDENCE_LABELS: Record<NewsConfidence, string> = {
  official: "官方确认",
  authoritative: "权威报道",
  "multi-source": "多方消息",
  rumour: "传闻",
  estimate: "估算",
};

/** Keeps source identity, canonical URL and timestamp in one atomic record. */
export function canonicalizeNewsUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:") throw new Error("News sources must use HTTPS.");
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith("utm_") || ["fbclid", "gclid", "mc_cid", "mc_eid"].includes(key)) {
      url.searchParams.delete(key);
    }
  }
  url.hash = "";
  return url.toString();
}
