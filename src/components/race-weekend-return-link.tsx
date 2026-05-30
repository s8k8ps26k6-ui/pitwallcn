import Link from "next/link";
import type { UrlObject } from "url";

type RaceWeekendReturnLinkProps = {
  session?: string;
};

function raceWeekendHref(session?: string): UrlObject | "/race-weekend" {
  const trimmedSession = session?.trim();
  if (!trimmedSession) return "/race-weekend";

  const parsedSession = Number(trimmedSession);
  if (!Number.isFinite(parsedSession)) return "/race-weekend";

  return { pathname: "/race-weekend", query: { session: String(parsedSession) } };
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
