import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
} from "recharts";

import { useByCountry } from "../hooks/useTrafficData";
import { useTrafficWindow } from "../hooks/useTrafficWindow";
import { SERIES_COLORS } from "../lib/colors";

const COUNTRY_ROW_HEIGHT = 30;
const MIN_CHART_HEIGHT = 340;
const CHART_VIEWPORT_HEIGHT = 520;

function barOpacity(index: number, total: number): number {
  if (total <= 1) return 1;

  return 1 - (index / (total - 1)) * 0.6;
}

function CountryBarShape({
  index,
  total,
  ...props
}: BarShapeProps & { total: number }) {
  return (
    <Rectangle
      {...props}
      fill={SERIES_COLORS[0]}
      fillOpacity={barOpacity(index, total)}
      radius={[0, 4, 4, 0]}
    />
  );
}

export function CountryBarChart() {
  const { activeWindow } = useTrafficWindow();
  const { data, isPending, isError, error } = useByCountry(activeWindow);

  if (isPending) {
    return (
      <section aria-labelledby="country-traffic-heading">
        <h2 id="country-traffic-heading">
          Country-wise amount of vehicles in traffic
        </h2>
        <p>Loading country totals…</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section aria-labelledby="country-traffic-heading">
        <h2 id="country-traffic-heading">
          Country-wise amount of vehicles in traffic
        </h2>
        <p role="alert">Could not load country totals: {error.message}</p>
      </section>
    );
  }

  const countries = data.body.data;

  if (countries.length === 0) {
    return (
      <section aria-labelledby="country-traffic-heading">
        <h2 id="country-traffic-heading">
          Country-wise amount of vehicles in traffic
        </h2>
        <p>No country traffic was recorded in this window.</p>
      </section>
    );
  }

  const chartHeight = Math.max(
    MIN_CHART_HEIGHT,
    countries.length * COUNTRY_ROW_HEIGHT,
  );

  return (
    <section aria-labelledby="country-traffic-heading">
      <h2 id="country-traffic-heading">Country-wise traffic</h2>
      <div
        aria-label="Scroll through ranked country traffic"
        role="region"
        tabIndex={0}
        style={{ maxHeight: CHART_VIEWPORT_HEIGHT, overflowY: "auto" }}
      >
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={countries}
            layout="vertical"
            margin={{ top: 8, right: 24, bottom: 0, left: 0 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="countryName"
              width={110}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => Number(value).toLocaleString()}
              labelFormatter={(country) => `Country: ${country}`}
            />
            <Bar
              dataKey="totalVehicles"
              maxBarSize={24}
              isAnimationActive={false}
              shape={(props: BarShapeProps) => (
                <CountryBarShape {...props} total={countries.length} />
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
