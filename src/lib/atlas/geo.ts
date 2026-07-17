import * as THREE from "three";

const DEG_TO_RAD = Math.PI / 180;

export function latLonToVector3(
  latitude: number,
  longitude: number,
  radius = 1,
) {
  const polar = (90 - latitude) * DEG_TO_RAD;
  const azimuth = (longitude + 180) * DEG_TO_RAD;

  return new THREE.Vector3(
    -radius * Math.sin(polar) * Math.cos(azimuth),
    radius * Math.cos(polar),
    radius * Math.sin(polar) * Math.sin(azimuth),
  );
}

export function angularDistanceDegrees(a: THREE.Vector3, b: THREE.Vector3) {
  const dot = THREE.MathUtils.clamp(
    a.clone().normalize().dot(b.clone().normalize()),
    -1,
    1,
  );
  return Math.acos(dot) / DEG_TO_RAD;
}

export function tangentQuaternion(normal: THREE.Vector3) {
  return new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal.clone().normalize(),
  );
}
