import { describe, expect, it } from "vitest";

import { generationKey, responseKey } from "./cacheKeys";

describe("Cache keys", () => {
  it("builds the stable generation key", () => {
    expect(generationKey()).toBe("traffic:v1:gen");
  });

  it("builds unfiltered aggregate response keys", () => {
    expect(
      responseKey({ endpoint: "trend", generation: 0, window: "30d" }),
    ).toBe("traffic:v1:trend:g0:window-30d");
    expect(
      responseKey({ endpoint: "by-country", generation: 12, window: "7d" }),
    ).toBe("traffic:v1:by-country:g12:window-7d");
  });

  it("varies response keys by generation and window", () => {
    const base = {
      endpoint: "trend" as const,
      generation: 4,
      window: "30d" as const,
    };

    expect(responseKey({ ...base, generation: 5 })).not.toBe(responseKey(base));
    expect(responseKey({ ...base, window: "90d" })).not.toBe(responseKey(base));
  });

  it("adds a country only for the vehicle-type distribution", () => {
    expect(
      responseKey({
        endpoint: "by-vehicle-type",
        generation: 2,
        window: "30d",
      }),
    ).toBe("traffic:v1:by-vehicle-type:g2:window-30d");
    expect(
      responseKey({
        endpoint: "by-vehicle-type",
        generation: 2,
        window: "30d",
        country: "BR",
      }),
    ).toBe("traffic:v1:by-vehicle-type:g2:window-30d:country-BR");
  });

  it("rejects an invalid generation", () => {
    for (const generation of [-1, 1.5]) {
      expect(() =>
        responseKey({ endpoint: "trend", generation, window: "30d" }),
      ).toThrow(RangeError);
    }
  });
});
