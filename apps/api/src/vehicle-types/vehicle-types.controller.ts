import { Controller, Get } from "@nestjs/common";
import type { VehicleTypesResponse } from "@traffic-dashboard/shared";
import { VehicleTypesService } from "./vehicle-types.service";

@Controller("vehicle-types")
export class VehicleTypesController {
  constructor(private readonly vehicleTypesService: VehicleTypesService) {}

  @Get()
  findAll(): Promise<VehicleTypesResponse> {
    return this.vehicleTypesService.findAll();
  }
}
