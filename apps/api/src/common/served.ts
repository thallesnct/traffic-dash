import type { CacheTier } from "@traffic-dashboard/shared";
import type { Response } from "express";

export type Served<TResponse> = { body: TResponse; cacheTier: CacheTier };

export function serveWithCacheHeaders<TResponse>(
  served: Served<TResponse>,
  response: Response,
): TResponse {
  response.setHeader("X-Cache", served.cacheTier);
  response.setHeader("Vary", "Accept-Encoding");
  response.setHeader("Cache-Control", "no-store");

  return served.body;
}
