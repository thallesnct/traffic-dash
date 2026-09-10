import type {
  ByVehicleTypeResponse,
  Country,
  CountryCode,
} from "@traffic-dashboard/shared";

export type VehicleDistribution = ByVehicleTypeResponse["data"][number];

export type DistributionPanelProps = {
  countries: readonly Country[];
  country: CountryCode;
  otherCountry: CountryCode;
  selectId: string;
  selectLabel: string;
  onCountryChange: (country: CountryCode) => void;
};
