import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { CountriesController } from "./countries.controller";
import { CountriesService } from "./countries.service";

@Module({
  imports: [PrismaModule],
  controllers: [CountriesController],
  providers: [CountriesService],
})
export class CountriesModule {}
