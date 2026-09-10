import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "**/dist/**",
    "**/node_modules/**",
    "**/*.tsbuildinfo",
    "coverage/**",
  ]),
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2022 },
    },
  },
  {
    files: ["apps/client/**/*.{js,mjs,cjs}"],
    languageOptions: { globals: { ...globals.browser, ...globals.es2022 } },
    plugins: { "react-hooks": reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
]);
