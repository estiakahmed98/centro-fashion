import { redirect, notFound } from "next/navigation";
import { getStorefrontCatalogFacets } from "@/lib/storefront-catalog";

const legacyAliases: Record<string, string> = { gifts: "accessories", summer: "swimwear" };
export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "all") redirect("/ecommerce/products");
  if (slug === "new-arrivals") redirect("/ecommerce/products?sort=newest");
  const { categories } = await getStorefrontCatalogFacets();
  const category = categories.find(item => item.slug === slug)
    ?? categories.find(item => item.slug === legacyAliases[slug]);
  if (!category) notFound();
  redirect(`/ecommerce/products?${new URLSearchParams({ category: category.slug })}`);
}
