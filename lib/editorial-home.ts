import { getStorefrontCatalogProducts, parseCatalogFilters } from "@/lib/storefront-catalog";

export async function getHomepageProducts() {
  const data = await getStorefrontCatalogProducts(parseCatalogFilters({ perPage: "12", sort: "newest" }));
  return { featured: data.products.slice(0, 4) };
}
