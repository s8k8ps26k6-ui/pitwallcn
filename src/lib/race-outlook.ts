import "server-only";

import type { RaceOutlookReport, RaceOutlookRequest } from "./race-outlook-types";

export type RaceOutlookAdapter = {
  generate(request: RaceOutlookRequest): Promise<RaceOutlookReport | null>;
};

const reports = new Map<string, RaceOutlookReport>();
const generationLocks = new Map<string, Promise<RaceOutlookReport | null>>();

function reportKey(request: RaceOutlookRequest) {
  return `${request.eventId}:${request.stage}`;
}

/**
 * Idempotent server-only generation boundary. There is deliberately no public
 * route: a future authenticated scheduler invokes this adapter after each
 * verified stage. Keys and model calls never enter the client bundle.
 */
export async function generateRaceOutlookOnce(
  request: RaceOutlookRequest,
  adapter: RaceOutlookAdapter,
) {
  const key = reportKey(request);
  const existing = reports.get(key);
  if (existing) return existing;

  const pending = generationLocks.get(key);
  if (pending) return pending;

  const job = adapter.generate(request)
    .then((report) => {
      if (report) reports.set(key, report);
      return report;
    })
    .finally(() => generationLocks.delete(key));
  generationLocks.set(key, job);
  return job;
}

export function readRaceOutlook(eventId: string, stage: RaceOutlookRequest["stage"]) {
  return reports.get(`${eventId}:${stage}`) ?? null;
}

/** Explicit mock adapter for local verification only; it is never wired to page traffic. */
export const simulatedRaceOutlookAdapter: RaceOutlookAdapter = {
  async generate(request) {
    return {
      eventId: request.eventId,
      stage: request.stage,
      generatedAt: new Date().toISOString(),
      modelVersion: "simulation/no-model-call",
      confidence: "low",
      dataCompleteness: "partial",
      summary: "模拟报告：仅用于验证版式与缓存锁，不代表真实赛前判断。",
      oneLapPace: "没有导入真实圈速数据。",
      longRunPace: "没有导入真实长距离数据。",
      tyreRisk: "没有导入真实轮胎数据。",
      weatherOrSafetyCar: "没有导入可靠天气或赛会控制数据。",
      driversToWatch: [],
      scenarios: [],
      evidence: [],
      inputVersions: request.inputs,
      simulation: true,
    };
  },
};
