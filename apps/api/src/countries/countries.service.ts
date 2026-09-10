import { Injectable } from "@nestjs/common";
import type { CountriesResponse } from "@traffic-dashboard/shared";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CountriesResponse> {
    const countries = await this.prisma.country.findMany({
      orderBy: [{ name: "asc" }, { code: "asc" }],
      select: { code: true, name: true },
    });

    return { data: countries };
  }
}
