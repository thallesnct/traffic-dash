import { z } from "zod";

export const countrySchema = z.strictObject({ code: z.string().length(2), name: z.string().min(1) });
export const countriesResponseSchema = z.strictObject({ data: z.array(countrySchema) });

export type Country = z.infer<typeof countrySchema>;
export type CountriesResponse = z.infer<typeof countriesResponseSchema>;
