import { describe, expect, it } from "vitest";

import {
  createUpsertTrafficParamsSchema,
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
