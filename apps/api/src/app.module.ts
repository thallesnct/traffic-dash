import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { CountriesModule } from "./countries/countries.module";
import { VehicleTypesModule } from "./vehicle-types/vehicle-types.module";

@Module({
  imports: [CountriesModule, VehicleTypesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
