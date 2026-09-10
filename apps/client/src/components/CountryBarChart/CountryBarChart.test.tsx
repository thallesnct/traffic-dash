import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchByCountry } from "../../lib/api";
import { byCountryResponse, fetched } from "../../test/fixtures";
import { deferred, renderWithProviders } from "../../test/testUtils";
import { CountryBarChart } from ".";

vi.mock("../../lib/api", () => ({
  fetchByCountry: vi.fn(),
  fetchByVehicleType: vi.fn(),
  fetchCountries: vi.fn(),
  fetchTrend: vi.fn(),
  fetchVehicleTypes: vi.fn(),
  upsertTraffic: vi.fn(),
}));

const byCountry = vi.mocked(fetchByCountry);

const populated = byCountryResponse([
  { countryCode: "US", countryName: "United States", totalVehicles: 900 },
  { countryCode: "BR", countryName: "Brazil", totalVehicles: 400 },
]);

describe("CountryBarChart", () => {
  beforeEach(() => {
    byCountry.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a loading state while the totals are in flight", async () => {
    const pending = deferred<ReturnType<typeof fetched<typeof populated>>>();

    byCountry.mockReturnValue(pending.promise);

    renderWithProviders(<CountryBarChart />);

    expect(screen.getByText("Loading country totals…")).toBeInTheDocument();

    pending.resolve(fetched(populated));

    await screen.findByRole("heading", { name: "Country-wise traffic" });
  });

  it("shows the failure reason when the request rejects", async () => {
    byCountry.mockRejectedValue(new Error("Service Unavailable"));

    renderWithProviders(<CountryBarChart />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load country totals: Service Unavailable",
    );
  });

  it("distinguishes an empty window from a failed one", async () => {
    byCountry.mockResolvedValue(fetched(byCountryResponse([])));

    renderWithProviders(<CountryBarChart />);

    expect(
      await screen.findByText(
        "No country traffic was recorded in this window.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders every returned country once the data arrives", async () => {
    byCountry.mockResolvedValue(fetched(populated));

    renderWithProviders(<CountryBarChart />);

    expect(
      await screen.findByRole("heading", { name: "Country-wise traffic" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("United States").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Brazil").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("region", {
        name: "Scroll through ranked country traffic",
      }),
    ).toBeInTheDocument();
  });

  it("requests the window it reads from the context", async () => {
    byCountry.mockResolvedValue(fetched(populated));

    renderWithProviders(<CountryBarChart />, { initialWindow: "7d" });

    await screen.findByRole("heading", { name: "Country-wise traffic" });

    expect(byCountry).toHaveBeenCalledWith("7d");
  });
});
