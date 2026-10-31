import { loadEnvConfig } from "@next/env";
import type { PrismaConfig } from "prisma";

// Do not let a deployment seed an env-file database when its Vercel URL is missing.
if (process.env.VERCEL === "1" && !process.env.DATABASE_URL?.trim()) {
  throw new Error("Configure DATABASE_URL for this Vercel environment before running Prisma.");
}
loadEnvConfig(process.cwd());

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations-release",
    seed: "tsx prisma/seed.ts",
  },
  experimental: {
    externalTables: true,
  },
  tables: {
    external: [
      "public.PcBuildCartItem",
      "public.PcBuildOrderItem",
      "public.PcBuilderSavedBuild",
    ],
  },
} satisfies PrismaConfig;
