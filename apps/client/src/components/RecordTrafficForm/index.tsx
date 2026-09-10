import {
  isoDateSchema,
  toIsoDate,
  type CountryCode,
  type IsoDate,
  type VehicleTypeCode,
} from "@traffic-dashboard/shared";
import { useState, type FormEvent } from "react";

import {
  useCountries,
  useUpsertTraffic,
  useVehicleTypes,
} from "../../hooks/useTrafficData";
import { Card } from "../Card";
import { RecordTrafficFeedback } from "./RecordTrafficFeedback";
import { RecordTrafficFields } from "./RecordTrafficFields";
import "./RecordTrafficForm.css";

function isValidCount(value: string): boolean {
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value));
}

export function RecordTrafficForm() {
  const [date, setDate] = useState(() => toIsoDate(new Date()));
  const [country, setCountry] = useState<CountryCode | "">("");
  const [vehicleType, setVehicleType] = useState<VehicleTypeCode | "">("");
  const [count, setCount] = useState("");

  const countriesQuery = useCountries();
  const vehicleTypesQuery = useVehicleTypes();
  const mutation = useUpsertTraffic();
  
  const today = toIsoDate(new Date());
  const isValidDate = isoDateSchema.safeParse(date).success && date <= today;
  const isFormValid =
    isValidDate && country !== "" && vehicleType !== "" && isValidCount(count);
  const catalogueError = countriesQuery.error ?? vehicleTypesQuery.error;
  const isCatalogueLoading =
    countriesQuery.isPending || vehicleTypesQuery.isPending;

  function resetMutation() {
    if (mutation.isSuccess || mutation.isError) {
      mutation.reset();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFormValid) return;

    mutation.mutate({
      date: date as IsoDate,
      country,
      vehicleType,
      vehicleCount: Number(count),
    });
  }

  function updateDate(value: string) {
    setDate(value);
    resetMutation();
  }

  function updateCountry(value: CountryCode | "") {
    setCountry(value);
    resetMutation();
  }

  function updateVehicleType(value: VehicleTypeCode | "") {
    setVehicleType(value);
    resetMutation();
  }

  function updateCount(value: string) {
    setCount(value);
    resetMutation();
  }

  return (
    <Card as="section" aria-labelledby="record-traffic-heading">
      <h2 id="record-traffic-heading">Update traffic records</h2>
      <form className="record-traffic-form" onSubmit={handleSubmit}>
        <RecordTrafficFields
          date={date}
          today={today}
          country={country}
          vehicleType={vehicleType}
          count={count}
          countries={countriesQuery.data?.data ?? []}
          vehicleTypes={vehicleTypesQuery.data?.data ?? []}
          isCatalogueLoading={isCatalogueLoading}
          onDateChange={updateDate}
          onCountryChange={updateCountry}
          onVehicleTypeChange={updateVehicleType}
          onCountChange={updateCount}
        />
        <button
          type="submit"
          disabled={!isFormValid || isCatalogueLoading || mutation.isPending}
        >
          {mutation.isPending ? "Saving changes…" : "Save traffic"}
        </button>
      </form>
      <RecordTrafficFeedback
        catalogueError={catalogueError}
        mutationError={mutation.isError ? mutation.error : null}
        result={mutation.isSuccess ? mutation.data : undefined}
      />
    </Card>
  );
}
