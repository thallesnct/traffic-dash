import { describe, expect, it } from "vitest";

import { countryDaySeed, createGenerator, DAY_COUNT } from "./random";

function take(seed: number, count: number): number[] {
  const draw = createGenerator(seed);

  return Array.from({ length: count }, () => draw());
}

describe("Seed | Random", () => {
  it("Should derive a distinct seed per country/day pair", () => {
    expect(countryDaySeed("US", 0)).toBe(2718 * DAY_COUNT);
    expect(countryDaySeed("US", 7)).toBe(2718 * DAY_COUNT + 7);
    expect(countryDaySeed("BR", 0)).not.toBe(countryDaySeed("US", 0));
  });

  it("Should reproduce the same sequence for the same seed", () => {
    const seed = countryDaySeed("US", 0);

    expect(take(seed, 6)).toEqual(take(seed, 6));
  });

  it("Should produce different sequences for different country/day seeds", () => {
    const sequence = take(countryDaySeed("US", 0), 6);

    expect(take(countryDaySeed("BR", 0), 6)).not.toEqual(sequence);
    expect(take(countryDaySeed("US", 1), 6)).not.toEqual(sequence);
  });

  it("Should only emit values within [0, 1)", () => {
    const values = take(countryDaySeed("BR", 7), 5000);

    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
  });

  it("Should not correlate consecutive days for one country", () => {
    const series = Array.from(
      { length: DAY_COUNT },
      (_, index) => take(countryDaySeed("US", DAY_COUNT - 1 - index), 1)[0],
    );
    const mean = series.reduce((total, value) => total + value, 0) / DAY_COUNT;

    let covariance = 0;
    let variance = 0;

    series.forEach((value, index) => {
      variance += (value - mean) ** 2;
      if (index > 0) covariance += (value - mean) * (series[index - 1] - mean);
    });

    expect(Math.abs(covariance / variance)).toBeLessThan(0.2);
  });
});
