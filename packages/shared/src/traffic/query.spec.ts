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

  it("defaults the vehicle-type aggregate window and normalizes its country", () => {
    expect(byVehicleTypeQuerySchema.parse({ country: "br" })).toEqual({
      window: "30d",
      country: "BR",
    });
  });
});
