import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

const siteUrl = "https://pitwallcn.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GridDelta CN | F1 数据看板",
    template: "%s | GridDelta CN",
  },
  description:
    "GridDelta CN 是一个面向中文 F1 车迷的非官方数据看板，提供赛程、赛控、比赛结果、圈速分析和赛道天气等比赛周末数据入口。",
  keywords: [
    "F1",
    "Formula 1",
    "OpenF1",
    "GridDelta CN",
    "Grid Delta",
    "赛车数据",
    "赛会控制",
    "圈速分析",
    "比赛结果",
  ],
  authors: [{ name: "GridDelta CN" }],
  creator: "GridDelta CN",
  publisher: "GridDelta CN",
  applicationName: "GridDelta CN",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "GridDelta CN | F1 数据看板",
    description: "面向中文 F1 车迷的非官方比赛周末数据看板。",
    url: siteUrl,
    siteName: "GridDelta CN",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "GridDelta CN | F1 数据看板",
    description: "面向中文 F1 车迷的非官方比赛周末数据看板。",
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
  return (
    <html lang="zh-CN">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
