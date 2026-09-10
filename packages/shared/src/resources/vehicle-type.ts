import { z } from "zod";

export const vehicleTypeSchema = z.strictObject({ code: z.string().min(1), name: z.string().min(1) });
export const vehicleTypesResponseSchema = z.strictObject({ data: z.array(vehicleTypeSchema) });

export type VehicleType = z.infer<typeof vehicleTypeSchema>;
export type VehicleTypesResponse = z.infer<typeof vehicleTypesResponseSchema>;
