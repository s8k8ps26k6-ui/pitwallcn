import { notFound } from "next/navigation";
import type { Route } from "next";
import { BackNavigation } from "@/components/back-navigation";
import { RaceOutlookPanel } from "@/components/race-outlook/race-outlook-panel";
import { getRaceByEventId } from "@/lib/atlas/race-detail";
import { readRaceOutlook } from "@/lib/race-outlook";

export default async function RaceOutlookPage({ params }: { params: Promise<{ season: string; eventId: string }> }) {
  const { season, eventId } = await params;
  if (season !== "2026") notFound();
  const race = getRaceByEventId(eventId);
  if (!race) notFound();
  const report = readRaceOutlook(eventId, "qualifying")
    ?? readRaceOutlook(eventId, "fp3")
    ?? readRaceOutlook(eventId, "fp2")
    ?? readRaceOutlook(eventId, "fp1");

  return <main className="mx-auto min-h-screen max-w-3xl px-5 pb-28 pt-8 sm:px-8">
    <BackNavigation className="mb-10 inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-zinc-300 backdrop-blur" fallbackHref={`/races/2026/${eventId}` as Route} fallbackLabel="返回比赛周" />
    <p className="eyebrow">AI Race Outlook</p>
    <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-6xl">{race.race.name}</h1>
    <p className="mt-3 text-sm text-zinc-500">固定结构的阶段性赛前趋势报告；不提供自由提问、投注或赔率建议。</p>
    <div className="mt-10 border-y border-white/10 py-6"><RaceOutlookPanel report={report} /></div>
  </main>;
}
