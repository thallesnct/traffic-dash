import { colorForCode } from "../../../lib/colors";
import "./DistributionLegend.css";
import type { VehicleDistribution } from "../types";
import { capitalized } from "../formatting";

type DistributionLegendProps = {
  data: readonly VehicleDistribution[];
};

export function DistributionLegend({
  data,
}: DistributionLegendProps): React.JSX.Element {
  return (
    <ul className="distribution-legend" aria-label="Vehicle type legend">
      {data.map((vehicle) => (
        <li key={vehicle.vehicleType}>
          <span
            aria-hidden="true"
            style={{
              backgroundColor: colorForCode(vehicle.vehicleType),
              display: "inline-block",
              height: "0.75em",
              marginRight: "0.4em",
              width: "0.75em",
            }}
          />
          {capitalized(vehicle.vehicleType)}
        </li>
      ))}
    </ul>
  );
}
