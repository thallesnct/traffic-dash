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
import {
  MAX_TREND_COUNTRIES,
  type CountryCode,
  type TrendResponse,
} from "@traffic-dashboard/shared";
import { useDeferredValue, useState, type ReactNode } from "react";

import { Card } from "../Card";
import { DataList } from "../DataList";
import { DeltaBadge } from "../DeltaBadge";
import { Select } from "../Select";
import { useCountries, useTrend } from "../../hooks/useTrafficData";
import { useTrafficWindow } from "../../hooks/useTrafficWindow";
import { colorForCode } from "../../lib/colors";
import "./TrendChart.css";

const VISIBLE_SERIES = 5;

type LabelObject = {
  [key in "7d" | "30d" | "90d"]: string;
};

const labels: LabelObject = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

type TrendSeries = TrendResponse["data"]["series"];

function toChartRows(
  dates: readonly string[],
  series: TrendSeries,
): Record<string, string | number>[] {
  return dates.map((date, index) => {
    const row: Record<string, string | number> = { date };

    for (const item of series) row[item.countryCode] = item.points[index];

    return row;
  });
}

export function TrendChart() {
  const { activeWindow } = useTrafficWindow();
  const deferredWindow = useDeferredValue(activeWindow);
  const [selected, setSelected] = useState<CountryCode[] | null>(null);
  const { data, isPending, isError, error } = useTrend(
    deferredWindow,
    selected ?? undefined,
  );
  const { data: countriesData } = useCountries();
  const countries = countriesData?.data ?? [];

  const series = data?.body.data.series ?? [];
  const visible = selected === null ? series.slice(0, VISIBLE_SERIES) : series;
  const other = data?.body.data.other ?? null;
  const selectedCodes = selected ?? visible.map((item) => item.countryCode);

  function nameFor(code: CountryCode): string {
    return (
      countries.find((country) => country.code === code)?.name ??
      series.find((item) => item.countryCode === code)?.countryName ??
      code
    );
  }

  function addCountry(code: CountryCode) {
    setSelected((current) => {
      const next = current ?? visible.map((item) => item.countryCode);

      if (next.includes(code) || next.length >= MAX_TREND_COUNTRIES)
        return next;

      return [...next, code];
    });
  }

  function removeCountry(code: CountryCode) {
    setSelected((current) => {
      const next = (current ?? visible.map((item) => item.countryCode)).filter(
        (entry) => entry !== code,
      );

      return next.length === 0 ? null : next;
    });
  }

  let body: ReactNode;

  if (isPending) {
    body = (
      <p>
        Loading the amount of vehicles participating in traffic and its trend
        over the last {labels[activeWindow]}…
      </p>
    );
  } else if (isError) {
    body = (
      <p role="alert">
        Could not load data on the amount vehicles participating in traffic for
        the last {labels[activeWindow]}: {error.message}
      </p>
    );
  } else if (visible.length === 0) {
    body = (
      <p>No vehicles participating traffic were recorded in this window.</p>
    );
  } else {
    body = (
      <>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={toChartRows(data.body.data.dates, visible)}
            margin={{ top: 8, right: 24, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              horizontal
              vertical={false}
              stroke="var(--grid-line)"
            />
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
        <DataList
          label="Trend totals"
          items={visible.map((item) => ({
            id: item.countryCode,
            color: colorForCode(item.countryCode),
            label: item.countryName,
            value: `${item.total.toLocaleString()} vehicles`,
            action: <DeltaBadge deltaPct={item.deltaPct} />,
          }))}
        />
        {other === null ? null : (
          <p>
            Countries not shown: {other.total.toLocaleString()} vehicles total
            across the selected {labels[activeWindow]} reporting window{" "}
            <DeltaBadge deltaPct={other.deltaPct} />
          </p>
        )}
      </>
    );
  }

  const addableCountries = countries.filter(
    (country) => !selectedCodes.includes(country.code),
  );
  const isAtLimit = selectedCodes.length >= MAX_TREND_COUNTRIES;

  return (
    <Card>
      <section aria-labelledby="trend-heading">
        <h2 id="trend-heading">Traffic trend</h2>
        {body}
        <div className="trend-chart__picker">
          <Select
            id="trend-country-add"
            label="Add country"
            value=""
            placeholder="Select a country"
            disabled={isAtLimit || addableCountries.length === 0}
            options={addableCountries.map((country) => ({
              value: country.code,
              label: country.name,
            }))}
            onChange={(value) => addCountry(value as CountryCode)}
          />
          {isAtLimit ? (
            <p className="trend-chart__limit">
              Showing the maximum of {MAX_TREND_COUNTRIES} countries.
            </p>
          ) : null}
          <DataList
            label="Selected countries"
            layout="chips"
            items={selectedCodes.map((code) => ({
              id: code,
              color: colorForCode(code),
              label: nameFor(code),
              action: (
                <button
                  type="button"
                  aria-label={`Remove ${nameFor(code)}`}
                  onClick={() => removeCountry(code)}
                >
                  ×
                </button>
              ),
            }))}
          />
          {selected === null ? null : (
            <button
              className="trend-chart__reset"
              type="button"
              onClick={() => setSelected(null)}
            >
              Reset to top countries
            </button>
          )}
        </div>
      </section>
    </Card>
  );
}
