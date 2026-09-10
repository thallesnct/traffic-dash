import { describe, expect, it } from "vitest";
import { countriesResponseSchema, Country } from "./country";

describe("countriesResponseSchema", () => {
  const mockCountryArr: Country[] = [{ code: "BR", name: "Brazil" }];

  it("accepts a country collection", () => {
    expect(
      countriesResponseSchema.parse({
        data: mockCountryArr,
      }),
    ).toEqual({ data: mockCountryArr });
  });

  it("rejects fields belonging to another resource", () => {
    expect(
      countriesResponseSchema.safeParse({ data: mockCountryArr, vehicleTypes: mockCountryArr }).success,
    ).toBe(false);
  });
});
