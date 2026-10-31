import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getCommerceClient } from "@/lib/commerce-client";
import { ProductView } from "@/components/ProductView";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name ?? "Product",
    description: product?.description,
  };
}
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getCommerceClient().listProducts({
    category: product.category,
    limit: 5,
  });
  return (
    <ProductView
      key={product.slug}
      product={product}
      recommended={related.products
        .filter((p) => p.id !== product.id)
        .slice(0, 4)}
    />
  );
}
