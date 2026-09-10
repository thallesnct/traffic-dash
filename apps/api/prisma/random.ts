import { mersenne, unsafeUniformIntDistribution } from "pure-rand";

export const DAY_COUNT = 190;

/** Largest 32-bit signed prime; keeps the hash and the seed inside a safe integer range. */
const SEED_MODULUS = 2147483647;

/** Resolution of a single draw. Values land on a 1e-9 grid across [0, 1). */
const UNIT_RANGE = 1_000_000_000;

export function countryDaySeed(countryCode: string, dayOffset: number): number {
  let hash = 0;

  for (let index = 0; index < countryCode.length; index += 1) {
    hash = (hash * 31 + countryCode.charCodeAt(index)) % SEED_MODULUS;
  }

  return (hash * DAY_COUNT + dayOffset) % SEED_MODULUS;
}

export function createGenerator(seed: number): () => number {
  const generator = mersenne(seed);

  return () =>
    unsafeUniformIntDistribution(0, UNIT_RANGE, generator) / (UNIT_RANGE + 1);
}
