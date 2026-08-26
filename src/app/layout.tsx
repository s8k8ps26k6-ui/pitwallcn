import type { Metadata, Viewport } from "next";
import "@fontsource-variable/noto-sans-sc/wght.css";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { getCurrentSeasonRace } from "@/lib/atlas/race-detail";
import { getEventTheme } from "@/lib/event-theme";

const siteUrl = "https://pitwallcn.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LAPMETRY | 中文 F1 数据指挥台",
    template: "%s | LAPMETRY",
  },
  description:
    "LAPMETRY 是面向中文 F1 车迷的非官方中文 F1 数据指挥台，提供赛程、赛控、比赛结果、圈速分析和赛道天气等比赛周末数据入口。",
  keywords: [
    "F1",
    "Formula 1",
    "OpenF1",
    "LAPMETRY",
    "F1 Race Data Command Center",
    "赛车数据",
    "赛会控制",
    "圈速分析",
    "比赛结果",
  ],
  authors: [{ name: "LAPMETRY" }],
  creator: "LAPMETRY",
  publisher: "LAPMETRY",
  applicationName: "LAPMETRY",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "LAPMETRY | 中文 F1 数据指挥台",
    description: "LAPMETRY — F1 Race Data Command Center。",
    url: siteUrl,
    siteName: "LAPMETRY",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "LAPMETRY | 中文 F1 数据指挥台",
    description: "LAPMETRY — F1 Race Data Command Center。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentTheme = getEventTheme(getCurrentSeasonRace().race.race.id);

  return (
    <html lang="zh-CN">
      <body>
        <SiteShell dataTheme={currentTheme}>{children}</SiteShell>
      </body>
    </html>
  );
}
