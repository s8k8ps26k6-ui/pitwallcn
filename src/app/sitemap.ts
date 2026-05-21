import type { MetadataRoute } from "next";

const siteUrl = "https://pitwallcn-57ny.vercel.app";

const routes = [
  "",
  "/schedule",
  "/live",
  "/race-control",
  "/weather",
  "/drivers",
  "/standings",
  "/results",
  "/lap-analysis",
  "/project"
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8
  }));
}
