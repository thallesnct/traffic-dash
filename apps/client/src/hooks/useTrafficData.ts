import type { CountryCode, Window } from "@traffic-dashboard/shared";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  fetchByCountry,
  fetchByVehicleType,
  fetchCountries,
  fetchTrend,
  fetchVehicleTypes,
  upsertTraffic,
  type UpsertTrafficInput,
} from "../lib/api";

const STALE_TIME_MS = 30_000;

const TREND = "trend";
const BY_COUNTRY = "by-country";
const BY_VEHICLE_TYPE = "by-vehicle-type";

export const trafficQueryKeys = {
  trend: (window: Window) => [TREND, window] as const,
  byCountry: (window: Window) => [BY_COUNTRY, window] as const,
  byVehicleType: (window: Window, country?: CountryCode) =>
    [BY_VEHICLE_TYPE, window, country] as const,
};

const aggregatePrefixes = [[TREND], [BY_COUNTRY], [BY_VEHICLE_TYPE]];

export function useCountries() {
  return useQuery({ queryKey: ["countries"], queryFn: fetchCountries });
}

export function useVehicleTypes() {
  return useQuery({ queryKey: ["vehicle-types"], queryFn: fetchVehicleTypes });
}

export function useTrend(window: Window) {
  return useQuery({
    queryKey: trafficQueryKeys.trend(window),
    queryFn: () => fetchTrend(window),
    staleTime: STALE_TIME_MS,
  });
}

export function useByCountry(window: Window) {
  return useQuery({
    queryKey: trafficQueryKeys.byCountry(window),
    queryFn: () => fetchByCountry(window),
    staleTime: STALE_TIME_MS,
  });
}

export function useByVehicleType(window: Window, country?: CountryCode) {
  return useQuery({
    queryKey: trafficQueryKeys.byVehicleType(window, country),
    queryFn: () => fetchByVehicleType(window, country),
    staleTime: STALE_TIME_MS,
    placeholderData: keepPreviousData,
  });
}

export function useUpsertTraffic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertTrafficInput) => upsertTraffic(input),
    onSuccess: async () => {
      await Promise.all(
        aggregatePrefixes.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
  });
}
