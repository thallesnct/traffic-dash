import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "../Card";
import { useTrend } from "../../hooks/useTrafficData";
import { useTrafficWindow } from "../../hooks/useTrafficWindow";
import { colorForCode } from "../../lib/colors";

const VISIBLE_SERIES = 5;

type LabelObject = {
  [key in "7d" | "30d" | "90d"]: string;
};

const labels: LabelObject = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

export function TrendChart() {
  const { activeWindow } = useTrafficWindow();
  const { data, isPending, isError, error } = useTrend(activeWindow);

  if (isPending)
    return (
      <Card>
        <p>
          Loading the amount of vehicles participating in traffic and its trend
          over the last {labels[activeWindow]}…
        </p>
      </Card>
    );

  if (isError)
    return (
      <Card>
        <p role="alert">
          Could not load data on the amount vehicles participating in traffic
          for the last {labels[activeWindow]}: {error.message}
        </p>
      </Card>
    );

  const { dates, series, other } = data.body.data;
  const visible = series.slice(0, VISIBLE_SERIES);

  if (visible.length === 0) {
    return (
      <Card>
        <p>No vehicles participating traffic were recorded in this window.</p>
      </Card>
    );
  }

  const rows = dates.map((date, index) => {
    const row: Record<string, string | number> = { date };

    for (const item of visible) row[item.countryCode] = item.points[index];

    return row;
  });

  return (
    <Card>
      <section aria-labelledby="trend-heading">
        <h2 id="trend-heading">Traffic trend</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={rows}
            margin={{ top: 8, right: 24, bottom: 0, left: 0 }}
          >
            <CartesianGrid horizontal vertical={false} />
            <XAxis dataKey="date" />
            <YAxis width={48} />
            <Tooltip />
            {visible.length > 1 ? <Legend /> : null}
            {visible.map((item) => (
              <Line
                key={item.countryCode}
                type="monotone"
                dataKey={item.countryCode}
                name={item.countryName}
                stroke={colorForCode(item.countryCode)}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        {other === null ? null : (
          <p>
            Countries not shown: {other.total.toLocaleString()} vehicles total
            across the selected {labels[activeWindow]} reporting window.
          </p>
        )}
      </section>
    </Card>
  );
}
