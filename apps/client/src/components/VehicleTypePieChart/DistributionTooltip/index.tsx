import type { TooltipContentProps } from "recharts";

import type { VehicleDistribution } from "../types";
import "./DistributionTooltip.css";
import { capitalized } from "../formatting";

export function DistributionTooltip({
  active,
  payload,
}: TooltipContentProps): React.JSX.Element | null {
  const vehicle = payload[0]?.payload as VehicleDistribution | undefined;

  if (!active || vehicle === undefined) {
    return null;
  }

  return (
    <div className="distribution-tooltip" role="status">
      <strong>{capitalized(vehicle.vehicleType)}</strong>
      <div>
        {vehicle.totalVehicles.toLocaleString()} vehicles (
        {vehicle.percentage.toFixed(1)}%)
      </div>
    </div>
  );
}
