import { WINDOWS, type Window } from "@traffic-dashboard/shared";

import { useTrafficWindow } from "../hooks/useTrafficWindow";

const WINDOW_LABELS: Record<Window, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

export function WindowSwitcher() {
  const { activeWindow, setActiveWindow } = useTrafficWindow();

  return (
    <nav aria-label="Reporting window">
      {WINDOWS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === activeWindow}
          onClick={() => setActiveWindow(option)}
        >
          {WINDOW_LABELS[option]}
        </button>
      ))}
    </nav>
  );
}
