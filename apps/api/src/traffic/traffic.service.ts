import { Injectable } from "@nestjs/common";
import {
  resolvePreviousWindow,
  resolveWindow,
  responseKey,
  toIsoDate,
  type ByCountryResponse,
  type ByVehicleTypeResponse,
  type CountryCode,
  type IsoDate,
  type TrendResponse,
  type UpsertTrafficResponse,
  type VehicleTypeCode,
  type Window,
} from "@traffic-dashboard/shared";

import { RedisCacheService } from "../cache/redis-cache.service";
import type { Served } from "../common/served";
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
const RESPONSE_TTL_SECONDS = 60;

export type UpsertedTraffic = UpsertTrafficResponse["data"];

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
    private readonly cache: RedisCacheService,
    private readonly countries: CountriesService,
    private readonly vehicleTypes: VehicleTypesService,
  ) {}

  private async countryNames(): Promise<Map<string, string>> {
    const { data } = await this.countries.findAll();

    return new Map(data.map(({ code, name }) => [code, name]));
  }

  async getTrend(window: Window): Promise<Served<TrendResponse>> {
    const generation = await this.cache.getGeneration();

    return this.cache.getOrSetJson(
      responseKey({ endpoint: "trend", generation, window }),
      RESPONSE_TTL_SECONDS,
      () => this.getTrendUncached(window),
    );
  }

  async getByCountry(window: Window): Promise<Served<ByCountryResponse>> {
    const generation = await this.cache.getGeneration();

    return this.cache.getOrSetJson(
      responseKey({ endpoint: "by-country", generation, window }),
      RESPONSE_TTL_SECONDS,
      () => this.getByCountryUncached(window),
    );
  }

  async getByVehicleType(
    window: Window,
    country?: CountryCode,
  ): Promise<Served<ByVehicleTypeResponse>> {
    if (country !== undefined) await this.countries.assertExists(country);

    const generation = await this.cache.getGeneration();

    return this.cache.getOrSetJson(
      responseKey({ endpoint: "by-vehicle-type", generation, window, country }),
      RESPONSE_TTL_SECONDS,
      () => this.getByVehicleTypeUncached(window, country),
    );
  }

  async getTrendUncached(window: Window, now?: Date): Promise<TrendResponse> {
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

    return toBusiestCountriesResponse(trends, TREND_COUNTRY_LIMIT, window);
  }

  async getByCountryUncached(
    window: Window,
    now?: Date,
  ): Promise<ByCountryResponse> {
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
      meta: { window, through: endDate, total: sumRowTotals(rows) },
    };
  }

  async getByVehicleTypeUncached(
    window: Window,
    country?: CountryCode,
    now?: Date,
  ): Promise<ByVehicleTypeResponse> {
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
    };
  }

  async upsert(
    date: IsoDate,
    country: CountryCode,
    vehicleType: VehicleTypeCode,
    vehicleCount: number,
  ): Promise<UpsertedTraffic> {
    await Promise.all([
      this.countries.assertExists(country),
      this.vehicleTypes.assertExists(vehicleType),
    ]);

    const previous = await this.repository.find(date, country, vehicleType);
    const record = await this.repository.upsert(
      date,
      country,
      vehicleType,
      vehicleCount,
    );

    await this.cache.bumpGeneration();

    const countryTotal = await this.repository.countryTotalOnDate(
      date,
      country,
    );

    return {
      recordedDate: toIsoDate(record.recordedDate),
      countryCode: record.countryCode,
      vehicleType: record.vehicleType,
      vehicleCount: record.vehicleCount,
      countryTotal,
      operation: previous === null ? "created" : "updated",
      previousVehicleCount: previous?.vehicleCount ?? null,
    };
  }
}
