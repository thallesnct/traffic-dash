import { z } from "zod";

import { isoDateSchema, toIsoDate, windowSchema } from "../reporting/window";
import { countryCodeSchema } from "../resources/country";
import { vehicleTypeCodeSchema } from "../resources/vehicle-type";

export function createUpsertTrafficParamsSchema(now: Date = new Date()) {
  const today = toIsoDate(now);

  return z
    .strictObject({
      date: isoDateSchema,
      country: countryCodeSchema,
      vehicleType: vehicleTypeCodeSchema,
    })
    .superRefine(({ date }, context) => {
      if (date > today) {
        context.addIssue({
          code: "custom",
          message: "Date cannot be in the future",
          path: ["date"],
        });
      }
    });
}

export const upsertTrafficParamsSchema = createUpsertTrafficParamsSchema();

export const upsertTrafficSchema = z.strictObject({
  vehicleCount: z.number().int().nonnegative(),
});

const countriesQuerySchema = z
  .string()
  .transform((value) =>
    Array.from(
      new Set(
        value
          .split(",")
          .map((country) => country.trim().toUpperCase())
          .filter(Boolean),
      ),
    ),
  )
  .pipe(z.array(countryCodeSchema).min(1));

export const trendQuerySchema = z.strictObject({
  window: windowSchema.default("30d"),
  vehicleType: vehicleTypeCodeSchema.optional(),
  countries: countriesQuerySchema.optional(),
});

export const byCountryQuerySchema = z.strictObject({
  window: windowSchema.default("30d"),
  vehicleType: vehicleTypeCodeSchema.optional(),
});

export const byVehicleTypeQuerySchema = z.strictObject({
  window: windowSchema.default("30d"),
  country: countryCodeSchema.optional(),
});

export type UpsertTrafficParams = z.infer<typeof upsertTrafficParamsSchema>;
export type UpsertTraffic = z.infer<typeof upsertTrafficSchema>;
export type TrendQuery = z.infer<typeof trendQuerySchema>;
export type ByCountryQuery = z.infer<typeof byCountryQuerySchema>;
export type ByVehicleTypeQuery = z.infer<typeof byVehicleTypeQuerySchema>;
