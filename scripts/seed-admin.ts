import { seedAdmin } from "../prisma/admin-seed";

seedAdmin({ ifMissing: process.argv.includes("--if-missing") }).catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
