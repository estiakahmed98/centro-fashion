import { seedAdmin } from "./admin-seed";
import { seedCentro } from "./centro-seed";

// Seed the requested admins and the Centro image catalog.
async function main() {
  await seedAdmin({ ifMissing: process.argv.includes("--if-missing") });
  await seedCentro({ apply: true });
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
