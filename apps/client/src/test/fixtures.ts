import type {
  ByCountryResponse,
  TrendResponse,
  ByVehicleTypeResponse,
  CountriesResponse,
  UpsertTrafficResponse,
  VehicleTypesResponse,
  Window,
} from "@traffic-dashboard/shared";

import type { Fetched } from "../lib/api";

const THROUGH = "2026-09-10";

export function fetched<TBody>(body: TBody): Fetched<TBody> {
  return { body, cacheTier: "miss" };
}

export const countriesResponse: CountriesResponse = {
  data: [
    { code: "US", name: "United States" },
    { code: "BR", name: "Brazil" },
    { code: "JP", name: "Japan" },
  ],
};

export const vehicleTypesResponse: VehicleTypesResponse = {
  data: [
    { code: "car", name: "Car" },
    { code: "truck", name: "Truck" },
  ],
};

export function trendResponse(
  series: TrendResponse["data"]["series"],
  other: TrendResponse["data"]["other"] = null,
  window: Window = "30d",
): TrendResponse {
  return {
    data: {
      dates: ["2026-09-08", "2026-09-09", "2026-09-10"],
      series,
      other,
    },
    meta: { window, through: THROUGH, topN: 5 },
  };
}

export function trendSeries(
  countryCode: string,
  countryName: string,
  points: number[],
): TrendResponse["data"]["series"][number] {
  const total = points.reduce((sum, point) => sum + point, 0);

  return {
    countryCode,
    countryName,
    points,
    total,
    previousTotal: total,
    deltaPct: 0,
  };
}

export function byCountryResponse(
  rows: ByCountryResponse["data"],
  window: Window = "30d",
): ByCountryResponse {
  return {
    data: rows,
    meta: {
      window,
      through: THROUGH,
      total: rows.reduce((sum, row) => sum + row.totalVehicles, 0),
    },
  };
}

export function byVehicleTypeResponse(
  rows: ByVehicleTypeResponse["data"],
  window: Window = "30d",
): ByVehicleTypeResponse {
  return {
    data: rows,
    meta: {
      window,
      through: THROUGH,
      total: rows.reduce((sum, row) => sum + row.totalVehicles, 0),
    },
  };
}

export function upsertTrafficResponse(
  operation: "created" | "updated",
  countryTotal: number,
): UpsertTrafficResponse {
  return {
    data: {
      recordedDate: THROUGH,
      countryCode: "US",
      vehicleType: "car",
      vehicleCount: 120,
      countryTotal,
      operation,
      previousVehicleCount: operation === "updated" ? 100 : null,
    },
  };
}
