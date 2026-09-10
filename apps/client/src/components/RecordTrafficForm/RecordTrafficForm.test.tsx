import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toIsoDate } from "@traffic-dashboard/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchCountries,
  fetchVehicleTypes,
  upsertTraffic,
} from "../../lib/api";
import {
  countriesResponse,
  upsertTrafficResponse,
  vehicleTypesResponse,
} from "../../test/fixtures";
import { renderWithProviders } from "../../test/testUtils";
import { RecordTrafficForm } from ".";

vi.mock("../../lib/api", () => ({
  fetchByCountry: vi.fn(),
  fetchByVehicleType: vi.fn(),
  fetchCountries: vi.fn(),
  fetchTrend: vi.fn(),
  fetchVehicleTypes: vi.fn(),
  upsertTraffic: vi.fn(),
}));

const countries = vi.mocked(fetchCountries);
const vehicleTypes = vi.mocked(fetchVehicleTypes);
const upsert = vi.mocked(upsertTraffic);

async function awaitCatalogues() {
  await screen.findByRole("option", { name: "United States" });
  await screen.findByRole("option", { name: "Car" });
}

async function fillValidRecord(user: ReturnType<typeof userEvent.setup>) {
  await awaitCatalogues();
  await user.selectOptions(screen.getByLabelText("Country"), "US");
  await user.selectOptions(screen.getByLabelText("Vehicle type"), "car");
  await user.type(screen.getByLabelText("Vehicle count"), "120");
}

describe("RecordTrafficForm", () => {
  beforeEach(() => {
    countries.mockReset();
    vehicleTypes.mockReset();
    upsert.mockReset();
    countries.mockResolvedValue(countriesResponse);
    vehicleTypes.mockResolvedValue(vehicleTypesResponse);
    upsert.mockResolvedValue(upsertTrafficResponse("created", 900));
  });

  it("keeps the submit disabled until every field is valid", async () => {
    const user = userEvent.setup();

    renderWithProviders(<RecordTrafficForm />);

    const submit = screen.getByRole("button", { name: "Save traffic" });

    expect(submit).toBeDisabled();

    await awaitCatalogues();

    await user.selectOptions(screen.getByLabelText("Country"), "US");
    await user.selectOptions(screen.getByLabelText("Vehicle type"), "car");

    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText("Vehicle count"), "120");

    expect(submit).toBeEnabled();
  });

  it("submits the record once and reports what the server did", async () => {
    const user = userEvent.setup();

    renderWithProviders(<RecordTrafficForm />);

    await fillValidRecord(user);

    expect(upsert).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Save traffic" }));

    expect(upsert).toHaveBeenCalledExactlyOnceWith({
      date: toIsoDate(new Date()),
      country: "US",
      vehicleType: "car",
      vehicleCount: 120,
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Traffic record created. Country total is now 900 vehicles.",
    );
  });

  it("surfaces a rejected write instead of a success line", async () => {
    const user = userEvent.setup();

    upsert.mockRejectedValue(new Error("Service Unavailable"));

    renderWithProviders(<RecordTrafficForm />);

    await fillValidRecord(user);
    await user.click(screen.getByRole("button", { name: "Save traffic" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not save traffic: Service Unavailable",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("clears a finished result when the record changes", async () => {
    const user = userEvent.setup();

    renderWithProviders(<RecordTrafficForm />);

    await fillValidRecord(user);
    await user.click(screen.getByRole("button", { name: "Save traffic" }));

    await screen.findByRole("status");

    await user.selectOptions(screen.getByLabelText("Vehicle type"), "truck");

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
