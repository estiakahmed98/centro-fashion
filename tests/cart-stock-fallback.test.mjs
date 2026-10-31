import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { computeVariantAvailableStock } from "../lib/warehouse-stock.ts";

test("cart routes use the storefront stock fallback for physical variants", () => {
  const cartRoute = readFileSync(
    new URL("../app/api/cart/route-core.ts", import.meta.url),
    "utf8",
  );
  const cartItemRoute = readFileSync(
    new URL("../app/api/cart/[id]/route-core.ts", import.meta.url),
    "utf8",
  );
  const pcBuilderCartRoute = readFileSync(
    new URL("../app/api/cart/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(cartRoute, /computeVariantAvailableStock\(targetVariant\)/);
  assert.match(cartItemRoute, /computeVariantAvailableStock\(cartItem\.variant\)/);
  assert.match(pcBuilderCartRoute, /computeVariantAvailableStock\(inventoryVariant\)/);
});

test("cart stock uses legacy variant stock when warehouse levels are not initialized", () => {
  assert.equal(computeVariantAvailableStock({ stock: 5, stockLevels: [] }), 5);
  assert.equal(computeVariantAvailableStock({ stock: 5, stockLevels: null }), 5);
});

test("cart stock prefers warehouse availability when warehouse levels exist", () => {
  assert.equal(
    computeVariantAvailableStock({
      stock: 5,
      stockLevels: [{ quantity: 4, reserved: 1 }],
    }),
    3,
  );
});
