import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../test/testUtils";
import { WindowSwitcher } from ".";

describe("WindowSwitcher", () => {
  it("presses the option matching the active window", () => {
    renderWithProviders(<WindowSwitcher />, { initialWindow: "30d" });

    expect(screen.getByRole("button", { name: "30 days" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "7 days" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reports the selected window and moves the pressed state", async () => {
    const user = userEvent.setup();
    const { setActiveWindow } = renderWithProviders(<WindowSwitcher />, {
      initialWindow: "30d",
    });

    await user.click(screen.getByRole("button", { name: "7 days" }));

    expect(setActiveWindow).toHaveBeenCalledExactlyOnceWith("7d");
    expect(screen.getByRole("button", { name: "7 days" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "30 days" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
