import { redirect, notFound } from "next/navigation";

const collections: Record<string, string> = {
  clothing: "clothing", suits: "suits", jackets: "jackets", shirts: "shirts", trousers: "trousers",
  knitwear: "knitwear", shoes: "shoes", accessories: "accessories", gifts: "accessories",
  "ladies-wear": "ladies-wear", summer: "swimwear",
  all: "", "new-arrivals": "",
};
export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(slug in collections)) notFound();
  redirect(`/ecommerce/products?${slug === "new-arrivals" ? "sort=newest" : `category=${collections[slug]}`}`);
}
