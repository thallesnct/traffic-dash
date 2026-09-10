import { Injectable } from "@nestjs/common";
import type { VehicleTypesResponse } from "@traffic-dashboard/shared";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class VehicleTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<VehicleTypesResponse> {
    const vehicleTypes = await this.prisma.vehicleType.findMany({
      orderBy: [{ name: "asc" }, { code: "asc" }],
      select: { code: true, name: true },
    });

    return { data: vehicleTypes };
  }
}
