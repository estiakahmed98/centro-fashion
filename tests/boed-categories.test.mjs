import test from "node:test";
import assert from "node:assert/strict";
import { resolveBoedCategory } from "../prisma/boed-categories.ts";

test("shared category paths are resolved once and retain their parent links", async () => {
  const calls = [];
  const db = { category: { upsert: async args => {
    calls.push(args);
    return { id: calls.length, parentId: args.create.parentId };
  } } };
  const cache = new Map();
  const shirts = { slug: "shirts", name: "Shirts" };
  const casual = { slug: "casual-shirts", name: "Casual Shirts" };
  assert.equal(await resolveBoedCategory(db, [shirts, casual], cache), 2);
  assert.equal(await resolveBoedCategory(db, [shirts, casual], cache), 2);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].create.parentId, null);
  assert.equal(calls[1].create.parentId, 1);
  assert.deepEqual(calls[1].update, {});
});

test("existing and cached category hierarchy collisions stop the import", async () => {
  const db = { category: { upsert: async () => ({ id: 1, parentId: 99 }) } };
  const category = { slug: "shirts", name: "Shirts" };
  await assert.rejects(resolveBoedCategory(db, [category], new Map()), /hierarchy differs: shirts/);
  await assert.rejects(resolveBoedCategory(db, [category], new Map([["shirts", { id: 1, parentId: 99 }]])), /hierarchy differs: shirts/);
});

test("an empty category path is rejected before creating a product", async () => {
  await assert.rejects(resolveBoedCategory({}, [], new Map()), /requires a category/);
});
