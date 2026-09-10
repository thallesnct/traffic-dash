import { z } from "zod";

export const countryCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/);

export const countrySchema = z.strictObject({
  code: countryCodeSchema,
  name: z.string().min(1),
});

export const countriesResponseSchema = z.strictObject({
  data: z.array(countrySchema),
});

export type CountryCode = z.infer<typeof countryCodeSchema>;
export type Country = z.infer<typeof countrySchema>;
export type CountriesResponse = z.infer<typeof countriesResponseSchema>;
