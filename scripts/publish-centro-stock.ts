import { loadEnvConfig } from "@next/env";
import { randomInt } from "node:crypto";
import { PrismaClient, type Prisma } from "../generated/prisma";
import { setVariantAvailableStock } from "../lib/inventory";

// Explicit opt-in adjustment of existing imported products. Normal catalog
// reseeds preserve stock after purchases and manual edits.
async function main() {
  loadEnvConfig(process.cwd());
  const db = new PrismaClient();
  try {
    const products = await db.product.findMany({
      where: { sku: { startsWith: "CENTRO-" }, deleted: false },
      select: { id: true, variants: { where: { active: true }, select: { id: true, stock: true, options: true } } },
    });
    if (!process.argv.includes("--apply")) {
      console.log(`${products.length} Centro products. Use --apply to publish and set each active variant's stock to a random integer from 70 to 200.`);
      return;
    }
    let variantsUpdated = 0;
    for (const product of products) {
      await db.$transaction(async tx => {
        for (const variant of product.variants) {
          const stock = randomInt(70, 201);
          await setVariantAvailableStock({
            tx, productId: product.id, productVariantId: variant.id,
            availableQuantity: stock, expectedAvailableQuantity: variant.stock,
            reason: "User requested random Centro stock between 70 and 200",
          });
          const options = (variant.options && typeof variant.options === "object" && !Array.isArray(variant.options) ? variant.options : {}) as Prisma.JsonObject;
          const metadata = (options.__meta && typeof options.__meta === "object" && !Array.isArray(options.__meta) ? options.__meta : {}) as Prisma.JsonObject;
          await tx.productVariant.update({ where: { id: variant.id }, data: {
            options: { ...options, __meta: { ...metadata, stockSource: "user-requested-random-70-200" } },
          } });
        }
        await tx.product.update({ where: { id: product.id }, data: { available: true } });
      }, { maxWait: 10_000, timeout: 30_000 });
      variantsUpdated += product.variants.length;
    }
    console.log(JSON.stringify({ publishedProducts: products.length, variantsUpdated, stockRange: [70, 200] }, null, 2));
  } finally { await db.$disconnect(); }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
