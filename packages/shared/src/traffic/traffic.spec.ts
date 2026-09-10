import { describe, expect, it } from "vitest";

import {
  byCountryQuerySchema,
  byVehicleTypeQuerySchema,
  createUpsertTrafficParamsSchema,
  trendQuerySchema,
  upsertTrafficSchema,
} from "./traffic";

describe("Traffic | createUpsertTrafficParamsSchema", () => {
  const paramsSchema = createUpsertTrafficParamsSchema(
    new Date("2026-09-10T12:00:00.000Z"),
  );

  it("accepts today and normalizes its resource identifiers", () => {
    expect(
      paramsSchema.parse({
        date: "2026-09-10",
        country: "br",
        vehicleType: " car ",
      }),
    ).toEqual({
      date: "2026-09-10",
      country: "BR",
      vehicleType: "car",
    });
  });

  it("rejects a future date", () => {
    expect(
      paramsSchema.safeParse({
        date: "2026-09-11",
        country: "BR",
        vehicleType: "car",
      }).success,
    ).toBe(false);
  });
});

describe("Traffic | upsertTrafficSchema", () => {
  it("accepts zero but not string, fractional, or negative counts", () => {
    expect(upsertTrafficSchema.parse({ vehicleCount: 0 })).toEqual({
      vehicleCount: 0,
    });

    for (const vehicleCount of ["200", 2.5, -1]) {
      expect(upsertTrafficSchema.safeParse({ vehicleCount }).success).toBe(
        false,
      );
    }
  });
});

describe("Traffic | query schemas", () => {
  it("defaults the trend window and parses a de-duplicated country list", () => {
    expect(
      trendQuerySchema.parse({
        vehicleType: "car",
        countries: "br, US, br",
      }),
    ).toEqual({
      window: "30d",
      vehicleType: "car",
      countries: ["BR", "US"],
    });
  });

  it("rejects an empty or malformed country-list member", () => {
    expect(trendQuerySchema.safeParse({ countries: " , " }).success).toBe(
      false,
    );
    expect(trendQuerySchema.safeParse({ countries: "BR, BRA" }).success).toBe(
      false,
    );
  });

  it("defaults aggregate-query windows", () => {
    expect(byCountryQuerySchema.parse({})).toEqual({ window: "30d" });
    expect(byVehicleTypeQuerySchema.parse({ country: "br" })).toEqual({
      window: "30d",
      country: "BR",
    });
  });
});
