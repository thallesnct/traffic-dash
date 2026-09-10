import {
  fromIsoDate,
  toIsoDate,
  type IsoDate,
  type TrendResponse,
  type Window,
} from "@traffic-dashboard/shared";

export type DailyCountryTotal = {
  date: IsoDate;
  countryCode: string;
  count: number;
};

export type CountryTrend = {
  countryCode: string;
  countryName: string;
  points: number[];
  total: number;
  previousTotal: number;
  deltaPct: number | null;
};

export type AllCountryTrends = {
  dates: IsoDate[];
  series: CountryTrend[];
};

type CombinedTotals = {
  total: number;
  previousTotal: number;
  deltaPct: number | null;
};

export function buildDateAxis(startDate: IsoDate, endDate: IsoDate): IsoDate[] {
  const dates: IsoDate[] = [];
  const cursor = fromIsoDate(startDate);
  const lastDate = fromIsoDate(endDate);

  while (cursor.getTime() <= lastDate.getTime()) {
    dates.push(toIsoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

export function percentageChange({
  current,
  previous,
}: {
  current: number;
  previous: number;
}): number | null {
  if (previous === 0) return current === 0 ? 0 : null;

  return Math.round((1000 * (current - previous)) / previous) / 10;
}

function combineTotals(trends: readonly CountryTrend[]): CombinedTotals {
  const current = trends.reduce((sum, trend) => sum + trend.total, 0);
  const previous = trends.reduce((sum, trend) => sum + trend.previousTotal, 0);

  return {
    total: current,
    previousTotal: previous,
    deltaPct: percentageChange({ current, previous }),
  };
}

export function buildCountryTrends(
  currentCounts: readonly DailyCountryTotal[],
  previousCounts: readonly DailyCountryTotal[],
  startDate: IsoDate,
  endDate: IsoDate,
  countryNames: ReadonlyMap<string, string> = new Map(),
): AllCountryTrends {
  const dates = buildDateAxis(startDate, endDate);
  const slotByDate = new Map(dates.map((date, slot) => [date, slot]));
  const dailyCountsByCountry = new Map<string, number[]>();

  for (const { countryCode } of [...currentCounts, ...previousCounts]) {
    if (!dailyCountsByCountry.has(countryCode)) {
      dailyCountsByCountry.set(
        countryCode,
        new Array<number>(dates.length).fill(0),
      );
    }
  }

  for (const { date, countryCode, count } of currentCounts) {
    const slot = slotByDate.get(date);
    const dailyCounts = dailyCountsByCountry.get(countryCode);

    if (slot === undefined || dailyCounts === undefined) continue;

    dailyCounts[slot] = count;
  }

  const previousTotalByCountry = new Map<string, number>();

  for (const { countryCode, count } of previousCounts) {
    previousTotalByCountry.set(
      countryCode,
      (previousTotalByCountry.get(countryCode) ?? 0) + count,
    );
  }

  const series = [...dailyCountsByCountry.entries()].map(
    ([countryCode, dailyCounts]): CountryTrend => {
      const total = dailyCounts.reduce((sum, count) => sum + count, 0);
      const previousTotal = previousTotalByCountry.get(countryCode) ?? 0;

      return {
        countryCode,
        countryName: countryNames.get(countryCode) ?? countryCode,
        points: dailyCounts,
        total,
        previousTotal,
        deltaPct: percentageChange({ current: total, previous: previousTotal }),
      };
    },
  );

  series.sort((left, right) => right.total - left.total);

  return { dates, series };
}

function toTrendResponse(
  dates: IsoDate[],
  shown: CountryTrend[],
  hidden: CountryTrend[],
  topN: number,
  window: Window,
): TrendResponse {
  return {
    data: {
      dates,
      series: shown,
      other: hidden.length === 0 ? null : combineTotals(hidden),
    },
    meta: { window, through: dates[dates.length - 1], topN },
  };
}

export function toBusiestCountriesResponse(
  trends: AllCountryTrends,
  limit: number,
  window: Window,
): TrendResponse {
  return toTrendResponse(
    trends.dates,
    trends.series.slice(0, limit),
    trends.series.slice(limit),
    limit,
    window,
  );
}

export function toChosenCountriesResponse(
  trends: AllCountryTrends,
  chosenCodes: ReadonlySet<string>,
  window: Window,
): TrendResponse {
  const shown = trends.series.filter((trend) =>
    chosenCodes.has(trend.countryCode),
  );
  const hidden = trends.series.filter(
    (trend) => !chosenCodes.has(trend.countryCode),
  );

  return toTrendResponse(trends.dates, shown, hidden, chosenCodes.size, window);
}
