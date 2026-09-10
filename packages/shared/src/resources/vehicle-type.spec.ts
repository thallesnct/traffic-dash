import { describe, expect, it } from "vitest";
import { VehicleType, vehicleTypesResponseSchema } from "./vehicle-type";

describe("VehicleTypesResponseSchema", () => {
  const mockVehicleTypeArray: VehicleType[] = [{ code: "car", name: "Car" }]

  it("accepts a vehicle-type collection", () => {
    expect(
      vehicleTypesResponseSchema.parse({
        data: mockVehicleTypeArray,
      }),
    ).toEqual({ data: mockVehicleTypeArray });
  });

  it("rejects fields belonging to another resource", () => {
    expect(
      vehicleTypesResponseSchema.safeParse({ data: mockVehicleTypeArray, countries: [] }).success,
    ).toBe(false);
  });
});
