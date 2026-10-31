"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { useStore } from "./StoreProvider";
import { Icon } from "./Icons";

export function ProductCard({ product }: { product: Product }) {
  const { favorites, toggleFavorite } = useStore();
  const liked = favorites.includes(product.id);
  const hoverImage = product.images.find(
    (image) => image && image !== product.image,
  );
  return (
    <article className="product-card min-w-[0] [@media(hover:_hover)]:[&:hover_.product-hover-image]:opacity-[1] [&:focus-within_.product-hover-image]:opacity-[1] [&:focus-within_.quick-view]:[transform:translateY(0)] [&:hover_.product-media_img]:[transform:scale(1.025)] [&:hover_.quick-view]:[transform:translateY(0)]">
      <div className="product-media relative [background:#eae9e7] overflow-hidden [aspect-ratio:900/1125] [&_>_a:first-child]:w-[100%] [&_>_a:first-child]:h-[100%] [&_>_a:first-child]:block [&_>_a:first-child_img]:w-[100%] [&_>_a:first-child_img]:h-[100%] [&_>_a:first-child_img]:block [&_img]:object-cover [&_img]:[transition:transform_0.55s] [&_.product-hover-image]:absolute [&_.product-hover-image]:inset-[0] [&_.product-hover-image]:opacity-[0] [&_.product-hover-image]:[transition:opacity_0.3s_ease,_transform_0.55s] motion-reduce:[&_.product-hover-image]:[transition:none]">
        <Link
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
        >
          {product.image ? (
            <img src={product.image} alt={product.name} loading="lazy" />
          ) : (
            <div className="image-unavailable flex items-center justify-center min-h-[240px] h-[100%] [background:#eeeae4] [color:#83796a] [font-size:13px] tracking-[0.05em]">
              Image coming soon
            </div>
          )}
          {hoverImage && (
            <img
              className="product-hover-image"
              src={hoverImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
          )}
        </Link>
        {product.badge && (
          <span className="product-badge absolute top-[15px] left-[14px] [font-size:10px] [font-weight:var(--font-weight-semibold,_600)] [background:#fff9] p-[6px_8px] tracking-[0.1em] max-[520.01px]:[font-size:8px] max-[520.01px]:top-[9px] max-[520.01px]:left-[8px]">
            {product.badge}
          </span>
        )}
        <button
          className={`favorite-button absolute right-[15px] top-[14px] z-[2] p-[5px] [color:#333] [&.is-active]:[color:#ad2826] max-[520.01px]:top-[5px] max-[520.01px]:right-[6px] ${liked ? "is-active" : ""}`}
          aria-label={liked ? "Remove from saved items" : "Save to favorites"}
          aria-pressed={liked}
          onClick={() => toggleFavorite(product.id)}
        >
          <Icon
            name="bookmark"
            size={18}
            fill={liked ? "currentColor" : "none"}
          />
        </button>
        <Link
          className="quick-view absolute left-[0] right-[0] bottom-[0] text-center p-[13px] [background:#ffffffed] [font-size:11px] tracking-[0.08em] [text-transform:uppercase] [font-weight:var(--font-weight-semibold,_600)] [transform:translateY(100%)] [transition:transform_0.2s] [&:focus-visible]:[transform:translateY(0)] max-[520.01px]:hidden"
          href={`/products/${product.slug}`}
        >
          Discover product
        </Link>
      </div>
      <div className="product-meta p-[14px_8px_25px] min-h-[120px] max-[520.01px]:p-[11px_3px_22px]">
        <Link
          href={`/products/${product.slug}`}
          className="product-name block [font-size:13px] leading-[1.6] [color:#292929] [&:hover]:[text-decoration:underline] max-[520.01px]:[font-size:12px]"
        >
          {product.name}
        </Link>
        <div className="product-price [font-size:13px] mt-[7px] [&_del]:ml-[10px] [&_del]:[color:var(--muted)] max-[520.01px]:[font-size:12px]">
          {formatPrice(product.price)}
          {product.requiresPriceVerification && (
            <span
              className="ml-2 text-[8px] text-[var(--muted)]"
              title="Demo estimate; not an official supplier or checkout price"
            >
              DEMO
            </span>
          )}
          {product.compareAt && <del>{formatPrice(product.compareAt)}</del>}
        </div>
        <span className="product-color block [font-size:11px] [color:#969390] mt-[5px] max-[520.01px]:[font-size:10px]">
          {product.color} · Aura BOED Collection
        </span>
      </div>
    </article>
  );
}
