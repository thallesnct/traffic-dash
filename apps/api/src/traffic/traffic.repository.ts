import { Injectable } from "@nestjs/common";
import { fromIsoDate, type IsoDate } from "@traffic-dashboard/shared";

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
}
