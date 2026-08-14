import type { CircuitOutlinePoint } from "@/lib/atlas/circuit-registry";

type CircuitOutlineProps = {
  outline: readonly CircuitOutlinePoint[] | undefined;
  className?: string;
  title?: string;
  showStartMarker?: boolean;
};

export function CircuitOutline({
  outline,
  className,
  title = "Circuit outline",
  showStartMarker = false,
}: CircuitOutlineProps) {
  if (!outline?.length) {
    return <span className={className}>TRACE TBC</span>;
  }

  const points = outline
    .map(([x, y]) => `${(x * 100).toFixed(2)},${((1 - y) * 100).toFixed(2)}`)
    .join(" ");
  const [startX, startY] = outline[0];

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      <polyline points={points} pathLength="1" />
      {showStartMarker ? (
        <circle cx={startX * 100} cy={(1 - startY) * 100} r="1.6" />
      ) : null}
    </svg>
  );
}
