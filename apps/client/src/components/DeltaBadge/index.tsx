type DeltaBadgeProps = {
  deltaPct: number | null;
};

export function DeltaBadge({ deltaPct }: DeltaBadgeProps) {
  if (deltaPct === null) {
    return <span data-delta="unavailable">n/a</span>;
  }

  if (deltaPct === 0) {
    return <span data-delta="flat">0%</span>;
  }

  const rising = deltaPct > 0;

  return (
    <span data-delta={rising ? "up" : "down"}>
      <span aria-hidden="true">{rising ? "▲" : "▼"}</span>
      {rising ? "+" : ""}
      {deltaPct}%
    </span>
  );
}
