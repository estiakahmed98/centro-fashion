"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";
import { categoryNames, formatPrice } from "@/lib/products";
import { useStore } from "./StoreProvider";
import { ProductCard } from "./ProductCard";
import { Icon } from "./Icons";
import { ProductGallery } from "./ProductGallery";
import { canAddDemoProduct } from "@/lib/commerce-cart";
import { selectVariant, canAddVariant } from "@/lib/commerce-adapter";

export function ProductView({
  product,
  recommended,
}: {
  product: Product;
  recommended: Product[];
}) {
  const [size, setSize] = useState("");
  const [color, setColor] = useState(product.colors[0] || product.color);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [openDetail, setOpenDetail] = useState("Details & care");
  const { addToCart, favorites, toggleFavorite, registerProducts, cartHydrated } = useStore();
  useEffect(() => {
    registerProducts([product, ...recommended]);
  }, [product, recommended, registerProducts]);
  const selectedVariant = selectVariant(product, size, color);
  const displayedPrice = selectedVariant?.price ?? product.price;
  const isDemo = product.dataSource === "local";
  const displaySizes = isDemo ? product.candidateSizes : product.sizes;
  const canAdd = isDemo
    ? canAddDemoProduct(product, quantity, { size, color })
    : canAddVariant(product, selectedVariant, quantity);
  const add = () => {
    setError(
      addToCart(product, selectedVariant, quantity, { size, color }) || "",
    );
  };
  return (
    <>
      <div className="product-page grid grid-cols-[minmax(0,_1.2fr)_minmax(350px,_0.8fr)] gap-[5%] p-[20px_3.3%_100px] max-[800.01px]:grid-cols-[1fr] max-[800.01px]:gap-[20px] max-[800.01px]:p-[15px_0_70px]">
        <ProductGallery images={product.images} name={product.name} />
        <div className="product-detail sticky top-[73px] [align-self:start] max-h-[calc(100dvh_-_89px)] [overflow-y:auto] [scrollbar-width:thin] p-[25px_4%_0_0] max-w-[570px] [&_h1]:[font-family:var(--serif)] [&_h1]:[font-size:clamp(35px,_3.5vw,_55px)] [&_h1]:[font-weight:var(--font-weight-normal,_400)] [&_h1]:leading-[1.06] [&_h1]:m-[9px_0_17px] max-[800.01px]:static max-[800.01px]:max-h-[none] max-[800.01px]:[overflow-y:visible] max-[800.01px]:p-[20px_23px] max-[800.01px]:max-w-[none] max-[800.01px]:[&_h1]:[font-size:43px] max-[520.01px]:[&_h1]:[font-size:40px]">
          <div className="breadcrumbs [font-size:11px] [color:#98938f] leading-[1.7] mb-[34px] [&_>_a]:[text-decoration:underline] [&_>_a]:[text-underline-offset:3px]">
            <Link href="/">Home</Link> /{" "}
            <Link href={`/collections/${product.category}`}>
              {categoryNames[product.category]}
            </Link>{" "}
            / {product.name}
          </div>
          {product.badge && (
            <span className="detail-badge [font-size:10px] tracking-[0.13em] [color:#ba2222]">
              {product.badge}
            </span>
          )}
          <h1>{product.name}</h1>
          <p className="detail-price [font-size:18px] mb-[28px]">
            {formatPrice(displayedPrice)}
          </p>
          <p className="detail-description [font-size:13px] leading-[1.9] [color:#797672] mb-[35px]">
            {product.description}
          </p>
          <p className="detail-color m-[0_0_30px] [font-size:12px] [&_b]:[font-size:11px] [&_b]:tracking-[0.1em]">
            <b>COLOR:</b> {color}
            {product.colors.length > 1 && (
              <span className="ml-3 inline-flex gap-2">
                {product.colors.map((option) => (
                  <button
                    type="button"
                    key={option}
                    aria-pressed={color === option}
                    className="border border-[#dedbd6] px-2 py-1 aria-pressed:border-[#252525]"
                    onClick={() => {
                      setColor(option);
                      setSize("");
                      setError("");
                    }}
                  >
                    {option}
                  </button>
                ))}
              </span>
            )}
          </p>
          {product.requiresPriceVerification && (
            <p className="catalog-notice p-[14px] bg-[#f4f1eb] text-[13px]">
              Demo price estimate in BDT - awaiting verification. Not an
              official supplier or checkout price.
            </p>
          )}
          {!product.sizes.length && !product.variants.length && (
            <p className="catalog-notice p-[14px] [background:#f4f1eb] [font-size:13px]">
              Demo sizing preview. Final size and availability require
              confirmation.
            </p>
          )}
          <div className="detail-size-heading [&_b]:[font-size:11px] [&_b]:tracking-[0.1em] flex justify-between items-center mb-[14px] [&_button]:[font-size:11px] [&_button]:[text-decoration:underline]">
            <b>{isDemo ? "SIZE (DEMO PREVIEW)" : "SELECT SIZE"}</b>
            <button onClick={() => setError("Size guide coming soon.")}>
              Size guide
            </button>
          </div>
          <div className="detail-sizes grid grid-cols-[repeat(5,_1fr)] gap-[8px] mb-[10px] [&_button]:[border:1px_solid_#dedbd6] [&_button]:p-[13px_5px] [&_button]:[font-size:12px] [&_button.selected-size]:[background:#252525] [&_button.selected-size]:[color:#fff] [&_button.selected-size]:[border-color:#252525]">
            {displaySizes.map((option) => (
              <button
                className={size === option ? "selected-size" : ""}
                key={option}
                onClick={() => {
                  setSize(option);
                  setError("");
                }}
                disabled={
                  !isDemo &&
                  !product.variants.some(
                    (v) =>
                      v.active &&
                      v.size === option &&
                      (!v.color || v.color === color) &&
                      v.availableStock !== null &&
                      v.availableStock > 0,
                  )
                }
                aria-pressed={size === option}
              >
                {option}
              </button>
            ))}
          </div>
          {error && (
            <p className="size-error [font-size:11px] [color:#b22]">{error}</p>
          )}
          <div className="detail-actions flex gap-[9px] items-stretch m-[22px_0] [&_.add-bag]:[flex:1] max-[520.01px]:[&_.dark-button]:p-[14px_6px] max-[520.01px]:[&_.dark-button]:[font-size:10px]">
            <div className="detail-quantity flex gap-[16px] items-center [border:1px_solid_#ccc] p-[0_13px] [&_button]:p-[0] [&_button]:grid [&_button]:[place-items:center] max-[520.01px]:gap-[9px]">
              <button
                aria-label="Decrease"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Icon name="minus" size={15} />
              </button>
              {quantity}
              <button
                aria-label="Increase"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              >
                <Icon name="plus" size={15} />
              </button>
            </div>
            <button
              className="dark-button [background:#222321] [color:white] inline-flex items-center justify-center p-[16px_21px] [font-size:11px] [font-weight:var(--font-weight-bold,_700)] tracking-[0.09em] text-center [border:1px_solid_#222321] [transition:background_0.2s] [&:hover]:[background:#484b48] add-bag [&:disabled]:opacity-[0.55] [&:disabled]:cursor-not-allowed"
              disabled={!canAdd || !cartHydrated}
              onClick={add}
            >
              {displayedPrice === null
                ? "PRICE ON REQUEST"
                : isDemo
                  ? `ADD TO BAG - ${formatPrice((displayedPrice ?? 0) * quantity)}`
                  : !product.mappingVerified || !product.variants.length
                    ? "AVAILABILITY COMING SOON"
                    : !selectedVariant
                      ? "SELECT SIZE & COLOR"
                      : !canAdd
                        ? "CURRENTLY UNAVAILABLE"
                        : `ADD TO BAG - ${formatPrice((displayedPrice ?? 0) * quantity)}`}
            </button>
            <button
              className="detail-save [border:1px_solid_#ccc] p-[0_16px] max-[520.01px]:p-[0_9px]"
              aria-label="Save item"
              aria-pressed={favorites.includes(product.id)}
              onClick={() => toggleFavorite(product.id)}
            >
              <Icon
                name="bookmark"
                size={21}
                fill={favorites.includes(product.id) ? "currentColor" : "none"}
              />
            </button>
          </div>
          <p className="detail-delivery flex items-start gap-[11px] [color:#77736f] [font-size:12px] leading-[1.6] m-[0_0_35px] [&_svg]:[flex-shrink:0]">
            <Icon name="truck" size={18} /> Delivery available across
            Bangladesh. Demo product — no payment is processed.
          </p>
          <div className="detail-accordions [&_>_div]:[border-top:1px_solid_#e1dfdb] [&_>_div:last-child]:[border-bottom:1px_solid_#e1dfdb] [&_button]:p-[20px_0] [&_button]:w-[100%] [&_button]:flex [&_button]:justify-between [&_button]:items-center [&_button]:[font-weight:var(--font-weight-semibold,_600)] [&_button]:[font-size:12px] [&_p]:leading-[1.8] [&_p]:[color:#797672] [&_p]:pb-[20px] [&_p]:[font-size:12px] [&_p]:max-w-[480px]">
            {[
              [
                "Details & care",
                `${product.description} Fabric composition and care instructions are awaiting confirmation.`,
              ],
              [
                "Delivery & returns",
                "Delivery pricing and return terms will be configured when the store is connected to real services.",
              ],
              [
                "About Aura BOED",
                "A contemporary label for modern wardrobes and timeless design.",
              ],
            ].map(([title, description]) => (
              <div key={title}>
                <button
                  onClick={() =>
                    setOpenDetail(openDetail === title ? "" : title)
                  }
                >
                  {title}
                  <Icon
                    name={openDetail === title ? "minus" : "plus"}
                    size={18}
                  />
                </button>
                {openDetail === title && <p>{description}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
      {recommended.length > 0 && (
        <section className="recommended-section pt-[45px] pb-[110px] [&_.section-heading]:mb-[25px] [&_h2]:[font-size:45px] max-[520.01px]:[&_h2]:[font-size:35px] section-gutter pl-[26px] pr-[26px] max-[520.01px]:pl-[12px] max-[520.01px]:pr-[12px]">
          <div className="section-heading [&_h2]:[font-family:var(--serif)] [&_h2]:[font-size:clamp(36px,_4vw,_55px)] [&_h2]:[font-weight:var(--font-weight-normal,_400)] [&_h2]:leading-[1.12] [&_h2]:m-[0] flex items-end justify-between mb-[28px] gap-[18px] [&_.eyebrow]:mb-[10px] max-[520.01px]:items-start max-[520.01px]:[&_h2]:[font-size:35px] max-[520.01px]:[&_.text-link]:[font-size:9px] max-[520.01px]:[&_.text-link]:mt-[10px]">
            <h2>You may also like</h2>
            <Link
              className="text-link inline-flex items-center gap-[12px] [font-size:11px] tracking-[0.11em] [font-weight:var(--font-weight-bold,_700)] whitespace-nowrap pb-[9px] [&:hover]:[text-decoration:underline] [&:hover]:[text-underline-offset:5px]"
              href={`/collections/${product.category}`}
            >
              VIEW COLLECTION <Icon name="arrow-right" size={17} />
            </Link>
          </div>
          <div className="home-product-grid grid grid-cols-[repeat(4,_minmax(0,_1fr))] gap-[12px] max-[800.01px]:grid-cols-[repeat(2,_minmax(0,_1fr))] max-[800.01px]:gap-[10px] max-[520.01px]:gap-[6px]">
            {recommended.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
