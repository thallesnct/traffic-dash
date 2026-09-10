import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CountryCode, Window } from "@traffic-dashboard/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchByVehicleType, fetchCountries } from "../../lib/api";
import {
  byVehicleTypeResponse,
  countriesResponse,
  fetched,
} from "../../test/fixtures";
import { renderWithProviders } from "../../test/testUtils";
import { VehicleTypePieChart } from ".";

vi.mock("../../lib/api", () => ({
  fetchByCountry: vi.fn(),
  fetchByVehicleType: vi.fn(),
  fetchCountries: vi.fn(),
  fetchTrend: vi.fn(),
  fetchVehicleTypes: vi.fn(),
  upsertTraffic: vi.fn(),
}));

const byVehicleType = vi.mocked(fetchByVehicleType);
const countries = vi.mocked(fetchCountries);

const distributions: Record<
  string,
  ReturnType<typeof byVehicleTypeResponse>
> = {
  US: byVehicleTypeResponse([
    { vehicleType: "car", totalVehicles: 700, percentage: 77.8 },
    { vehicleType: "truck", totalVehicles: 200, percentage: 22.2 },
  ]),
  BR: byVehicleTypeResponse([
    { vehicleType: "car", totalVehicles: 300, percentage: 75 },
    { vehicleType: "truck", totalVehicles: 100, percentage: 25 },
  ]),
  JP: byVehicleTypeResponse([
    { vehicleType: "car", totalVehicles: 100, percentage: 20 },
    { vehicleType: "truck", totalVehicles: 400, percentage: 80 },
  ]),
};

function countriesRequested(): CountryCode[] {
  return byVehicleType.mock.calls.map(([, country]) => country ?? "");
}

describe("VehicleTypePieChart", () => {
  beforeEach(() => {
    byVehicleType.mockReset();
    countries.mockReset();
    countries.mockResolvedValue(countriesResponse);
    byVehicleType.mockImplementation(
      (_window: Window, country?: CountryCode) => {
        const distribution = distributions[country ?? "US"];

        return Promise.resolve(fetched(distribution));
      },
    );
  });

  it("loads one distribution per panel", async () => {
    renderWithProviders(<VehicleTypePieChart />);

    expect(
      await screen.findByRole("heading", { name: "United States", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Brazil", level: 3 }),
    ).toBeInTheDocument();
    expect(countriesRequested()).toEqual(["US", "BR"]);
  });

  it("leaves the first panel untouched when the second country changes", async () => {
    const user = userEvent.setup();

    renderWithProviders(<VehicleTypePieChart />);

    expect(await screen.findByText("900 vehicles")).toBeInTheDocument();
    expect(await screen.findByText("400 vehicles")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Second country"), "JP");

    expect(await screen.findByText("500 vehicles")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "United States", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("900 vehicles")).toBeInTheDocument();
    expect(screen.queryByText("400 vehicles")).not.toBeInTheDocument();
    expect(countriesRequested().filter((code) => code === "US")).toHaveLength(
      1,
    );
  });

  it("keeps the working panel visible when the other one fails", async () => {
    byVehicleType.mockImplementation(
      (_window: Window, country?: CountryCode) =>
        country === "BR"
          ? Promise.reject(new Error("Service Unavailable"))
          : Promise.resolve(fetched(distributions[country ?? "US"])),
    );

    renderWithProviders(<VehicleTypePieChart />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load Brazil: Service Unavailable",
    );
    expect(screen.getByText("900 vehicles")).toBeInTheDocument();
  });
});
