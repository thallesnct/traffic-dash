import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  envDir: "../..",
  optimizeDeps: {
    include: ["@traffic-dashboard/shared"],
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  test: {
    css: false,
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
});
