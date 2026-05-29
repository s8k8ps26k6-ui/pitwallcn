import Link from "next/link";
import type { UrlObject } from "url";

type RaceWeekendReturnLinkProps = {
  session?: string;
};

function raceWeekendHref(session?: string): UrlObject | "/race-weekend" {
  if (!session) return "/race-weekend";

  const parsed = Number(session);
  if (!Number.isFinite(parsed)) return "/race-weekend";

  return { pathname: "/race-weekend", query: { session: String(parsed) } };
}

export function RaceWeekendReturnLink({ session }: RaceWeekendReturnLinkProps) {
  return (
    <Link
      className="race-code inline-flex rounded-full border border-neonAmber/50 bg-neonAmber/10 px-3 py-1.5 text-neonAmber transition hover:border-neonAmber hover:bg-neonAmber/20"
      href={raceWeekendHref(session)}
    >
      ← 返回单站复盘菜单
    </Link>
  );
}
