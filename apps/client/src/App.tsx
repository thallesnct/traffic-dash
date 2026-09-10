import { useNavigate, useSearch } from "@tanstack/react-router";

import { CountryBarChart } from "./components/CountryBarChart";
import { TrendChart } from "./components/TrendChart";
import { WindowSwitcher } from "./components/WindowSwitcher";

export default function App() {
  const { window: activeWindow } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  return (
    <main>
      <header>
        <h1>Traffic Insights</h1>
        <WindowSwitcher
          value={activeWindow}
          onChange={(next) =>
            navigate({ search: (previous) => ({ ...previous, window: next }) })
          }
        />
      </header>
      <TrendChart window={activeWindow} />
      <CountryBarChart window={activeWindow} />
    </main>
  );
}
