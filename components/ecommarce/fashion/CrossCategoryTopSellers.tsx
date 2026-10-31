import { getCategoryTopSellers } from "@/lib/storefront-category-top-sellers";
import { ProductCard } from "./EditorialCard";

export async function CrossCategoryTopSellers({ productId, categoryId }: { productId: number; categoryId: number }) {
  const products = await getCategoryTopSellers(productId, categoryId);
  if (!products.length) return null;
  return <section className="editorial-recommendations editorial-category-picks" aria-labelledby="cross-category-products-title">
    <h2 id="cross-category-products-title">You may also like</h2>
    <div className="editorial-grid">{products.map(product => <div key={product.id}>
      <p className="mb-3 text-center text-[10px] uppercase tracking-[0.16em] text-stone-500">{product.category.name}</p>
      <ProductCard product={product} />
    </div>)}</div>
  </section>;
}
