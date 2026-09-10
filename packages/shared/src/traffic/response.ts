import { z } from "zod";

import { isoDateSchema, windowSchema } from "../reporting/window";
import { countryCodeSchema, countrySchema } from "../resources/country";
import { vehicleTypeCodeSchema } from "../resources/vehicle-type";
import { trafficRecordSchema, upsertTrafficSchema } from "./traffic";

const trafficCountSchema = upsertTrafficSchema.shape.vehicleCount;
const percentageSchema = z.number().min(0).max(100);
const deltaPctSchema = z.number().nullable();

const responseWindowMetaSchema = z.strictObject({
  window: windowSchema,
  through: isoDateSchema,
});

const trendMetaSchema = responseWindowMetaSchema.extend({
  topN: z.number().int().positive(),
});

const aggregateMetaSchema = responseWindowMetaSchema.extend({
  total: trafficCountSchema,
});

const trafficTotalsSchema = z.strictObject({
  total: trafficCountSchema,
  previousTotal: trafficCountSchema,
  deltaPct: deltaPctSchema,
});

const trendSeriesSchema = trafficTotalsSchema.extend({
  countryCode: countryCodeSchema,
  countryName: countrySchema.shape.name,
  points: z.array(trafficCountSchema),
});

const trendDataSchema = z.strictObject({
  dates: z.array(isoDateSchema),
  series: z.array(trendSeriesSchema),
  other: trafficTotalsSchema.nullable(),
});

export const trendResponseSchema = z.strictObject({
  data: trendDataSchema,
  meta: trendMetaSchema,
});

const byCountryRowSchema = z.strictObject({
  countryCode: countryCodeSchema,
  countryName: countrySchema.shape.name,
  totalVehicles: trafficCountSchema,
});

export const byCountryResponseSchema = z.strictObject({
  data: z.array(byCountryRowSchema),
  meta: aggregateMetaSchema,
});

const byVehicleTypeRowSchema = z.strictObject({
  vehicleType: vehicleTypeCodeSchema,
  totalVehicles: trafficCountSchema,
  percentage: percentageSchema,
});

export const byVehicleTypeResponseSchema = z.strictObject({
  data: z.array(byVehicleTypeRowSchema),
  meta: aggregateMetaSchema,
});

const upsertTrafficDataSchema = trafficRecordSchema.extend({
  countryTotal: trafficCountSchema,
  operation: z.enum(["created", "updated"]),
  previousVehicleCount: trafficCountSchema.nullable(),
});

export const upsertTrafficResponseSchema = z.strictObject({
  data: upsertTrafficDataSchema,
});

export type TrendResponse = z.infer<typeof trendResponseSchema>;
export type ByCountryResponse = z.infer<typeof byCountryResponseSchema>;
export type ByVehicleTypeResponse = z.infer<typeof byVehicleTypeResponseSchema>;
export type UpsertTrafficResponse = z.infer<typeof upsertTrafficResponseSchema>;
