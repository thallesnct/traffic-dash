import type { Window } from "@traffic-dashboard/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult } from "@testing-library/react";
import { useState, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";

import { TrafficWindowContext } from "../contexts/trafficWindow";

type RenderWithProvidersOptions = {
  initialWindow?: Window;
};

type RenderWithProvidersResult = RenderResult & {
  queryClient: QueryClient;
  setActiveWindow: Mock<(window: Window) => void>;
};

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { initialWindow = "30d" }: RenderWithProvidersOptions = {},
): RenderWithProvidersResult {
  const queryClient = createQueryClient();
  const setActiveWindow = vi.fn<(window: Window) => void>();

  function TestTrafficWindowProvider({ children }: { children: ReactNode }) {
    const [activeWindow, setWindow] = useState(initialWindow);

    return (
      <TrafficWindowContext.Provider
        value={{
          activeWindow,
          setActiveWindow: (next) => {
            setActiveWindow(next);
            setWindow(next);
          },
        }}
      >
        {children}
      </TrafficWindowContext.Provider>
    );
  }

  const result = render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <TestTrafficWindowProvider>{children}</TestTrafficWindowProvider>
      </QueryClientProvider>
    ),
  });

  return { ...result, queryClient, setActiveWindow };
}

const openDeferred = new Set<() => void>();

export function deferred<TValue>() {
  let resolve!: (value: TValue) => void;
  let reject!: (reason: Error) => void;

  const promise = new Promise<TValue>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  const settle = () => resolve(undefined as TValue);

  openDeferred.add(settle);

  return {
    promise,
    resolve: (value: TValue) => {
      openDeferred.delete(settle);
      resolve(value);
    },
    reject: (reason: Error) => {
      openDeferred.delete(settle);
      reject(reason);
    },
  };
}

export function settleOpenDeferred(): void {
  for (const settle of openDeferred) {
    settle();
  }

  openDeferred.clear();
}
