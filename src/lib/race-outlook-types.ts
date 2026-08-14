export type RaceOutlookStage = "fp1" | "fp2" | "fp3" | "qualifying";

export type RaceOutlookInputVersion = {
  source: string;
  version: string;
  capturedAt: string;
};

export type RaceOutlookEvidence = {
  label: string;
  detail: string;
  source: string;
};

export type RaceOutlookScenario = {
  title: string;
  description: string;
};

export type RaceOutlookReport = {
  eventId: string;
  stage: RaceOutlookStage;
  generatedAt: string;
  modelVersion: string;
  confidence: "low" | "medium" | "high";
  dataCompleteness: "partial" | "sufficient";
  summary: string;
  oneLapPace: string;
  longRunPace: string;
  tyreRisk: string;
  weatherOrSafetyCar: string;
  driversToWatch: readonly string[];
  scenarios: readonly RaceOutlookScenario[];
  evidence: readonly RaceOutlookEvidence[];
  inputVersions: readonly RaceOutlookInputVersion[];
  simulation: boolean;
};

export type RaceOutlookRequest = {
  eventId: string;
  stage: RaceOutlookStage;
  inputs: readonly RaceOutlookInputVersion[];
};
