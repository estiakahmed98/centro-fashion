import { cache } from "react";
import { getStorefrontCatalogProducts, parseCatalogFilters, type StorefrontCatalogProduct } from "@/lib/storefront-catalog";
import type { StorefrontProductDetail } from "@/lib/storefront-product-detail";

export const getProductRecommendations = cache(async (product: Pick<StorefrontProductDetail, "id" | "category" | "brand">) => {
  const categoryData = await getStorefrontCatalogProducts(
    parseCatalogFilters({
      category: product.category.slug,
      sort: "popular",
      perPage: "12",
    }),
  );
  const recommendations = new Map<number, StorefrontCatalogProduct>();
  const addRecommendations = (products: StorefrontCatalogProduct[]) => {
    // Related cards are discovery links, so unavailable catalog items can still
    // be recommended. Prefer available stock within each relevance group.
    const ranked = [...products].sort((left, right) => Number(right.stock > 0) - Number(left.stock > 0));
    for (const candidate of ranked) {
      if (
        candidate.id === product.id ||
        recommendations.has(candidate.id)
      ) {
        continue;
      }
      recommendations.set(candidate.id, candidate);
      if (recommendations.size === 8) break;
    }
  };

  addRecommendations(categoryData.products);

  // A sparse category must not leave the desktop page with an empty rail.
  // Prefer the same brand, then fill the remaining slots with popular items.
  if (recommendations.size < 8 && product.brand) {
    const brandData = await getStorefrontCatalogProducts(
      parseCatalogFilters({
        brand: product.brand.slug,
        sort: "popular",
        perPage: "12",
      }),
    );
    addRecommendations(brandData.products);
  }
  if (recommendations.size < 8) {
    const popularData = await getStorefrontCatalogProducts(
      parseCatalogFilters({ sort: "popular", perPage: "12" }),
    );
    addRecommendations(popularData.products);
  }

  return [...recommendations.values()].slice(0, 8);
});
