import { getProductRecommendations } from "@/lib/storefront-recommendations";
import type { StorefrontProductDetail } from "@/lib/storefront-product-detail";
import { ProductCard } from "./EditorialCard";

export default async function EditorialRelatedProducts({ product }: { product: Pick<StorefrontProductDetail, "id" | "category" | "brand"> }) {
  const products = await getProductRecommendations(product);
  if (!products.length) return null;
  return <section className="editorial-recommendations" aria-labelledby="related-products-title">
    <h2 id="related-products-title">Related products</h2>
    <div className="editorial-grid">{products.slice(0, 4).map(item => <ProductCard key={item.id} product={item} />)}</div>
  </section>;
}
