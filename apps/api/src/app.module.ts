import { Module } from "@nestjs/common";

import { CountriesModule } from "./countries/countries.module";
import { HealthModule } from "./health/health.module";
import { TrafficModule } from "./traffic/traffic.module";
import { VehicleTypesModule } from "./vehicle-types/vehicle-types.module";

@Module({
  imports: [TrafficModule, HealthModule, CountriesModule, VehicleTypesModule],
})
export class AppModule {}
