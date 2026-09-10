import { Injectable } from "@nestjs/common";
import { fromIsoDate, type IsoDate } from "@traffic-dashboard/shared";

import type { DailyTraffic } from "../generated/prisma/client";
import { PrismaService } from "../database/prisma.service";

export type DailySeriesRow = {
  recordedDate: Date;
  countryCode: string;
  total: number;
};

export type CountryTotalRow = {
  countryCode: string;
  total: number;
};

export type VehicleTypeTotalRow = {
  vehicleType: string;
  total: number;
};

function dateRange(from: IsoDate, to: IsoDate): { gte: Date; lte: Date } {
  return { gte: fromIsoDate(from), lte: fromIsoDate(to) };
}

function naturalKey(date: IsoDate, country: string, type: string) {
  return {
    recordedDate_countryCode_vehicleType: {
      recordedDate: fromIsoDate(date),
      countryCode: country,
      vehicleType: type,
    },
  };
}

@Injectable()
export class TrafficRepository {
  constructor(private readonly prisma: PrismaService) {}

  async dailySeriesByCountry(
    from: IsoDate,
    to: IsoDate,
    vehicleType?: string,
  ): Promise<DailySeriesRow[]> {
    const rows = await this.prisma.dailyTraffic.groupBy({
      by: ["recordedDate", "countryCode"],
      where: { recordedDate: dateRange(from, to), vehicleType },
      _sum: { vehicleCount: true },
      orderBy: [{ recordedDate: "asc" }, { countryCode: "asc" }],
    });

    return rows.map((row) => ({
      recordedDate: row.recordedDate,
      countryCode: row.countryCode,
      total: row._sum.vehicleCount ?? 0,
    }));
  }

  async countryTotals(
    from: IsoDate,
    to: IsoDate,
    vehicleType?: string,
  ): Promise<CountryTotalRow[]> {
    const rows = await this.prisma.dailyTraffic.groupBy({
      by: ["countryCode"],
      where: { recordedDate: dateRange(from, to), vehicleType },
      _sum: { vehicleCount: true },
      orderBy: { _sum: { vehicleCount: "desc" } },
    });

    return rows.map((row) => ({
      countryCode: row.countryCode,
      total: row._sum.vehicleCount ?? 0,
    }));
  }

  async vehicleTypeTotals(
    from: IsoDate,
    to: IsoDate,
    country?: string,
  ): Promise<VehicleTypeTotalRow[]> {
    const rows = await this.prisma.dailyTraffic.groupBy({
      by: ["vehicleType"],
      where: { recordedDate: dateRange(from, to), countryCode: country },
      _sum: { vehicleCount: true },
      orderBy: { _sum: { vehicleCount: "desc" } },
    });

    return rows.map((row) => ({
      vehicleType: row.vehicleType,
      total: row._sum.vehicleCount ?? 0,
    }));
  }

  async countryTotalOnDate(date: IsoDate, country: string): Promise<number> {
    const result = await this.prisma.dailyTraffic.aggregate({
      where: { recordedDate: fromIsoDate(date), countryCode: country },
      _sum: { vehicleCount: true },
    });

    return result._sum.vehicleCount ?? 0;
  }

  async find(
    date: IsoDate,
    country: string,
    type: string,
  ): Promise<DailyTraffic | null> {
    return this.prisma.dailyTraffic.findUnique({
      where: naturalKey(date, country, type),
    });
  }

  async upsert(
    date: IsoDate,
    country: string,
    type: string,
    count: number,
  ): Promise<DailyTraffic> {
    return this.prisma.dailyTraffic.upsert({
      where: naturalKey(date, country, type),
      create: {
        recordedDate: fromIsoDate(date),
        countryCode: country,
        vehicleType: type,
        vehicleCount: count,
      },
      update: { vehicleCount: count },
    });
  }

  async delete(date: IsoDate, country: string, type: string): Promise<number> {
    const result = await this.prisma.dailyTraffic.deleteMany({
      where: {
        recordedDate: fromIsoDate(date),
        countryCode: country,
        vehicleType: type,
      },
    });

    return result.count;
  }
}
