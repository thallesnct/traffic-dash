import type {
  Country,
  CountryCode,
  VehicleType,
  VehicleTypeCode,
} from "@traffic-dashboard/shared";

import "./RecordTrafficFields.css";

type RecordTrafficFieldsProps = {
  date: string;
  today: string;
  country: CountryCode | "";
  vehicleType: VehicleTypeCode | "";
  count: string;
  countries: readonly Country[];
  vehicleTypes: readonly VehicleType[];
  isCatalogueLoading: boolean;
  onDateChange: (value: string) => void;
  onCountryChange: (value: CountryCode | "") => void;
  onVehicleTypeChange: (value: VehicleTypeCode | "") => void;
  onCountChange: (value: string) => void;
};

export function RecordTrafficFields({
  date,
  today,
  country,
  vehicleType,
  count,
  countries,
  vehicleTypes,
  isCatalogueLoading,
  onDateChange,
  onCountryChange,
  onVehicleTypeChange,
  onCountChange,
}: RecordTrafficFieldsProps) {
  return (
    <div className="record-traffic-fields">
      <label>
        Date
        <input
          type="date"
          value={date}
          max={today}
          required
          onChange={(event) => onDateChange(event.target.value)}
        />
      </label>
      <label>
        Country
        <select
          value={country}
          required
          disabled={isCatalogueLoading}
          onChange={(event) =>
            onCountryChange(event.target.value as CountryCode | "")
          }
        >
          <option value="">Select a country</option>
          {countries.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Vehicle type
        <select
          value={vehicleType}
          required
          disabled={isCatalogueLoading}
          onChange={(event) =>
            onVehicleTypeChange(event.target.value as VehicleTypeCode | "")
          }
        >
          <option value="">Select a vehicle type</option>
          {vehicleTypes.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Vehicle count
        <input
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          value={count}
          required
          onChange={(event) => onCountChange(event.target.value)}
        />
      </label>
    </div>
  );
}
