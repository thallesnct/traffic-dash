import type { Country, CountryCode } from "@traffic-dashboard/shared";

import type { VehicleDistribution } from "./types";

const MIN_LABEL_PERCENTAGE = 8;

export function capitalized(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function countryName(
  countries: readonly Country[],
  code: CountryCode,
): string {
  return countries.find((country) => country.code === code)?.name ?? code;
}

export function formatVehicleTypeLabel(
  vehicle: VehicleDistribution,
): string | null {
  if (vehicle.percentage < MIN_LABEL_PERCENTAGE) {
    return null;
  }

  return `${capitalized(vehicle.vehicleType)} ${Math.round(vehicle.percentage)}%`;
}
