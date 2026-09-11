import { BadRequestException, Injectable } from "@nestjs/common";
import type { CountriesResponse, CountryCode } from "@traffic-dashboard/shared";
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

  async assertAllExist(codes: readonly CountryCode[]): Promise<void> {
    if (codes.length === 0) return;

    const found = await this.prisma.country.findMany({
      where: { code: { in: [...codes] } },
      select: { code: true },
    });
    const knownCodes = new Set(found.map((country) => country.code));
    const unknown = codes.filter((code) => !knownCodes.has(code));

    if (unknown.length > 0)
      throw new BadRequestException(
        `Unknown country codes: ${unknown.join(", ")}`,
      );
  }

  async assertExists(code: CountryCode): Promise<void> {
    const country = await this.prisma.country.findUnique({
      where: { code },
      select: { code: true },
    });

    if (!country)
      throw new BadRequestException(`Unknown country code: ${code}`);
  }
}
