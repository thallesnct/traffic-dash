import { describe, expect, it } from "vitest";

import {
  byCountryQuerySchema,
  byVehicleTypeQuerySchema,
  trendQuerySchema,
} from "./query";

describe("Traffic queries", () => {
  it("defaults trend and country-aggregate windows", () => {
    expect(trendQuerySchema.parse({})).toEqual({ window: "30d" });
    expect(byCountryQuerySchema.parse({})).toEqual({ window: "30d" });
  });

  it("parses a comma-separated trend country list into sorted unique codes", () => {
    expect(
      trendQuerySchema.parse({ window: "7d", countries: "us,br,US" }),
    ).toEqual({ window: "7d", countries: ["BR", "US"] });
  });

  it("accepts repeated trend country parameters", () => {
    expect(trendQuerySchema.parse({ countries: ["jp", "de"] })).toEqual({
      window: "30d",
      countries: ["DE", "JP"],
    });
  });

  it("omits trend countries when the parameter is absent", () => {
    expect(trendQuerySchema.parse({ window: "7d" })).toEqual({ window: "7d" });
  });

  it("rejects an empty, oversized, or malformed trend country list", () => {
    expect(trendQuerySchema.safeParse({ countries: "" }).success).toBe(false);
    expect(
      trendQuerySchema.safeParse({ countries: "US,BR,JP,DE,FR,IT,ES,NL,PT" })
        .success,
    ).toBe(false);
    expect(trendQuerySchema.safeParse({ countries: "USA" }).success).toBe(
      false,
    );
  });

  it("defaults the vehicle-type aggregate window and normalizes its country", () => {
    expect(byVehicleTypeQuerySchema.parse({ country: "br" })).toEqual({
      window: "30d",
      country: "BR",
    });
  });
});
