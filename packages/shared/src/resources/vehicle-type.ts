import { z } from "zod";

export const vehicleTypeCodeSchema = z.string().trim().min(1);

export const vehicleTypeSchema = z.strictObject({
  code: vehicleTypeCodeSchema,
  name: z.string().min(1),
});

export const vehicleTypesResponseSchema = z.strictObject({
  data: z.array(vehicleTypeSchema),
});

export type VehicleTypeCode = z.infer<typeof vehicleTypeCodeSchema>;
export type VehicleType = z.infer<typeof vehicleTypeSchema>;
export type VehicleTypesResponse = z.infer<typeof vehicleTypesResponseSchema>;
