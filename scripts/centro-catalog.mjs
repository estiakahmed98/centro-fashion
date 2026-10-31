import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";

export const CENTRO_CATEGORIES = {
  activewear: "Activewear", denim: "Denim", footwear: "Footwear",
  homeTextiles: "Home Textiles", kids: "Kidswear", knitwear: "Knitwear",
  menswear: "Menswear", outerwear: "Outerwear", womenswear: "Womenswear",
};

export function centroMediaPath(file, root = process.cwd()) {
  if (typeof file !== "string" || !/^images\/[A-Za-z0-9_]+\/[a-f0-9]{16}\.png$/.test(file)) {
    throw new Error(`Invalid Centro media path: ${file}`);
  }
  const directory = path.resolve(root, "public/centro");
  const target = path.resolve(directory, file);
  if (!existsSync(target)) throw new Error(`Missing Centro asset: ${file}`);
  if (!realpathSync(target).startsWith(realpathSync(directory) + path.sep)) {
    throw new Error(`Centro asset escapes public/centro: ${file}`);
  }
  return `/centro/${file}`;
}

// Each unique product image becomes a review draft. The crawl does not say
// which shots share a product, or supply prices, sizes and stock quantities.
export function normalizeCentroCatalog(source, root = process.cwd()) {
  if (!Array.isArray(source)) throw new Error("Invalid Centro image report");
  const identities = new Set();
  const hashes = new Set();
  const catalog = [];
  for (const item of [...source].sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
    if (!["downloaded", "already_exists"].includes(item.status)) continue;
    const category = item.file?.split("/")[1];
    if (!Object.hasOwn(CENTRO_CATEGORIES, category)) continue;
    if (!/^[a-f0-9]{16}$/.test(item.id) || path.posix.basename(item.file) !== `${item.id}.png`) {
      throw new Error("Invalid Centro image identity");
    }
    if (identities.has(item.id)) throw new Error(`Duplicate Centro identity: ${item.id}`);
    identities.add(item.id);
    const image = centroMediaPath(item.file, root);
    if (!/^[a-f0-9]{64}$/.test(item.sha256)) throw new Error(`Invalid Centro checksum: ${item.id}`);
    if (hashes.has(item.sha256)) continue;
    hashes.add(item.sha256);
    const sourcePages = (item.source_pages || []).filter(value => {
      try {
        const url = new URL(value);
        return url.origin === "https://www.centro.com.bd" && url.pathname === "/product" && url.searchParams.get("filter") === category;
      } catch { return false; }
    });
    if (!sourcePages.length) throw new Error(`Missing Centro product source: ${item.id}`);
    const label = CENTRO_CATEGORIES[category];
    const slug = category.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    const sku = `CENTRO-${item.id.toUpperCase()}`;
    const review = {
      sourceId: item.id, sourceUrl: sourcePages[0], sourcePages,
      sourceImageUrl: item.image_url, sourceCategories: item.categories || [],
      sourceChecksum: item.sha256, needsReview: true,
      requiresNameVerification: true, requiresPriceVerification: true,
      requiresStockVerification: true, requiresSizeVerification: true,
      requiresDescriptionReview: true, requiresGalleryReview: true,
    };
    catalog.push({
      categories: [{ name: label, slug: `centro-${slug}` }],
      product: {
        name: `Centro ${label} ${item.id}`, slug: `centro-${slug}-${item.id}`,
        sku, type: "PHYSICAL", description: "", basePrice: 0, currency: "BDT",
        image, gallery: [image], available: false, featured: false,
      },
      variants: [{
        sku: `${sku}-1`, price: 0, currency: "BDT", stock: 0,
        active: true, isDefault: true, options: { __meta: review },
      }],
      review,
    });
  }
  if (!catalog.length) throw new Error("Centro report contains no product images");
  return catalog.sort((a, b) => a.product.slug.localeCompare(b.product.slug));
}

export function loadCentroCatalog(root = process.cwd()) {
  return normalizeCentroCatalog(JSON.parse(readFileSync(path.join(root, "public/centro/images_report.json"), "utf8")), root);
}
