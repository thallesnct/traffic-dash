import { windowSchema } from "@traffic-dashboard/shared";
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { z } from "zod";

import App from "./App";

const searchSchema = z.object({
  window: windowSchema.catch("30d"),
});

const rootRoute = createRootRoute({ component: Outlet });

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: searchSchema,
  component: App,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([dashboardRoute]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
