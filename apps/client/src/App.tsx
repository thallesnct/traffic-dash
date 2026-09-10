import { WINDOWS } from "@traffic-dashboard/shared";
import { useNavigate, useSearch } from "@tanstack/react-router";

export default function App() {
  const { window: activeWindow } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  return (
    <main>
      <header>
        <h1>Traffic Insights</h1>
        <nav aria-label="Reporting window">
          {WINDOWS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={option === activeWindow}
              onClick={() =>
                navigate({
                  search: (previous) => ({ ...previous, window: option }),
                })
              }
            >
              {option}
            </button>
          ))}
        </nav>
      </header>
    </main>
  );
}
