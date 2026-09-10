import { z } from "zod";

import { isoDateSchema, toIsoDate } from "../reporting/window";
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

export const trafficRecordKeySchema = z.strictObject({
  recordedDate: isoDateSchema,
  countryCode: countryCodeSchema,
  vehicleType: vehicleTypeCodeSchema,
});

export const trafficRecordSchema = trafficRecordKeySchema.extend({
  vehicleCount: upsertTrafficSchema.shape.vehicleCount,
});

export type UpsertTrafficParams = z.infer<typeof upsertTrafficParamsSchema>;
export type UpsertTraffic = z.infer<typeof upsertTrafficSchema>;
export type TrafficRecordKey = z.infer<typeof trafficRecordKeySchema>;
export type TrafficRecord = z.infer<typeof trafficRecordSchema>;
