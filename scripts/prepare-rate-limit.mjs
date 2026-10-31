import nextEnv from "@next/env";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

// Provision only the additive table on both migrated and db-push databases.
// Never reset or seed store data during deployment preparation.
if (process.env.VERCEL === "1" && !process.env.DATABASE_URL?.trim()) {
  throw new Error("Configure DATABASE_URL in Vercel before building.");
}
nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL?.trim()) throw new Error("DATABASE_URL is required.");
const require = createRequire(import.meta.url);
const { PrismaClient } = require("../generated/prisma");
const db = new PrismaClient();
try {
  const sql = await readFile(new URL("../prisma/migrations-release/20261031000000_request_rate_limit/migration.sql", import.meta.url), "utf8");
  await db.$transaction(async tx => {
    // Serialize concurrent production/preview builds creating the same table.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('request-rate-limit-schema'))::text`;
    for (const statement of sql.split(";").map(value => value.trim()).filter(Boolean)) {
      await tx.$executeRawUnsafe(statement);
    }
  }, { maxWait: 10_000, timeout: 30_000 });
  console.log("PostgreSQL request rate-limit table is ready. Redis is not required.");
} finally {
  await db.$disconnect();
}
