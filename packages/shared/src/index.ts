import * as country from "./resources/country";
export {
  countryCodeSchema,
  countrySchema,
  countriesResponseSchema,
} from "./resources/country";
export {
  type CountryCode,
  type Country,
  type CountriesResponse,
} from "./resources/country";

import * as vehicleType from "./resources/vehicle-type";
export {
  vehicleTypeCodeSchema,
  vehicleTypeSchema,
  vehicleTypesResponseSchema,
} from "./resources/vehicle-type";
export {
  type VehicleTypeCode,
  type VehicleType,
  type VehicleTypesResponse,
} from "./resources/vehicle-type";

import * as window from "./reporting/window";
export {
  resolvePreviousWindow,
  resolveWindow,
  toIsoDate,
} from "./reporting/window";
export {
  type IsoDate,
  type Window,
  type WindowResult,
} from "./reporting/window";
export { isoDateSchema, WINDOWS, windowSchema } from "./reporting/window";

import * as traffic from "./traffic/traffic";
export * from "./traffic/traffic";

export default {
  country,
  vehicleType,
  window,
  traffic,
};
