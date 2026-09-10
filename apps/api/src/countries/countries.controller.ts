import { Controller, Get } from "@nestjs/common";
import type { CountriesResponse } from "@traffic-dashboard/shared";
import { CountriesService } from "./countries.service";

@Controller("countries")
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  findAll(): Promise<CountriesResponse> {
    return this.countriesService.findAll();
  }
}
