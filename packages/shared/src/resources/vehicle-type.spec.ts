import { describe, expect, it } from "vitest";
import {
  type VehicleType,
  vehicleTypeCodeSchema,
  vehicleTypesResponseSchema,
} from "./vehicle-type";

describe("vehicleTypeCodeSchema", () => {
  it("trims a code without changing its casing", () => {
    expect(vehicleTypeCodeSchema.parse(" car ")).toBe("car");
  });

  it("fails when validating a blank code", () => {
    expect(vehicleTypeCodeSchema.safeParse("   ").success).toBe(false);
  });
});

describe("VehicleTypesResponseSchema", () => {
  const mockVehicleTypeArray: VehicleType[] = [{ code: "car", name: "Car" }];

  it("accepts a vehicle-type collection", () => {
    expect(
      vehicleTypesResponseSchema.parse({
        data: mockVehicleTypeArray,
      }),
    ).toEqual({ data: mockVehicleTypeArray });
  });

  it("rejects fields belonging to another resource", () => {
    expect(
      vehicleTypesResponseSchema.safeParse({
        data: mockVehicleTypeArray,
        countries: [],
      }).success,
    ).toBe(false);
  });
});
