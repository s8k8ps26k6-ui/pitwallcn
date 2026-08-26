/**
 * Legacy compatibility surface.
 *
 * Driver identity and championship fields now come from standings-service.
 * Keeping an empty export prevents old imports from silently receiving the
 * former hand-authored points, gaps, stint and tyre values.
 */
export type DriverProfile = {
  code: string;
  name: string;
  team: string;
  number: string;
  href: `/drivers/${string}`;
};

export const drivers: DriverProfile[] = [];

export function getDriverProfile() {
  return null;
}
