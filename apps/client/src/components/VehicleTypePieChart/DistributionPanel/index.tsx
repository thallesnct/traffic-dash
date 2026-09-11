import { useDeferredValue } from "react";

import { Card } from "../../Card";
import { Select } from "../../Select";
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
      <Select
        id={selectId}
        label={selectLabel}
        value={country}
        options={countries.map((option) => ({
          value: option.code,
          label: option.name,
          disabled: option.code === otherCountry,
        }))}
        onChange={(value) => onCountryChange(value as typeof country)}
      />
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
