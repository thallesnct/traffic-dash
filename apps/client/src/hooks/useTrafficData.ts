import { useQuery } from "@tanstack/react-query";

import { fetchCountries, fetchVehicleTypes } from "../lib/api";

export function useCountries() {
  return useQuery({ queryKey: ["countries"], queryFn: fetchCountries });
}

export function useVehicleTypes() {
  return useQuery({
    queryKey: ["vehicle-types"],
    queryFn: fetchVehicleTypes,
  });
}
