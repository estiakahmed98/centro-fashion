import { getHomepageProducts } from "@/lib/editorial-home";
import { ProductCard } from "./EditorialCard";

export default async function HomeFeaturedProducts() {
  const home = await getHomepageProducts().catch(() => null);
  if (!home) return <p role="status" className="col-span-2 p-10 text-center text-stone-500">The collection is temporarily unavailable. Please try again shortly.</p>;
  return home.featured.map(product => <ProductCard key={product.id} product={product} />);
}
