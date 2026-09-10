import { describe, expect, it } from "vitest";
import {
  countryCodeSchema,
  countriesResponseSchema,
  type Country,
} from "./country";

describe("countryCodeSchema", () => {
  it("normalizes valid and even semi-accurate code syntax to trimmed, uppercase values", () => {
    expect(countryCodeSchema.parse(" br ")).toBe("BR");
    expect(countryCodeSchema.parse("ZZ")).toBe("ZZ");
  });

  it.each(["", "B", "BRA", "1R"])('rejects "%s"', (value) => {
    expect(countryCodeSchema.safeParse(value).success).toBe(false);
  });
});

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
      countriesResponseSchema.safeParse({
        data: mockCountryArr,
        vehicleTypes: mockCountryArr,
      }).success,
    ).toBe(false);
  });
});
