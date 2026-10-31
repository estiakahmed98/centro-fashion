import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadCentroCatalog, normalizeCentroCatalog, centroMediaPath } from "../scripts/centro-catalog.mjs";

const source = JSON.parse(readFileSync(new URL("../public/centro/images_report.json", import.meta.url), "utf8"));
const sample = source.find(item => item.file?.startsWith("images/menswear/"));

test("Centro product images map to stable identities and nine categories", () => {
  const rows = loadCentroCatalog();
  assert.equal(rows.length, 139);
  assert.equal(new Set(rows.map(row => row.product.sku)).size, rows.length);
  assert.equal(new Set(rows.flatMap(row => row.categories.map(category => category.slug))).size, 9);
  assert.deepEqual(normalizeCentroCatalog([...source].reverse()).map(row => row.product), rows.map(row => row.product));
  for (const row of rows) {
    assert.ok(row.product.image.startsWith("/centro/images/"));
    assert.equal(row.product.available, true);
    assert.equal(row.product.basePrice, 0);
    assert.ok(Number.isInteger(row.variants[0].stock) && row.variants[0].stock >= 70 && row.variants[0].stock <= 200);
    assert.equal(row.variants[0].options.__meta.requiresSizeVerification, true);
    assert.equal(row.variants[0].options.Size, undefined);
    assert.ok(row.review.sourcePages.length);
  }
});

test("exclude corporate images, failed downloads and duplicate content", () => {
  const corporate = source.find(item => item.file?.startsWith("images/About_Us/"));
  const duplicate = source.find(item => item.file?.startsWith("images/menswear/") && item.id !== sample.id);
  const rows = normalizeCentroCatalog([sample, corporate, { ...sample, status: "failed" }, { ...duplicate, sha256: sample.sha256 }]);
  assert.equal(rows.length, 1);
});

test("reject invalid reports, duplicate identities, missing assets and traversal", () => {
  assert.throws(() => normalizeCentroCatalog({}), /Invalid/);
  assert.throws(() => normalizeCentroCatalog([]), /no product images/);
  assert.throws(() => normalizeCentroCatalog([sample, sample]), /Duplicate/);
  assert.throws(() => normalizeCentroCatalog([{ ...sample, source_pages: [] }]), /Missing Centro product source/);
  assert.throws(() => centroMediaPath("images/menswear/0000000000000000.png"), /Missing/);
  for (const file of ["../.env", "images/menswear/../../.env", "images\\menswear\\file.png", "/centro/images/menswear/file.png"]) {
    assert.throws(() => centroMediaPath(file), /Invalid/);
  }
});
