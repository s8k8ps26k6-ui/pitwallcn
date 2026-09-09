import { getCountryCode } from "@/lib/atlas/race-detail";
import flags from "./country-flags.json";

const supportedCountries = new Set(["Australia", "China", "Japan", "United States", "Canada", "Monaco", "Spain", "Austria", "United Kingdom", "Belgium", "Hungary", "Netherlands", "Azerbaijan", "Singapore", "Mexico", "Brazil", "Qatar", "United Arab Emirates"]);

/** Local SVG images, never system regional-indicator glyphs or runtime fetches. */
export function HomeCountryFlag({ country }: { country: string }) {
  if (country !== "Italy") {
    const code = getCountryCode(country);
    const svg = supportedCountries.has(country) ? flags[code as keyof typeof flags] : undefined;
    if (!svg) return <span aria-label={country}>{code || country}</span>;
    // SVG image documents isolate their internal IDs and cannot execute scripts.
    return <svg viewBox="0 0 24 18" width="24" height="18" role="img" aria-label={country} focusable="false" style={{ flexShrink: 0 }}>
      <image width="24" height="18" href={`data:image/svg+xml,${encodeURIComponent(svg)}`}/>
    </svg>;
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
