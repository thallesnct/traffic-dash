import {
  byCountryResponseSchema,
  byVehicleTypeResponseSchema,
  cacheTierSchema,
  countriesResponseSchema,
  trendResponseSchema,
  upsertTrafficResponseSchema,
  vehicleTypesResponseSchema,
  type ByCountryResponse,
  type ByVehicleTypeResponse,
  type CacheTier,
  type CountriesResponse,
  type CountryCode,
  type IsoDate,
  type TrendResponse,
  type UpsertTrafficResponse,
  type VehicleTypeCode,
  type VehicleTypesResponse,
  type Window,
} from "@traffic-dashboard/shared";
import { z } from "zod";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export type Fetched<TBody> = { body: TBody; cacheTier: CacheTier };

function readCacheTier(response: Response): CacheTier {
  const parsed = cacheTierSchema.safeParse(response.headers.get("X-Cache"));

  return parsed.success ? parsed.data : "miss";
}

async function assertOk(response: Response, label: string): Promise<void> {
  if (response.ok) return;

  throw new Error(
    `${label} failed with ${response.status}: ${await response.text()}`,
  );
}

async function getJson<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
): Promise<Fetched<z.infer<TSchema>>> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  await assertOk(response, `GET ${path}`);

  return {
    body: schema.parse(await response.json()),
    cacheTier: readCacheTier(response),
  };
}

export async function fetchCountries(): Promise<CountriesResponse> {
  return (await getJson("/countries", countriesResponseSchema)).body;
}

export async function fetchVehicleTypes(): Promise<VehicleTypesResponse> {
  return (await getJson("/vehicle-types", vehicleTypesResponseSchema)).body;
}

export async function fetchTrend(
  window: Window,
  countries?: readonly CountryCode[],
): Promise<Fetched<TrendResponse>> {
  const query = new URLSearchParams({ window });

  if (countries !== undefined && countries.length > 0)
    query.set("countries", countries.join(","));

  return getJson(`/api/traffic/trend?${query.toString()}`, trendResponseSchema);
}

export async function fetchByCountry(
  window: Window,
): Promise<Fetched<ByCountryResponse>> {
  const query = new URLSearchParams({ window });

  return getJson(
    `/api/traffic/by-country?${query.toString()}`,
    byCountryResponseSchema,
  );
}

export async function fetchByVehicleType(
  window: Window,
  country?: CountryCode,
): Promise<Fetched<ByVehicleTypeResponse>> {
  const query = new URLSearchParams({ window });

  if (country !== undefined) query.set("country", country);

  return getJson(
    `/api/traffic/by-vehicle-type?${query.toString()}`,
    byVehicleTypeResponseSchema,
  );
}

export type UpsertTrafficInput = {
  date: IsoDate;
  country: CountryCode;
  vehicleType: VehicleTypeCode;
  vehicleCount: number;
};

export async function upsertTraffic({
  date,
  country,
  vehicleType,
  vehicleCount,
}: UpsertTrafficInput): Promise<UpsertTrafficResponse> {
  const path = `/api/traffic/${date}/${country}/${vehicleType}`;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vehicleCount }),
  });

  await assertOk(response, `PUT ${path}`);

  return upsertTrafficResponseSchema.parse(await response.json());
}
