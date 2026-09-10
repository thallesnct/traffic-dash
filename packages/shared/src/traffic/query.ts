import { z } from "zod";

import { windowSchema } from "../reporting/window";
import { countryCodeSchema } from "../resources/country";

export const trendQuerySchema = z.strictObject({
  window: windowSchema.default("30d"),
});

export const byCountryQuerySchema = z.strictObject({
  window: windowSchema.default("30d"),
});

export const byVehicleTypeQuerySchema = z.strictObject({
  window: windowSchema.default("30d"),
  country: countryCodeSchema.optional(),
});

export type TrendQuery = z.infer<typeof trendQuerySchema>;
export type ByCountryQuery = z.infer<typeof byCountryQuerySchema>;
export type ByVehicleTypeQuery = z.infer<typeof byVehicleTypeQuerySchema>;
