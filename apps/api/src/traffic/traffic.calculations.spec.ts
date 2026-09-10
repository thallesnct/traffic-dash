import { trendResponseSchema } from "@traffic-dashboard/shared";
import { describe, expect, it } from "vitest";

import {
  buildCountryTrends,
  buildDateAxis,
  percentageChange,
  toBusiestCountriesResponse,
  toChosenCountriesResponse,
  type DailyCountryTotal,
} from "./traffic.calculations";

const START_DATE = "2026-09-06";
const END_DATE = "2026-09-08";

describe("Traffic Calculations | buildDateAxis", () => {
  it("Should include both ends of the axis", () => {
    expect(buildDateAxis(START_DATE, END_DATE)).toEqual([
      "2026-09-06",
      "2026-09-07",
      "2026-09-08",
    ]);
  });

  it("Should return a single date when from equals to", () => {
    expect(buildDateAxis(START_DATE, START_DATE)).toEqual([START_DATE]);
  });

  it("Should cross a month boundary", () => {
    expect(buildDateAxis("2026-08-30", "2026-09-01")).toEqual([
      "2026-08-30",
      "2026-08-31",
      "2026-09-01",
    ]);
  });
});

describe("Traffic Calculations | percentageChange", () => {
  it("Should return 0 when both periods are zero", () => {
    expect(percentageChange({ current: 0, previous: 0 })).toBe(0);
  });

  it("Should return null when the previous period is zero and the current is positive", () => {
    expect(percentageChange({ current: 40, previous: 0 })).toBeNull();
  });

  it("Should round to one decimal place", () => {
    expect(percentageChange({ current: 40, previous: 20 })).toBe(100);
    expect(percentageChange({ current: 0, previous: 5 })).toBe(-100);
    expect(percentageChange({ current: 7, previous: 3 })).toBe(133.3);
  });
});

describe("Traffic Calculations | buildCountryTrends", () => {
  const current: DailyCountryTotal[] = [
    { date: "2026-09-06", countryCode: "US", count: 10 },
    { date: "2026-09-08", countryCode: "US", count: 30 },
  ];
  const previous: DailyCountryTotal[] = [
    { date: "2026-08-30", countryCode: "US", count: 20 },
    { date: "2026-08-30", countryCode: "BR", count: 5 },
  ];

  it("Should place counts in their date slots and seed countries from either period", () => {
    const { dates, series } = buildCountryTrends(
      current,
      previous,
      START_DATE,
      END_DATE,
    );

    expect(dates).toEqual(["2026-09-06", "2026-09-07", "2026-09-08"]);

    const us = series.find((item) => item.countryCode === "US");
    const br = series.find((item) => item.countryCode === "BR");

    expect(us).toMatchObject({
      points: [10, 0, 30],
      total: 40,
      previousTotal: 20,
      deltaPct: 100,
    });
    expect(br).toMatchObject({
      points: [0, 0, 0],
      total: 0,
      previousTotal: 5,
      deltaPct: -100,
    });
  });

  it("Should sort descending by current total", () => {
    const { series } = buildCountryTrends(
      current,
      previous,
      START_DATE,
      END_DATE,
    );

    expect(series.map((item) => item.countryCode)).toEqual(["US", "BR"]);
  });

  it("Should ignore points outside the supplied axis", () => {
    const { series } = buildCountryTrends(
      [...current, { date: "2026-09-20", countryCode: "US", count: 999 }],
      previous,
      START_DATE,
      END_DATE,
    );

    expect(series[0].points).toEqual([10, 0, 30]);
    expect(series[0].total).toBe(40);
  });

  it("Should fall back to the code when no display name is supplied", () => {
    const { series } = buildCountryTrends(
      current,
      previous,
      START_DATE,
      END_DATE,
    );

    expect(series[0].countryName).toBe("US");
  });

  it("Should use supplied display names", () => {
    const names = new Map([["US", "United States"]]);
    const { series } = buildCountryTrends(
      current,
      previous,
      START_DATE,
      END_DATE,
      names,
    );

    expect(series[0].countryName).toBe("United States");
  });
});

function trendsFor(countries: number) {
  const current: DailyCountryTotal[] = [];
  const previous: DailyCountryTotal[] = [];

  for (let index = 0; index < countries; index += 1) {
    const countryCode = `A${String.fromCharCode(65 + index)}`;
    current.push({
      date: START_DATE,
      countryCode,
      count: (countries - index) * 100,
    });
    previous.push({ date: "2026-08-30", countryCode, count: 50 });
  }

  return buildCountryTrends(current, previous, START_DATE, END_DATE);
}

describe("Traffic Calculations | toBusiestCountriesResponse", () => {
  it("Should keep topN series and summarise the rest in other", () => {
    const trends = trendsFor(12);
    const response = toBusiestCountriesResponse(trends, 10, "7d");

    expect(response.data.series).toHaveLength(10);
    expect(response.meta).toEqual({
      window: "7d",
      through: END_DATE,
      topN: 10,
    });

    const hidden = trends.series.slice(10);

    expect(hidden.map((item) => item.countryCode)).toEqual(["AK", "AL"]);
    expect(response.data.other).toEqual({
      total: hidden.reduce((sum, item) => sum + item.total, 0),
      previousTotal: hidden.reduce((sum, item) => sum + item.previousTotal, 0),
      deltaPct: percentageChange({ current: 300, previous: 100 }),
    });
  });

  it("Should return a schema-valid response", () => {
    expect(() =>
      trendResponseSchema.parse(
        toBusiestCountriesResponse(trendsFor(12), 10, "7d"),
      ),
    ).not.toThrow();
  });

  it("Should set other to null when nothing is hidden", () => {
    expect(
      toBusiestCountriesResponse(trendsFor(3), 10, "30d").data.other,
    ).toBeNull();
  });
});

describe("Traffic Calculations | toChosenCountriesResponse", () => {
  it("Should keep requested codes and summarise the rest", () => {
    const response = toChosenCountriesResponse(
      trendsFor(12),
      new Set(["AA", "AL"]),
      "90d",
    );

    expect(response.data.series.map((item) => item.countryCode)).toEqual([
      "AA",
      "AL",
    ]);
    expect(response.data.other?.total).toBe(
      trendsFor(12)
        .series.filter((item) => !["AA", "AL"].includes(item.countryCode))
        .reduce((sum, item) => sum + item.total, 0),
    );
    expect(trendResponseSchema.parse(response).meta.topN).toBe(2);
  });

  it("Should return no series for a country absent from both periods", () => {
    const response = toChosenCountriesResponse(
      trendsFor(3),
      new Set(["ZZ"]),
      "7d",
    );

    expect(response.data.series).toEqual([]);
  });
});
