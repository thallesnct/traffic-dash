import { useNavigate, useSearch } from "@tanstack/react-router";

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
    </main>
  );
}
