import "dotenv/config";

import { defineConfig } from "prisma/config";

/**
 * Prisma 7 config. The datasource URL lives here (no longer in schema.prisma).
 * The runtime client connects via a driver adapter (see src/lib/db.ts).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
