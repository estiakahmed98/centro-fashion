"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useWishlist } from "@/components/ecommarce/WishlistContext";
import { useStorefrontSettings } from "@/providers/storefront-settings-provider";

export type EditorialProduct = {
  id: number | string;
  name: string;
  slug?: string;
  href?: string;
  image?: string | null;
  images?: string[];
  price: number;
  originalPrice?: number | null;
};

export function ProductCard({ product }: { product: EditorialProduct }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { formatCurrency } = useStorefrontSettings();
  const { status } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const liked = isInWishlist(product.id);
  const href = product.href || `/ecommerce/products/${product.slug || product.id}`;
  const toggleWishlist = async () => {
    if (status !== "authenticated") {
      router.push(`/signin?callbackUrl=${encodeURIComponent(href)}`);
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const response = await fetch(liked ? `/api/wishlist?productId=${product.id}` : "/api/wishlist", liked ? { method: "DELETE" } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
      if (!response.ok) throw new Error("Unable to update your wishlist. Please try again.");
      if (liked) removeFromWishlist(product.id); else addToWishlist(product.id);
    } catch { toast.error("Unable to update your wishlist. Please try again."); }
    finally { setSaving(false); }
  };
  return (
    <article className="product-card editorial-card">
      <div className="product-media">
        <Link href={href} aria-label={`View ${product.name}`}>
          <Image src={product.image || "/placeholder.svg"} alt={product.name} fill sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" unoptimized={Boolean(product.image && (!product.image.startsWith("/") || product.image.startsWith("//")))} />
          {product.images?.[1] ? <Image className="product-hover-image" src={product.images[1]} alt="" fill sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" unoptimized={!product.images[1].startsWith("/") || product.images[1].startsWith("//")} /> : null}
        </Link>
        <button type="button" className="favorite-button" disabled={saving || status === "loading"} aria-label={liked ? "Remove from wishlist" : "Save to wishlist"} aria-pressed={liked} onClick={() => void toggleWishlist()}>
          <Bookmark size={18} fill={liked ? "currentColor" : "none"} />
        </button>
        <Link className="quick-view" href={href}>Discover product</Link>
      </div>
      <div className="product-meta">
        <Link className="product-name" href={href}>{product.name}</Link>
        <div className="product-price">{formatCurrency(product.price)}{product.originalPrice && product.originalPrice > product.price ? <del>{formatCurrency(product.originalPrice)}</del> : null}</div>
        <span className="product-color">Aura BOED Collection</span>
      </div>
    </article>
  );
}
