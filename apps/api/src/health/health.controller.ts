import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";

import { PrismaService } from "../database/prisma.service";

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  health(): { status: string; uptime: number } {
    return { status: "ok", uptime: Math.floor(process.uptime()) };
  }

  @Get("ready")
  async ready(): Promise<{ status: string; database: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({
        status: "error",
        database: "unavailable",
      });
    }

    return { status: "ok", database: "ok" };
  }
}
