import { describe, expect, it } from "vitest";

import { COUNTRY_SEEDS } from "./countries";

describe("SEEDS | Country", () => {
  it("Should contain 195 unique two letter country codes", () => {
    const codes = COUNTRY_SEEDS.map(({ code }) => code);

    expect(COUNTRY_SEEDS).toHaveLength(195);
    expect(new Set(codes).size).toBe(195);
    expect(codes.every((code) => /^[A-Z]{2}$/.test(code))).toBe(true);
  });
});
