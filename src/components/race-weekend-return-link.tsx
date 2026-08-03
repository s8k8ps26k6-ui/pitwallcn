import { BackNavigation } from "@/components/back-navigation";

/** Retains the legacy component surface while using the shared back semantics. */
export function RaceWeekendReturnLink({ session: _session }: { session?: string }) {
  void _session;
  return <BackNavigation
    className="race-code inline-flex min-h-10 items-center rounded-xl border border-neonAmber/50 bg-neonAmber/10 px-3 text-neonAmber transition hover:border-neonAmber hover:bg-neonAmber/20"
    fallbackHref="/race-weekend"
    fallbackLabel="返回比赛周"
  />;
}
