import { z } from "zod";

import { windowSchema } from "../reporting/window";
import { countryCodeSchema } from "../resources/country";

export const MAX_TREND_COUNTRIES = 20;

const trendCountriesSchema = z.preprocess(
  (value) => {
    if (value === undefined) return undefined;

    const entries = Array.isArray(value) ? value : [String(value)];

    return entries.flatMap((entry) => String(entry).split(","));
  },
  z
    .array(countryCodeSchema)
    .transform((codes) => [...new Set(codes)].sort())
    .refine((codes) => codes.length > 0, "At least one country is required")
    .refine(
      (codes) => codes.length <= MAX_TREND_COUNTRIES,
      `At most ${MAX_TREND_COUNTRIES} countries are allowed`,
    ),
);

export const trendQuerySchema = z.strictObject({
  window: windowSchema.default("30d"),
  countries: trendCountriesSchema.optional(),
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
