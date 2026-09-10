import { Controller, Get, Query, Res } from "@nestjs/common";
import {
  byCountryQuerySchema,
  byVehicleTypeQuerySchema,
  trendQuerySchema,
  type ByCountryResponse,
  type ByVehicleTypeResponse,
  type TrendResponse,
} from "@traffic-dashboard/shared";
import type { Response } from "express";

import { serveWithCacheHeaders } from "../common/served";
import { parseOrBadRequest } from "../common/validation";
import { TrafficService } from "./traffic.service";

@Controller("api/traffic")
export class TrafficController {
  constructor(private readonly traffic: TrafficService) {}

  @Get("trend")
  async trend(
    @Query() query: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TrendResponse> {
    const { window } = parseOrBadRequest(trendQuerySchema, query);

    return serveWithCacheHeaders(await this.traffic.getTrend(window), response);
  }

  @Get("by-country")
  async byCountry(
    @Query() query: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ByCountryResponse> {
    const { window } = parseOrBadRequest(byCountryQuerySchema, query);

    return serveWithCacheHeaders(
      await this.traffic.getByCountry(window),
      response,
    );
  }

  @Get("by-vehicle-type")
  async byVehicleType(
    @Query() query: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ByVehicleTypeResponse> {
    const { window, country } = parseOrBadRequest(
      byVehicleTypeQuerySchema,
      query,
    );

    return serveWithCacheHeaders(
      await this.traffic.getByVehicleType(window, country),
      response,
    );
  }
}
