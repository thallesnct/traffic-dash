import { useDeferredValue } from "react";

import { Card } from "../../Card";
import { useByVehicleType } from "../../../hooks/useTrafficData";
import { useTrafficWindow } from "../../../hooks/useTrafficWindow";
import { DistributionChart } from "../DistributionChart";
import "./DistributionPanel.css";
import { countryName } from "../formatting";
import type { DistributionPanelProps } from "../types";

export function DistributionPanel({
  countries,
  country,
  otherCountry,
  selectId,
  selectLabel,
  onCountryChange,
}: DistributionPanelProps) {
  const { activeWindow } = useTrafficWindow();
  const deferredCountry = useDeferredValue(country);
  const { data, isPending, isError, isPlaceholderData, error } =
    useByVehicleType(activeWindow, deferredCountry);
  const name = countryName(countries, country);
  const isUpdating = country !== deferredCountry || isPlaceholderData;

  return (
    <Card
      as="section"
      className="distribution-panel"
      aria-labelledby={`${selectId}-heading`}
    >
      <div className="distribution-panel__control">
        <label htmlFor={selectId}>{selectLabel}</label>
        <div className="distribution-panel__country-select">
          <select
            id={selectId}
            value={country}
            onChange={(event) =>
              onCountryChange(event.target.value as typeof country)
            }
          >
            {countries.map((option) => (
              <option
                key={option.code}
                value={option.code}
                disabled={option.code === otherCountry}
              >
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <h3 className="distribution-panel__heading" id={`${selectId}-heading`}>
        {name}
      </h3>
      {isPending ? (
        <p className="distribution-panel__status">
          Loading vehicle distribution…
        </p>
      ) : null}
      {isUpdating ? (
        <p className="distribution-panel__status" aria-live="polite">
          Updating to {countryName(countries, country)}…
        </p>
      ) : null}
      {isError ? (
        <p role="alert">
          Could not load {countryName(countries, country)}: {error.message}
        </p>
      ) : null}
      {data === undefined ? null : (
        <DistributionChart distribution={data.body} />
      )}
    </Card>
  );
}
