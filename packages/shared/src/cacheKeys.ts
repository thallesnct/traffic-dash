import { z } from "zod";

import type { Window } from "./reporting/window";
import type { CountryCode } from "./resources/country";

export type CacheEndpoint = "trend" | "by-country" | "by-vehicle-type";

export const cacheTierSchema = z.enum(["hit", "miss"]);

export type CacheTier = z.infer<typeof cacheTierSchema>;

type BaseCacheKeyInput = {
  generation: number;
  window: Window;
};

type AggregateCacheKeyInput = BaseCacheKeyInput & {
  endpoint: Exclude<CacheEndpoint, "by-vehicle-type">;
};

type VehicleTypeCacheKeyInput = BaseCacheKeyInput & {
  endpoint: Extract<CacheEndpoint, "by-vehicle-type">;
  country?: CountryCode;
};

export type ResponseKeyInput =
  AggregateCacheKeyInput | VehicleTypeCacheKeyInput;

export function generationKey(): string {
  return "traffic:gen";
}

export function responseKey(input: ResponseKeyInput): string {
  if (!Number.isInteger(input.generation) || input.generation < 0) {
    throw new RangeError("Cache generation must be a nonnegative integer");
  }

  const baseKey = `traffic:${input.endpoint}:g${input.generation}:window-${input.window}`;

  if (input.endpoint === "by-vehicle-type" && input.country) {
    return `${baseKey}:country-${input.country}`;
  }

  return baseKey;
}
