import { WINDOWS, type Window } from "@traffic-dashboard/shared";

import { useTrafficWindow } from "../../hooks/useTrafficWindow";

import "./WindowSwitcher.css";

const windowLabels: Record<Window, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

export function WindowSwitcher() {
  const { activeWindow, setActiveWindow } = useTrafficWindow();

  return (
    <nav className="window-switcher" aria-label="Reporting window">
      {WINDOWS.map((option) => (
        <button
          key={option}
          className="window-switcher__option"
          type="button"
          aria-pressed={option === activeWindow}
          onClick={() => setActiveWindow(option)}
        >
          {windowLabels[option]}
        </button>
      ))}
    </nav>
  );
}
