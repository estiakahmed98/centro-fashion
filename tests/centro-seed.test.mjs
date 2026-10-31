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
      create: async ({ data }) => {
        if (failure) throw new Error("insert failed");
        writes.push({ kind: "create", data });
        products.push({ slug: data.slug, sku: data.sku });
      },
      updateMany: async args => { writes.push({ kind: "archive", ...args }); return { count: 4 }; },
    },
    category: { upsert: async args => ({ id: 1, parentId: args.create.parentId }) },
    warehouse: { findFirst: async () => ({ id: 10 }) },
  };
  return { db, writes };
}

test("import drafts with zero warehouse stock; archive only BOED after all inserts", async () => {
  const f = fixture();
  assert.deepEqual(await importCentroCatalog(f.db, catalog), { created: 2, skipped: 0, archivedBoed: 4 });
  const [created] = f.writes;
  assert.equal(created.data.available, false);
  assert.deepEqual(created.data.variants.create[0].stockLevels.create, { warehouseId: 10, quantity: 0, reserved: 0 });
  const archived = f.writes.at(-1);
  assert.deepEqual(archived.where, { sku: { startsWith: "BOED-" }, deleted: false });
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
