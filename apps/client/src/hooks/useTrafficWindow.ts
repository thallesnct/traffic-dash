import { useContext } from "react";

import {
  TrafficWindowContext,
  type TrafficWindowContextValue,
} from "../contexts/trafficWindow";

export function useTrafficWindow(): TrafficWindowContextValue {
  const context = useContext(TrafficWindowContext);

  if (context === null) {
    throw new Error(
      "useTrafficWindow must be used within TrafficWindowProvider",
    );
  }

  return context;
}
