import { Injectable } from "@nestjs/common";
import {
  resolvePreviousWindow,
  resolveWindow,
  toIsoDate,
  type ByCountryResponse,
  type ByVehicleTypeResponse,
  type CountryCode,
  type TrendResponse,
  type Window,
} from "@traffic-dashboard/shared";

import { CountriesService } from "../countries/countries.service";
import { VehicleTypesService } from "../vehicle-types/vehicle-types.service";
import {
  buildCountryTrends,
  percentageOfTotal,
  toBusiestCountriesResponse,
  type DailyCountryTotal,
} from "./traffic.calculations";
import { TrafficRepository, type DailySeriesRow } from "./traffic.repository";

const TREND_COUNTRY_LIMIT = 5;

export type CacheTier = "hit" | "miss";

export type Served<TResponse> = TResponse & { cacheTier: CacheTier };

const UNCACHED = { cacheTier: "miss" } as const satisfies Served<unknown>;

function toDailyCountryTotals(
  rows: readonly DailySeriesRow[],
): DailyCountryTotal[] {
  return rows.map((row) => ({
    date: toIsoDate(row.recordedDate),
    countryCode: row.countryCode,
    count: row.total,
  }));
}

function sumRowTotals(rows: readonly { total: number }[]): number {
  return rows.reduce((sum, row) => sum + row.total, 0);
}

@Injectable()
export class TrafficService {
  constructor(
    private readonly repository: TrafficRepository,
    private readonly countries: CountriesService,
    private readonly vehicleTypes: VehicleTypesService,
  ) {}

  private async countryNames(): Promise<Map<string, string>> {
    const { data } = await this.countries.findAll();

    return new Map(data.map(({ code, name }) => [code, name]));
  }

  async getTrend(window: Window, now?: Date): Promise<Served<TrendResponse>> {
    const clock = now ?? new Date();
    const current = resolveWindow(window, clock);
    const previous = resolvePreviousWindow(window, clock);

    const [currentRows, previousRows, names] = await Promise.all([
      this.repository.dailySeriesByCountry(current.startDate, current.endDate),
      this.repository.dailySeriesByCountry(
        previous.startDate,
        previous.endDate,
      ),
      this.countryNames(),
    ]);

    const trends = buildCountryTrends(
      toDailyCountryTotals(currentRows),
      toDailyCountryTotals(previousRows),
      current.startDate,
      current.endDate,
      names,
    );

    return {
      ...toBusiestCountriesResponse(trends, TREND_COUNTRY_LIMIT, window),
      ...UNCACHED,
    };
  }

  async getByCountry(
    window: Window,
    now?: Date,
  ): Promise<Served<ByCountryResponse>> {
    const { startDate, endDate } = resolveWindow(window, now ?? new Date());

    const [rows, names] = await Promise.all([
      this.repository.countryTotals(startDate, endDate),
      this.countryNames(),
    ]);

    return {
      data: rows.map((row) => ({
        countryCode: row.countryCode,
        countryName: names.get(row.countryCode) ?? row.countryCode,
        totalVehicles: row.total,
      })),
      meta: {
        window,
        through: endDate,
        total: sumRowTotals(rows),
      },
      ...UNCACHED,
    };
  }

  async getByVehicleType(
    window: Window,
    country?: CountryCode,
    now?: Date,
  ): Promise<Served<ByVehicleTypeResponse>> {
    if (country !== undefined) await this.countries.assertExists(country);

    const { startDate, endDate } = resolveWindow(window, now ?? new Date());
    const rows = await this.repository.vehicleTypeTotals(
      startDate,
      endDate,
      country,
    );
    const total = sumRowTotals(rows);

    return {
      data: rows.map((row) => ({
        vehicleType: row.vehicleType,
        totalVehicles: row.total,
        percentage: percentageOfTotal(row.total, total),
      })),
      meta: { window, through: endDate, total },
      ...UNCACHED,
    };
  }
}
