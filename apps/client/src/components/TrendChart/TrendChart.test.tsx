import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MAX_TREND_COUNTRIES } from "@traffic-dashboard/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchCountries, fetchTrend } from "../../lib/api";
import {
  countriesResponse,
  fetched,
  trendResponse,
  trendSeries,
} from "../../test/fixtures";
import { deferred, renderWithProviders } from "../../test/testUtils";
import { TrendChart } from ".";

vi.mock("../../lib/api", () => ({
  fetchByCountry: vi.fn(),
  fetchByVehicleType: vi.fn(),
  fetchCountries: vi.fn(),
  fetchTrend: vi.fn(),
  fetchVehicleTypes: vi.fn(),
  upsertTraffic: vi.fn(),
}));

const trend = vi.mocked(fetchTrend);
const countries = vi.mocked(fetchCountries);

const populated = trendResponse(
  [
    trendSeries("US", "United States", [30, 40, 50]),
    trendSeries("BR", "Brazil", [10, 20, 30]),
  ],
  { total: 500, previousTotal: 400, deltaPct: 25 },
);

describe("TrendChart", () => {
  beforeEach(() => {
    trend.mockReset();
    countries.mockReset();
    countries.mockResolvedValue(countriesResponse);
  });

  it("names the active window while the trend loads", () => {
    const pending = deferred<ReturnType<typeof fetched<typeof populated>>>();

    trend.mockReturnValue(pending.promise);

    renderWithProviders(<TrendChart />, { initialWindow: "7d" });

    expect(
      screen.getByText(/its trend over the last 7 days/),
    ).toBeInTheDocument();

    pending.resolve(fetched(populated));
  });

  it("shows the failure reason when the request rejects", async () => {
    trend.mockRejectedValue(new Error("Service Unavailable"));

    renderWithProviders(<TrendChart />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Service Unavailable",
    );
  });

  it("distinguishes an empty window from a failed one", async () => {
    trend.mockResolvedValue(fetched(trendResponse([])));

    renderWithProviders(<TrendChart />);

    expect(
      await screen.findByText(
        "No vehicles participating traffic were recorded in this window.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("draws the returned series and reports the countries it left out", async () => {
    trend.mockResolvedValue(fetched(populated));

    renderWithProviders(<TrendChart />);

    expect(
      (await screen.findAllByText(/United States/)).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Brazil/).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Countries not shown: 500 vehicles total/),
    ).toBeInTheDocument();
  });

  it("requests the window it reads from the context", async () => {
    trend.mockResolvedValue(fetched(populated));

    renderWithProviders(<TrendChart />, { initialWindow: "90d" });

    await screen.findAllByText(/United States/);

    expect(trend).toHaveBeenCalledWith("90d", undefined);
  });

  it("sends the chosen countries and shows them as removable chips", async () => {
    const user = userEvent.setup();

    trend.mockResolvedValue(fetched(populated));

    renderWithProviders(<TrendChart />);

    await screen.findAllByText(/United States/);
    await screen.findByRole("option", { name: "Japan" });

    await user.selectOptions(screen.getByLabelText("Add country"), "JP");

    const selectedCountries = await screen.findByRole("list", {
      name: "Selected countries",
    });

    expect(within(selectedCountries).getByText("Japan")).toBeInTheDocument();
    expect(trend).toHaveBeenLastCalledWith("30d", ["US", "BR", "JP"]);
    expect(
      screen.getByRole("button", { name: "Remove Japan" }),
    ).toBeInTheDocument();
  });

  it("stops adding at the maximum and restores the control after a removal", async () => {
    const user = userEvent.setup();
    const catalogue = Array.from(
      { length: MAX_TREND_COUNTRIES + 2 },
      (_, index) => ({
        code: `X${String.fromCharCode(65 + index)}`,
        name: `Country ${String.fromCharCode(65 + index)}`,
      }),
    );

    trend.mockResolvedValue(
      fetched(
        trendResponse(
          catalogue
            .slice(0, 2)
            .map((entry) => trendSeries(entry.code, entry.name, [1, 1, 1])),
        ),
      ),
    );
    countries.mockResolvedValue({ data: catalogue });

    renderWithProviders(<TrendChart />);

    await screen.findByRole("option", { name: catalogue[2].name });

    for (const entry of catalogue.slice(2, MAX_TREND_COUNTRIES)) {
      await user.selectOptions(
        screen.getByLabelText("Add country"),
        entry.code,
      );
    }

    expect(screen.getByLabelText("Add country")).toBeDisabled();
    expect(
      screen.getByText(
        `Showing the maximum of ${MAX_TREND_COUNTRIES} countries.`,
      ),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: `Remove ${catalogue[0].name}` }),
    );

    expect(screen.getByLabelText("Add country")).toBeEnabled();
  });

  it("returns to the automatic selection when reset", async () => {
    const user = userEvent.setup();

    trend.mockResolvedValue(fetched(populated));

    renderWithProviders(<TrendChart />);

    await screen.findAllByText(/United States/);
    await screen.findByRole("option", { name: "Japan" });
    await user.selectOptions(screen.getByLabelText("Add country"), "JP");

    await screen.findByRole("button", { name: "Remove Japan" });

    await user.click(
      screen.getByRole("button", { name: "Reset to top countries" }),
    );

    expect(
      screen.queryByRole("button", { name: "Reset to top countries" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove Japan" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove United States" }),
    ).toBeInTheDocument();
  });

  it("drops an automatic country into a custom selection when removed", async () => {
    const user = userEvent.setup();

    trend.mockResolvedValue(fetched(populated));

    renderWithProviders(<TrendChart />);

    await screen.findAllByText(/United States/);

    await user.click(
      screen.getByRole("button", { name: "Remove United States" }),
    );

    expect(trend).toHaveBeenLastCalledWith("30d", ["BR"]);
    expect(
      screen.getByRole("button", { name: "Reset to top countries" }),
    ).toBeInTheDocument();
  });
});
