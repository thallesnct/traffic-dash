import { CountryBarChart } from "./components/CountryBarChart";
import { TrendChart } from "./components/TrendChart";
import { VehicleTypePieChart } from "./components/VehicleTypePieChart";
import { WindowSwitcher } from "./components/WindowSwitcher";
import { TrafficWindowProvider } from "./contexts/TrafficWindowContext";
import "./App.css";

export default function App() {
  return (
    <TrafficWindowProvider>
      <main className="app">
        <header>
          <h1>Traffic Insights</h1>
          <WindowSwitcher />
        </header>
        <TrendChart />
        <CountryBarChart />
        <VehicleTypePieChart />
      </main>
    </TrafficWindowProvider>
  );
}
