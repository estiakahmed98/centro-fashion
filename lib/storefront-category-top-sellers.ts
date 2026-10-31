import { compressedCache } from "@/lib/compressed-cache";
import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { getEffectiveStorefrontCategoryIds } from "@/lib/category-navigation-server";
import { getDisabledStorefrontProductTypes } from "@/lib/store-feature-gates-server";
import { getBookProductVisibilityWhere } from "@/lib/book-product-visibility-server";
import { resolveFlashSalePricing } from "@/lib/flash-sale";

export const getCategoryTopSellers = compressedCache(async (productId: number, categoryId: number) => {
  const [categoryIds, disabledTypes, bookVisibility] = await Promise.all([
    getEffectiveStorefrontCategoryIds(),
    getDisabledStorefrontProductTypes(),
    getBookProductVisibilityWhere(),
  ]);
  const where: Prisma.ProductWhereInput = {
    deleted: false,
    available: true,
    id: { not: productId },
    categoryId: { in: categoryIds, not: categoryId },
    ...(disabledTypes.length ? { type: { notIn: disabledTypes } } : {}),
    AND: [bookVisibility],
  };
  // Rank categories by their best seller first; limiting a global product list
  // before grouping could let a single busy category crowd out all the others.
  const categories = await prisma.product.groupBy({
    by: ["categoryId"],
    where,
    _max: { soldCount: true },
    orderBy: [{ _max: { soldCount: "desc" } }, { categoryId: "asc" }],
    take: 4,
  });
  const winners = await Promise.all(categories.map(category => prisma.product.findFirst({
    where: { ...where, categoryId: category.categoryId },
    orderBy: [{ soldCount: "desc" }, { id: "desc" }],
    select: {
      id: true, slug: true, name: true, image: true,
      basePrice: true, originalPrice: true,
      flashSaleEnabled: true, flashSalePrice: true,
      flashSaleStartsAt: true, flashSaleEndsAt: true,
      category: { select: { id: true, name: true } },
    },
  })));
  return winners.flatMap(product => {
    if (!product) return [];
    const pricing = resolveFlashSalePricing(product);
    return [{
      id: product.id, slug: product.slug, name: product.name, image: product.image,
      category: product.category,
      price: pricing.salePrice,
      originalPrice: pricing.active ? pricing.regularPrice : product.originalPrice === null ? null : Number(product.originalPrice),
    }];
  });
}, ["storefront-category-top-sellers-v1"], { revalidate: 30, tags: ["storefront-catalog", "products", "categories", "flash-sales", "store-features"] });
