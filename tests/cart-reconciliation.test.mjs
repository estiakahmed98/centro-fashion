import test from "node:test";
import assert from "node:assert/strict";
import {
  getStaleServerCartItems,
  isSameCartLine,
} from "../lib/cart-reconciliation.ts";

test("checkout identifies old server rows missing from the current cart", () => {
  const currentCart = [{ productId: 7, variantId: 21 }];
  const serverCart = [
    { id: 1, productId: 7, variantId: 21, lineKey: "standard" },
    { id: 2, productId: 8, variantId: 22, lineKey: "standard" },
  ];

  assert.deepEqual(getStaleServerCartItems(serverCart, currentCart), [
    serverCart[1],
  ]);
});

test("cart reconciliation keeps distinct variants and configured lines separate", () => {
  assert.equal(
    isSameCartLine(
      { productId: 7, variantId: 21, lineKey: "standard" },
      { productId: 7, variantId: 22 },
    ),
    false,
  );
  assert.equal(
    isSameCartLine(
      { productId: 7, variantId: null, lineKey: "bundle:blue" },
      { productId: 7, variantId: null, bundleConfigurationKey: "bundle:red" },
    ),
    false,
  );
});

test("PC Builder cart reconciliation matches build slots", () => {
  assert.equal(
    isSameCartLine(
      {
        productId: 7,
        variantId: 21,
        pcBuildId: "build-a",
        pcBuildSlot: "cpu",
        lineKey: "pc-build:build-a",
      },
      {
        productId: 7,
        variantId: 21,
        pcBuildId: "build-a",
        pcBuildSlot: "cpu",
      },
    ),
    true,
  );
  assert.equal(
    isSameCartLine(
      { productId: 7, variantId: 21, pcBuildId: "build-a", pcBuildSlot: "cpu" },
      { productId: 7, variantId: 21, pcBuildId: "build-a", pcBuildSlot: "gpu" },
    ),
    false,
  );
});
