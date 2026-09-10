import type { VehicleTypeCode } from "@traffic-dashboard/shared";
import murmur from "murmurhash3js";

export const SERIES_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
] as const;

export const OTHER_COLOR = "var(--series-other)";

export function seriesColor(slot: number): string {
  return SERIES_COLORS[slot] ?? OTHER_COLOR;
}

export function vehicleColor(code: VehicleTypeCode): string {
  return SERIES_COLORS[murmur.x86.hash32(code) % SERIES_COLORS.length];
}
