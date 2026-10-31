import { loadEnvConfig } from "@next/env";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { loadCentroCatalog, CENTRO_REVIEWED_IMAGES, type CentroProduct } from "../scripts/centro-catalog.mjs";
import { seedCentroPresentation } from "./centro-presentation";
import type { PrismaClient } from "../generated/prisma";
import { resolveBoedCategory } from "./boed-categories";

export async function importCentroCatalog(
  db: Pick<PrismaClient, "product" | "category" | "warehouse">,
  catalog: CentroProduct[],
) {
  if (!catalog.length) throw new Error("Refusing an empty Centro import");
  const existing = await db.product.findMany({
    where: { OR: [
      { slug: { in: catalog.map(item => item.product.slug) } },
      { sku: { in: catalog.map(item => item.product.sku) } },
    ] },
    select: { slug: true, sku: true, name: true },
  });
  for (const item of catalog) {
    if (existing.some(row => (row.slug === item.product.slug || row.sku === item.product.sku) &&
      (row.slug !== item.product.slug || row.sku !== item.product.sku))) {
      throw new Error(`Centro slug/SKU collision: ${item.product.slug}`);
    }
  }
  const imported = new Set(existing.map(row => row.sku));
  const categoryCache = new Map<string, { id: number; parentId: number | null }>();
  let warehouse = await db.warehouse.findFirst({
    orderBy: [{ isDefault: "desc" }, { id: "asc" }], select: { id: true },
  });
  if (!warehouse) warehouse = await db.warehouse.create({
    data: { name: "Main Warehouse", code: "MAIN", country: "BD", isDefault: true },
    select: { id: true },
  });
  let created = 0;
  for (const item of catalog) {
    // Preserve published details and operator-managed inventory on reruns.
    if (imported.has(item.product.sku)) {
      const previous = existing.find(row => row.sku === item.product.sku);
      // Replace only the old generated placeholder, preserving manual names.
      if (previous?.name && /^Centro .+ [a-f0-9]{16}$/.test(previous.name)) {
        await db.product.updateMany({ where: { sku: item.product.sku, name: previous.name }, data: { name: item.product.name } });
      }
      continue;
    }
    const categoryId = await resolveBoedCategory(db, item.categories, categoryCache);
    await db.product.create({ data: {
      ...item.product, type: "PHYSICAL", categoryId,
      variants: { create: item.variants.map(variant => ({
        ...variant,
        stockLevels: { create: { warehouseId: warehouse.id, quantity: variant.stock, reserved: 0 } },
      })) },
    } });
    created++;
  }
  // Archive the previous import only after every Centro product was inserted.
  // Keep product, variant, order and inventory history intact.
  const archived = await db.product.updateMany({
    where: { OR: [
      { sku: { startsWith: "BOED-" } },
      { sku: { in: CENTRO_REVIEWED_IMAGES.filter(item => item.role !== "product").map(item => `CENTRO-${item.id.toUpperCase()}`) } },
    ], deleted: false },
    data: { available: false, featured: false, deleted: true },
  });
  return { created, skipped: catalog.length - created, archivedBoed: archived.count };
}

export async function seedCentro(options: { apply?: boolean; export?: boolean } = {}) {
  const catalog = loadCentroCatalog();
  console.log(JSON.stringify({
    products: catalog.length,
    categories: new Set(catalog.flatMap(item => item.categories.map(category => category.slug))).size,
    assets: catalog.length, reviewRequired: catalog.length,
    sellableStock: catalog.reduce((total, item) => total + item.variants.reduce((sum, variant) => sum + variant.stock, 0), 0),
  }, null, 2));
  if (options.export) {
    await writeFile(path.join(process.cwd(), "data/centro-normalized-catalog.json"), JSON.stringify(catalog, null, 2) + "\n");
    console.log("Exported data/centro-normalized-catalog.json");
  }
  if (!options.apply) {
    console.log("Validation only. Use --apply to import Centro products and archive BOED products.");
    return;
  }
  loadEnvConfig(process.cwd());
  if (!process.env.DATABASE_URL?.trim()) throw new Error("DATABASE_URL is required to apply the Centro seed.");
  const { PrismaClient } = await import("../generated/prisma/index.js");
  const db = new PrismaClient();
  try {
    console.log(JSON.stringify(await importCentroCatalog(db, catalog), null, 2));
    await seedCentroPresentation(db, catalog);
  } finally { await db.$disconnect(); }
}
