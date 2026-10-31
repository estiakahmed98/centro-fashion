import { cache } from "react";
import { getStorefrontCatalogFacets } from "@/lib/storefront-catalog";
import { prisma } from "@/lib/prisma";

export type CentroCategory = {
  id: number; name: string; slug: string; parentId: number | null;
  image: string | null; productCount: number; showInHeader: boolean; showInFooter: boolean;
};

// Use the same active-category tree as the storefront. Samples are only used
// as image fallbacks; they do not alter product visibility or inventory.
export const getCentroCategories = cache(async (): Promise<CentroCategory[]> => {
  const { categories } = await getStorefrontCatalogFacets();
  const samples = await prisma.product.findMany({
    where: { deleted: false, available: true, categoryId: { in: categories.map(item => item.id) }, image: { not: null } },
    orderBy: { id: "asc" }, distinct: ["categoryId"],
    select: { categoryId: true, image: true },
  });
  return categories.map(category => ({
    id: category.id, name: category.name, slug: category.slug, parentId: category.parentId,
    image: category.image || samples.find(item => item.categoryId === category.id)?.image || null,
    productCount: category.productCount, showInHeader: category.showInHeader, showInFooter: category.showInFooter,
  }));
});
