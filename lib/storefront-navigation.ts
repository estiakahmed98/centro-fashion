import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma";
import type { FeatureControlledProductType } from "@/lib/store-features";
import { prisma } from "@/lib/prisma";
import { getEffectiveStorefrontCategoryIds } from "@/lib/category-navigation-server";
import { getDisabledStorefrontProductTypes } from "@/lib/store-feature-gates-server";
import { getBookProductVisibilityWhere } from "@/lib/book-product-visibility-server";

const readHighlights = unstable_cache(async (categories: string, disabled: string, visibility: string) => {
  const disabledTypes = JSON.parse(disabled) as FeatureControlledProductType[];
  return prisma.product.findMany({
    where: {
      deleted: false, available: true,
      categoryId: { in: JSON.parse(categories) as number[] },
      ...(disabledTypes.length ? { type: { notIn: disabledTypes } } : {}),
      AND: [JSON.parse(visibility) as Prisma.ProductWhereInput],
    },
    orderBy: [{ soldCount: "desc" }, { id: "desc" }],
    take: 3,
    select: { id: true, slug: true, name: true, image: true },
  });
}, ["storefront-navigation-highlights-v1"], { revalidate: 120, tags: ["storefront-catalog", "products", "categories", "store-features"] });

export const getStorefrontNavigationHighlights = cache(async () => {
  const [categories, disabled, visibility] = await Promise.all([
    getEffectiveStorefrontCategoryIds(), getDisabledStorefrontProductTypes(), getBookProductVisibilityWhere(),
  ]);
  return readHighlights(JSON.stringify(categories), JSON.stringify(disabled), JSON.stringify(visibility));
});
