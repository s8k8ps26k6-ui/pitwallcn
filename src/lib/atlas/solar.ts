import { latLonToVector3 } from "./geo";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export type SolarSubpoint = {
  latitude: number;
  longitude: number;
};

export type SolarState = SolarSubpoint & {
  utc: string;
  direction: readonly [number, number, number];
};

function normalizeLongitude(longitude: number) {
  return ((longitude + 180) % 360 + 360) % 360 - 180;
}

/**
 * NOAA's fractional-year approximation. It is accurate enough for a visual
 * terminator and, unlike a fixed art light, remains tied to UTC geography.
 */
export function getSolarSubpoint(date = new Date()): SolarSubpoint {
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - yearStart) / 86_400_000) + 1;
  const utcHours =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3_600;
  const fractionalYear =
    ((2 * Math.PI) / 365) * (dayOfYear - 1 + (utcHours - 12) / 24);
  const equationOfTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(fractionalYear) -
      0.032077 * Math.sin(fractionalYear) -
      0.014615 * Math.cos(2 * fractionalYear) -
      0.040849 * Math.sin(2 * fractionalYear));
  const declination =
    0.006918 -
    0.399912 * Math.cos(fractionalYear) +
    0.070257 * Math.sin(fractionalYear) -
    0.006758 * Math.cos(2 * fractionalYear) +
    0.000907 * Math.sin(2 * fractionalYear) -
    0.002697 * Math.cos(3 * fractionalYear) +
    0.00148 * Math.sin(3 * fractionalYear);
  const utcMinutes = utcHours * 60;

  return {
    latitude: declination * RAD_TO_DEG,
    longitude: normalizeLongitude((720 - utcMinutes - equationOfTime) / 4),
  };
}

export function getSolarDirection(date = new Date()) {
  const subpoint = getSolarSubpoint(date);
  return latLonToVector3(
    subpoint.latitude,
    subpoint.longitude,
    1,
  ).normalize();
}

export function getSolarState(date = new Date()): SolarState {
  const subpoint = getSolarSubpoint(date);
  const direction = latLonToVector3(
    subpoint.latitude,
    subpoint.longitude,
    1,
  ).normalize();

  return {
    latitude: subpoint.latitude,
    longitude: subpoint.longitude,
    utc: date.toISOString(),
    direction: [direction.x, direction.y, direction.z],
  };
}

export function isLocationInDaylight(
  latitude: number,
  longitude: number,
  date = new Date(),
) {
  return (
    latLonToVector3(latitude, longitude, 1)
      .normalize()
      .dot(getSolarDirection(date)) > 0
  );
}

export const SOLAR_TEST_TOLERANCE_RADIANS = 2 * DEG_TO_RAD;
