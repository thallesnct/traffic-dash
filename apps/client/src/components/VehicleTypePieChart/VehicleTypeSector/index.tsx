import { Sector, type PieSectorShapeProps } from "recharts";

import { colorForCode } from "../../../lib/colors";
import type { VehicleDistribution } from "../types";

export function VehicleTypeSector({
  payload,
  ...props
}: PieSectorShapeProps): React.JSX.Element {
  const vehicle = payload as VehicleDistribution;

  return <Sector {...props} fill={colorForCode(vehicle.vehicleType)} />;
}
