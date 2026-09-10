import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, type ReactNode } from "react";

import {
  TrafficWindowContext,
  type TrafficWindowContextValue,
} from "./trafficWindow";

export function TrafficWindowProvider({ children }: { children: ReactNode }) {
  const { window: activeWindow } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const setActiveWindow = useCallback(
    (window: TrafficWindowContextValue["activeWindow"]) => {
      void navigate({
        search: (previous) => ({ ...previous, window }),
        resetScroll: false,
      });
    },
    [navigate],
  );

  return (
    <TrafficWindowContext.Provider value={{ activeWindow, setActiveWindow }}>
      {children}
    </TrafficWindowContext.Provider>
  );
}
