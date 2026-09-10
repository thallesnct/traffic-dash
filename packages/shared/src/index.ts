import * as country from "./resources/country";
export { countrySchema, countriesResponseSchema } from "./resources/country";
export { type Country, type CountriesResponse } from "./resources/country";

import * as vehicleType from "./resources/vehicle-type";
export { vehicleTypeSchema, vehicleTypesResponseSchema } from "./resources/vehicle-type";
export { type VehicleType, type VehicleTypesResponse } from "./resources/vehicle-type";

import * as window from "./reporting/window";
export { resolvePreviousWindow, resolveWindow, toIsoDate } from "./reporting/window";
export { type IsoDate,type Window, type WindowResult } from "./reporting/window";
export { WINDOWS, windowSchema } from "./reporting/window";

export default {
  country,
  vehicleType,
  window,
};
