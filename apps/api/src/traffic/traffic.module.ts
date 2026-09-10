import { Module } from "@nestjs/common";

import { CacheModule } from "../cache/cache.module";
import { CountriesModule } from "../countries/countries.module";
import { PrismaModule } from "../database/prisma.module";
import { VehicleTypesModule } from "../vehicle-types/vehicle-types.module";
import { TrafficController } from "./traffic.controller";
import { TrafficRepository } from "./traffic.repository";
import { TrafficService } from "./traffic.service";

@Module({
  imports: [PrismaModule, CacheModule, CountriesModule, VehicleTypesModule],
  controllers: [TrafficController],
  providers: [TrafficRepository, TrafficService],
  exports: [TrafficService],
})
export class TrafficModule {}
