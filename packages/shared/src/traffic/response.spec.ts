import { describe, expect, it } from "vitest";

import {
  byCountryResponseSchema,
  byVehicleTypeResponseSchema,
  trendResponseSchema,
  upsertTrafficResponseSchema,
} from "./response";

describe("Traffic responses", () => {
  it("parses a trend response with nullable prior-period deltas", () => {
    expect(
      trendResponseSchema.parse({
        data: {
          dates: ["2026-09-09", "2026-09-10"],
          series: [
            {
              countryCode: "br",
              countryName: "Brazil",
              points: [10, 12],
              total: 22,
              previousTotal: 0,
              deltaPct: null,
            },
          ],
          other: {
            total: 8,
            previousTotal: 10,
            deltaPct: -20,
          },
        },
        meta: {
          window: "7d",
          through: "2026-09-10",
          topN: 10,
        },
      }),
    ).toMatchObject({
      data: { series: [{ countryCode: "BR" }] },
      meta: { window: "7d", topN: 10 },
    });

    expect(
      trendResponseSchema.safeParse({
        data: { dates: [], series: [], other: null },
        meta: { window: "7d", through: "2026-09-10", topN: 0 },
      }).success,
    ).toBe(false);
  });

  it("parses country and vehicle-type aggregate responses", () => {
    expect(
      byCountryResponseSchema.parse({
        data: [
          {
            countryCode: "br",
            countryName: "Brazil",
            totalVehicles: 100,
          },
        ],
        meta: { window: "30d", through: "2026-09-10", total: 100 },
      }),
    ).toMatchObject({ data: [{ countryCode: "BR" }] });

    expect(
      byVehicleTypeResponseSchema.parse({
        data: [{ vehicleType: "car", totalVehicles: 100, percentage: 100 }],
        meta: { window: "30d", through: "2026-09-10", total: 100 },
      }),
    ).toMatchObject({ data: [{ percentage: 100 }] });

    expect(
      byVehicleTypeResponseSchema.safeParse({
        data: [{ vehicleType: "car", totalVehicles: 100, percentage: 100.1 }],
        meta: { window: "30d", through: "2026-09-10", total: 100 },
      }).success,
    ).toBe(false);
  });

  it("distinguishes created and updated write responses", () => {
    const record = {
      recordedDate: "2026-09-10",
      countryCode: "BR",
      vehicleType: "car",
      vehicleCount: 42,
      countryTotal: 100,
    };

    expect(
      upsertTrafficResponseSchema.parse({
        data: { ...record, operation: "created", previousVehicleCount: null },
      }),
    ).toMatchObject({ data: { previousVehicleCount: null } });

    expect(
      upsertTrafficResponseSchema.parse({
        data: { ...record, operation: "updated", previousVehicleCount: 10 },
      }),
    ).toMatchObject({
      data: { operation: "updated", previousVehicleCount: 10 },
    });
  });
});
