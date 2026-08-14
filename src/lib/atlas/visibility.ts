export type AtlasLabelOffset = readonly [number, number];

export type ProjectedPoint = {
  x: number;
  y: number;
  z: number;
};

export type ProjectedViewportPadding =
  | number
  | {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };

export function isProjectedPointVisible(
  point: ProjectedPoint,
  padding: ProjectedViewportPadding = 0,
) {
  const safePadding =
    typeof padding === "number"
      ? { top: padding, right: padding, bottom: padding, left: padding }
      : padding;
  return (
    point.z >= -1 &&
    point.z <= 1 &&
    point.x >= -1 + safePadding.left &&
    point.x <= 1 - safePadding.right &&
    point.y >= -1 + safePadding.bottom &&
    point.y <= 1 - safePadding.top
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
  safeInsets?: { top: number; right: number; bottom: number; left: number };
  maxLeaderLength?: number;
};

function isOffsetWithinSafeViewport({
  point,
  viewportWidth,
  viewportHeight,
  offset,
  labelWidth,
  labelHeight,
  margin,
  safeInsets,
}: Omit<LabelPlacementInput, "preferred" | "maxLeaderLength"> & {
  offset: AtlasLabelOffset;
}) {
  const anchorX = (point.x * 0.5 + 0.5) * viewportWidth;
  const anchorY = (-point.y * 0.5 + 0.5) * viewportHeight;
  const [offsetX, offsetY] = offset;
  const width = labelWidth ?? 146;
  const height = labelHeight ?? 26;
  const edgeMargin = margin ?? 14;
  const viewportInsets = safeInsets ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const left = offsetX < 0 ? anchorX + offsetX - width : anchorX + offsetX;
  const right = left + width;
  const top = anchorY + offsetY - height / 2;
  const bottom = top + height;
  return (
    left >= edgeMargin + viewportInsets.left &&
    right <= viewportWidth - edgeMargin - viewportInsets.right &&
    top >= edgeMargin + viewportInsets.top &&
    bottom <= viewportHeight - edgeMargin - viewportInsets.bottom
  );
}

export function isLabelOffsetWithinSafeViewport(
  input: Omit<LabelPlacementInput, "preferred" | "maxLeaderLength"> & {
    offset: AtlasLabelOffset;
  },
) {
  return isOffsetWithinSafeViewport({
    ...input,
    safeInsets: input.safeInsets ?? { top: 0, right: 0, bottom: 0, left: 0 },
  });
}

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
  safeInsets = { top: 0, right: 0, bottom: 0, left: 0 },
  maxLeaderLength = 132,
}: LabelPlacementInput): AtlasLabelOffset | null {
  if (!isProjectedPointVisible(point)) return null;

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
    const offset = [offsetX, offsetY] as AtlasLabelOffset;
    if (
      Math.hypot(offsetX, offsetY) <= maxLeaderLength &&
      isOffsetWithinSafeViewport({
        point,
        viewportWidth,
        viewportHeight,
        offset,
        labelWidth,
        labelHeight,
        margin,
        safeInsets,
      })
    ) {
      return [offsetX, offsetY];
    }
  }

  return null;
}
