import test from "node:test";
import assert from "node:assert/strict";
import { importCentroCatalog } from "../prisma/centro-seed.ts";
import { loadCentroCatalog } from "../scripts/centro-catalog.mjs";

const catalog = loadCentroCatalog().slice(0, 2);
function fixture({ existing = [], failure = false } = {}) {
  const writes = [];
  const products = [...existing];
  const db = {
    product: {
      findMany: async () => products,
      update: async ({ where, data }) => { writes.push({ kind: "update", where, data }); },
      create: async ({ data }) => {
        if (failure) throw new Error("insert failed");
        writes.push({ kind: "create", data });
        products.push({ slug: data.slug, sku: data.sku, basePrice: data.basePrice });
      },
      updateMany: async args => { writes.push({ kind: "archive", ...args }); return { count: 4 }; },
    },
    category: { upsert: async args => ({ id: 1, parentId: args.create.parentId }) },
    warehouse: { findFirst: async () => ({ id: 10 }) },
  };
  return { db, writes };
}

test("import available products with matching warehouse stock; archive only BOED after all inserts", async () => {
  const f = fixture();
  assert.deepEqual(await importCentroCatalog(f.db, catalog), { created: 2, skipped: 0, archivedBoed: 4 });
  const [created] = f.writes;
  assert.equal(created.data.available, true);
  assert.deepEqual(created.data.variants.create[0].stockLevels.create, { warehouseId: 10, quantity: catalog[0].variants[0].stock, reserved: 0 });
  const archived = f.writes.at(-1);
  assert.equal(archived.where.deleted, false);
  assert.deepEqual(archived.where.OR[0], { sku: { startsWith: "BOED-" } });
  assert.equal(archived.where.OR[1].sku.in.length, 11);
  assert.equal(archived.data.deleted, true);
  f.writes.length = 0;
  assert.equal((await importCentroCatalog(f.db, catalog)).skipped, 2);
  assert.deepEqual(f.writes.map(write => write.kind), ["archive"]);
});

test("identity collisions fail before writes; failed imports do not archive old catalog", async () => {
  const collision = fixture({ existing: [{ slug: catalog[0].product.slug, sku: "unrelated" }] });
  await assert.rejects(importCentroCatalog(collision.db, catalog), /collision/);
  assert.equal(collision.writes.length, 0);
  const failed = fixture({ failure: true });
  await assert.rejects(importCentroCatalog(failed.db, catalog), /insert failed/);
  assert.equal(failed.writes.length, 0);
  await assert.rejects(importCentroCatalog(failed.db, []), /empty/);
});

test("repeat imports add estimated prices only to existing zero-priced products and variants", async () => {
  const existing = catalog.map(item => ({
    slug: item.product.slug,
    sku: item.product.sku,
    basePrice: 0,
  }));
  const f = fixture({ existing });

  assert.equal((await importCentroCatalog(f.db, catalog)).skipped, 2);
  const updates = f.writes.filter(write => write.kind === "update");
  assert.equal(updates.length, 2);
  assert.equal(updates[0].data.basePrice, catalog[0].product.basePrice);
  assert.deepEqual(updates[0].data.variants.updateMany, {
    where: { price: 0 },
    data: { price: catalog[0].variants[0].price },
  });
});
