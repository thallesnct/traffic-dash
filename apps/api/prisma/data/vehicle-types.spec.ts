import { describe, expect, it } from "vitest";

import { VEHICLE_TYPE_SEEDS } from "./vehicle-types";

describe("SEED | Vehicle Types", () => {
  it("Should contain exactly 6 unique codes and names", () => {
    const codes = VEHICLE_TYPE_SEEDS.map(({ code }) => code);
    const names = VEHICLE_TYPE_SEEDS.map(({ name }) => name);

    expect(VEHICLE_TYPE_SEEDS).toHaveLength(6);
    expect(codes.length).toBe(6);
    expect(new Set(codes).size).toBe(6);
    expect(names.length).toBe(6);
    expect(new Set(names).size).toBe(6);
  });
});
