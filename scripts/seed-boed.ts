import { seedBoed } from "../prisma/boed-seed";

seedBoed({
  apply: process.argv.includes("--apply"),
  export: process.argv.includes("--export"),
}).catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
