import type { CountryCode } from "@traffic-dashboard/shared";
import { useState } from "react";

import { useCountries } from "../../hooks/useTrafficData";
import { DistributionPanel } from "./DistributionPanel";
import "./VehicleTypePieChart.css";

export function VehicleTypePieChart() {
  const [firstCountry, setFirstCountry] = useState<CountryCode>("US");
  const [secondCountry, setSecondCountry] = useState<CountryCode>("BR");
  const { data: countriesData, isError, error } = useCountries();
  const countries = countriesData?.data ?? [];

  return (
    <section
      className="vehicle-type-pie-chart"
      aria-labelledby="vehicle-distribution-heading"
    >
      <h2 id="vehicle-distribution-heading">
        Vehicle type distribution by country
      </h2>
      <p className="vehicle-type-pie-chart__description">
        Compare how vehicle types are distributed between two countries.
      </p>
      {isError ? (
        <p role="alert">Could not load countries: {error.message}</p>
      ) : null}
      <div className="vehicle-type-pie-chart__panels">
        <DistributionPanel
          countries={countries}
          country={firstCountry}
          otherCountry={secondCountry}
          selectId="vehicle-country-first"
          selectLabel="First country"
          onCountryChange={setFirstCountry}
        />
        <DistributionPanel
          countries={countries}
          country={secondCountry}
          otherCountry={firstCountry}
          selectId="vehicle-country-second"
          selectLabel="Second country"
          onCountryChange={setSecondCountry}
        />
      </div>
    </section>
  );
}
