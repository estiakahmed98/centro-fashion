import { getCommerceClient } from "@/lib/commerce-client";
import { queryFromSearchParams } from "@/lib/commerce-query";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CollectionView } from "@/components/CollectionView";
import { categoryNames, type CollectionPage } from "@/lib/products";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: categoryNames[slug as CollectionPage] ?? "Collection" };
}
export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!(slug in categoryNames)) notFound();
  const search = await searchParams;
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(search))
    if (value !== undefined)
      (Array.isArray(value) ? value : [value]).forEach((v) =>
        queryParams.append(key, v),
      );
  queryParams.set("category", slug);
  const query = queryFromSearchParams(queryParams);
  const page = await getCommerceClient().listProducts(query);
  return (
    <CollectionView
      key={`${slug}?${queryParams.toString()}`}
      category={slug as CollectionPage}
      initialPage={page}
      initialQuery={query}
    />
  );
}
