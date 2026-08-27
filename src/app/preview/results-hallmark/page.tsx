import type { Metadata } from "next";
import { ResultsHallmarkView } from "@/components/results-hallmark/results-hallmark-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Results Hallmark Preview",
  description: "LAPMETRY Results classification-sheet design preview.",
  robots: {
    index: false,
    follow: false,
  },
};

type ResultsHallmarkSearchParams = {
  session?: string;
};

export default function ResultsHallmarkPreviewPage({
  searchParams,
}: {
  searchParams: Promise<ResultsHallmarkSearchParams>;
}) {
  return <ResultsHallmarkView searchParams={searchParams} />;
}
