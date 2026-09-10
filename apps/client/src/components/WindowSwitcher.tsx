import { WINDOWS, type Window } from "@traffic-dashboard/shared";

const WINDOW_LABELS: Record<Window, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

type WindowSwitcherProps = {
  value: Window;
  onChange: (next: Window) => void;
};

export function WindowSwitcher({ value, onChange }: WindowSwitcherProps) {
  return (
    <nav aria-label="Reporting window">
      {WINDOWS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === value}
          onClick={() => onChange(option)}
        >
          {WINDOW_LABELS[option]}
        </button>
      ))}
    </nav>
  );
}
