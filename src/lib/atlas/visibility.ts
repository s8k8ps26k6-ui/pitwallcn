export type AtlasLabelOffset = readonly [number, number];

export type ProjectedPoint = {
  x: number;
  y: number;
  z: number;
};

export function isProjectedPointVisible(
  point: ProjectedPoint,
  padding = 0,
) {
  return (
    point.z >= -1 &&
    point.z <= 1 &&
    point.x >= -1 + padding &&
    point.x <= 1 - padding &&
    point.y >= -1 + padding &&
    point.y <= 1 - padding
  );
}

export function isSurfacePointVisible(
  normalDotCamera: number,
  cameraDistance: number,
  earthRadius: number,
  horizonBuffer = 0.012,
) {
  return normalDotCamera > earthRadius / Math.max(cameraDistance, 0.001) + horizonBuffer;
}

type LabelPlacementInput = {
  point: ProjectedPoint;
  viewportWidth: number;
  viewportHeight: number;
  preferred: AtlasLabelOffset;
  labelWidth?: number;
  labelHeight?: number;
  margin?: number;
};

function uniqueOffsets(offsets: readonly AtlasLabelOffset[]) {
  return offsets.filter(
    (offset, index) =>
      offsets.findIndex(
        (candidate) => candidate[0] === offset[0] && candidate[1] === offset[1],
      ) === index,
  );
}

export function chooseAdaptiveLabelOffset({
  point,
  viewportWidth,
  viewportHeight,
  preferred,
  labelWidth = 146,
  labelHeight = 26,
  margin = 14,
}: LabelPlacementInput): AtlasLabelOffset | null {
  if (!isProjectedPointVisible(point)) return null;

  const anchorX = (point.x * 0.5 + 0.5) * viewportWidth;
  const anchorY = (-point.y * 0.5 + 0.5) * viewportHeight;
  const horizontal = preferred[0] === 0 ? 1 : Math.sign(preferred[0]);
  const vertical = preferred[1] === 0 ? -1 : Math.sign(preferred[1]);
  const candidates = uniqueOffsets([
    preferred,
    [horizontal * 82, vertical * 36] as AtlasLabelOffset,
    [-horizontal * 82, vertical * 36] as AtlasLabelOffset,
    [0, -70] as AtlasLabelOffset,
    [0, 70] as AtlasLabelOffset,
    [horizontal * 68, -vertical * 60] as AtlasLabelOffset,
    [-horizontal * 68, -vertical * 60] as AtlasLabelOffset,
  ]);

  for (const [offsetX, offsetY] of candidates) {
    const left = offsetX < 0 ? anchorX + offsetX - labelWidth : anchorX + offsetX;
    const right = left + labelWidth;
    const top = anchorY + offsetY - labelHeight / 2;
    const bottom = top + labelHeight;
    if (
      left >= margin &&
      right <= viewportWidth - margin &&
      top >= margin &&
      bottom <= viewportHeight - margin
    ) {
      return [offsetX, offsetY];
    }
  }

  return null;
}
