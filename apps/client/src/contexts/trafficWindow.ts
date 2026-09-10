import type { Window } from "@traffic-dashboard/shared";
import { createContext } from "react";

export type TrafficWindowContextValue = {
  activeWindow: Window;
  setActiveWindow: (window: Window) => void;
};

export const TrafficWindowContext =
  createContext<TrafficWindowContextValue | null>(null);
