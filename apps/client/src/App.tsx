import { CountryBarChart } from "./components/CountryBarChart";
import { TrendChart } from "./components/TrendChart";
import { WindowSwitcher } from "./components/WindowSwitcher";
import { TrafficWindowProvider } from "./contexts/TrafficWindowContext";

export default function App() {
  return (
    <TrafficWindowProvider>
      <main>
        <header>
          <h1>Traffic Insights</h1>
          <WindowSwitcher />
        </header>
        <TrendChart />
        <CountryBarChart />
      </main>
    </TrafficWindowProvider>
  );
}
