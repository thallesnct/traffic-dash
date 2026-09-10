import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchTrend } from "../../lib/api";
import { fetched, trendResponse, trendSeries } from "../../test/fixtures";
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
      await screen.findByRole("heading", { name: "Traffic trend" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("United States").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Brazil").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Countries not shown: 500 vehicles total/),
    ).toBeInTheDocument();
  });

  it("requests the window it reads from the context", async () => {
    trend.mockResolvedValue(fetched(populated));

    renderWithProviders(<TrendChart />, { initialWindow: "90d" });

    await screen.findByRole("heading", { name: "Traffic trend" });

    expect(trend).toHaveBeenCalledWith("90d");
  });
});
