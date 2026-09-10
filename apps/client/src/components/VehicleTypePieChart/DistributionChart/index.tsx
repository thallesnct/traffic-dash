import type { ByVehicleTypeResponse } from "@traffic-dashboard/shared";
import { memo } from "react";
import {
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";

import { DistributionLegend } from "../DistributionLegend";
import "./DistributionChart.css";
import { DistributionTooltip } from "../DistributionTooltip";
import { VehicleTypeSector } from "../VehicleTypeSector";
import { formatVehicleTypeLabel } from "../formatting";
import type { VehicleDistribution } from "../types";

type DistributionChartProps = {
  distribution: ByVehicleTypeResponse;
};

function renderVehicleLabel({ payload }: PieLabelRenderProps): string | null {
  return formatVehicleTypeLabel(payload as VehicleDistribution);
}

export const DistributionChart = memo(function DistributionChart({
  distribution,
}: DistributionChartProps) {
  return (
    <>
      <p className="distribution-chart__total">
        {distribution.meta.total.toLocaleString()} vehicles
      </p>
      <ResponsiveContainer
        className="distribution-chart__render"
        width="100%"
        height={400}
      >
        <PieChart>
          <Pie
            data={distribution.data}
            dataKey="totalVehicles"
            nameKey="vehicleType"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={2}
            strokeWidth={2}
            isAnimationActive={false}
            label={renderVehicleLabel}
            labelLine={false}
            shape={VehicleTypeSector}
          />
          <Tooltip content={DistributionTooltip} />
          <Legend content={<DistributionLegend data={distribution.data} />} />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
});
