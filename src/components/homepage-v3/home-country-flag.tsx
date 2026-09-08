import { getCountryFlag } from "@/lib/atlas/race-detail";

/** The Monza flag must not depend on regional-indicator emoji support. */
export function HomeCountryFlag({ country }: { country: string }) {
  if (country !== "Italy") {
    return <span role="img" aria-label={country}>{getCountryFlag(country)}</span>;
  }

  return (
    <svg
      viewBox="0 0 3 2"
      width="24"
      height="16"
      role="img"
      aria-label={country}
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      <path fill="#009246" d="M0 0h1v2H0z" />
      <path fill="#fff" d="M1 0h1v2H1z" />
      <path fill="#ce2b37" d="M2 0h1v2H2z" />
    </svg>
  );
}
