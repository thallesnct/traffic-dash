import { defineConfig, env } from "prisma/config";

import { getDatabaseUrl } from "./src/database/database-url";

export default defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});
