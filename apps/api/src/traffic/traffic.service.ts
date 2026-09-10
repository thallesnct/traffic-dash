import { Injectable } from "@nestjs/common";

import { CountriesService } from "../countries/countries.service";
import { VehicleTypesService } from "../vehicle-types/vehicle-types.service";
import { TrafficRepository } from "./traffic.repository";

@Injectable()
export class TrafficService {
  constructor(
    private readonly repository: TrafficRepository,
    private readonly countries: CountriesService,
    private readonly vehicleTypes: VehicleTypesService,
  ) {}
}
