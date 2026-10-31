import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";

export const CENTRO_CATEGORIES = {
  activewear: "Activewear", denim: "Denim", footwear: "Footwear",
  homeTextiles: "Home Textiles", kids: "Kidswear", knitwear: "Knitwear",
  menswear: "Menswear", outerwear: "Outerwear", womenswear: "Womenswear",
};
export const CENTRO_REVIEWED_IMAGES = JSON.parse(readFileSync(new URL("../data/centro-reviewed-images.json", import.meta.url), "utf8"));
const reviewedById = new Map(CENTRO_REVIEWED_IMAGES.map(item => [item.id, item]));

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

// Stock and availability are explicitly requested demo defaults. Other missing
// source details remain flagged for review.
export function normalizeCentroCatalog(source, root = process.cwd()) {
  if (!Array.isArray(source)) throw new Error("Invalid Centro image report");
  const identities = new Set();
  const hashes = new Set();
  const catalog = [];
  for (const item of [...source].sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
    if (!["downloaded", "already_exists"].includes(item.status)) continue;
    const reviewed = reviewedById.get(item.id);
    if (reviewed && reviewed.role !== "product") continue;
    const category = reviewed?.category || item.file?.split("/")[1];
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
        return url.origin === "https://www.centro.com.bd" && (reviewed?.role === "product" || (url.pathname === "/product" && url.searchParams.get("filter") === category));
      } catch { return false; }
    });
    if (!sourcePages.length) throw new Error(`Missing Centro product source: ${item.id}`);
    const label = CENTRO_CATEGORIES[category];
    const slug = category.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    const sku = `CENTRO-${item.id.toUpperCase()}`;
    const stock = randomInt(70, 201);
    const review = {
      sourceId: item.id, sourceUrl: sourcePages[0], sourcePages,
      sourceImageUrl: item.image_url, sourceCategories: item.categories || [],
      sourceChecksum: item.sha256, needsReview: true,
      nameSource: reviewed ? "visual-image-review" : "generated-category-name",
      stockSource: "user-requested-random-70-200",
      requiresNameVerification: true, requiresPriceVerification: true,
      requiresStockVerification: true, requiresSizeVerification: true,
      requiresDescriptionReview: true, requiresGalleryReview: true,
    };
    catalog.push({
      categories: [{ name: label, slug: `centro-${slug}` }],
      product: {
        name: reviewed?.name || `Centro ${label} ${item.id}`, slug: `centro-${slug}-${item.id}`,
        sku, type: "PHYSICAL", description: "", basePrice: 0, currency: "BDT",
        image, gallery: item.id === "3320106d9057096b" ? [image, centroMediaPath("images/The_Centro_Design_and_Production_Process/d48a20bc5afc7181.png", root)] : [image], available: true, featured: false,
      },
      variants: [{
        sku: `${sku}-1`, price: 0, currency: "BDT", stock,
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
