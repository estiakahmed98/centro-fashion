"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/ecommarce/CartContext";
import { useStorefrontSettings } from "@/providers/storefront-settings-provider";
import type { ProductPurchaseData } from "@/lib/product-purchase";
import { ProductGallery } from "./ProductGallery";
import ProductViewTracker from "@/components/analytics/ProductViewTracker";
import { toGA4Item } from "@/lib/analytics/ecommerce";

function optionsOf(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, value]) => key !== "__meta" && typeof value === "string")) as Record<string, string>;
}

export function EditorialPurchase({ product, category, description }: { product: ProductPurchaseData; category: string; description: React.ReactNode }) {
  const { addToCart, getQuantityByProductId, cartHydrated } = useCart();
  const { formatCurrency } = useStorefrontSettings();
  const router = useRouter();
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const variants = product.variants.filter(variant => variant.active);
  const needsReview = variants.some(variant => {
    if (!variant.options || typeof variant.options !== "object" || !("__meta" in variant.options)) return false;
    const metadata = variant.options.__meta;
    return metadata && typeof metadata === "object" && ("requiresPriceVerification" in metadata && metadata.requiresPriceVerification || "requiresStockVerification" in metadata && metadata.requiresStockVerification || "requiresSizeVerification" in metadata && metadata.requiresSizeVerification);
  });
  const groups = new Map<string, Set<string>>();
  for (const variant of variants) for (const [key, value] of Object.entries(optionsOf(variant.options))) {
    const values = groups.get(key) || new Set<string>(); values.add(value); groups.set(key, values);
  }
  const complete = [...groups.keys()].every(key => Boolean(selection[key]));
  const variant = complete ? variants.find(item => Object.entries(selection).every(([key, value]) => optionsOf(item.options)[key] === value)) : undefined;
  const stock = Math.max(0, (variant?.stock ?? 0) - (variant ? getQuantityByProductId(product.id, variant.id) : 0));
  const price = variant?.price ?? product.basePrice;
  const canBuy = Boolean(cartHydrated && variant && quantity <= stock);
  const add = async (checkout: boolean) => {
    if (!variant || !canBuy || busy) return;
    setBusy(true); setMessage("");
    try {
      const added = await addToCart(product.id, quantity, variant.id);
      if (added) { setMessage("Added to your shopping bag."); if (checkout) router.push("/ecommerce/checkout"); }
      else setMessage("Unable to add this piece. Check availability and try again.");
    } catch { setMessage("Unable to add this piece. Please try again."); }
    finally { setBusy(false); }
  };
  return <section className="editorial-product">
    <ProductViewTracker currency={product.currency} item={toGA4Item({ id: product.id, name: product.name, price, categoryName: category, variantId: variant?.id })} />
    <ProductGallery name={product.name} images={[...new Set([product.image, ...product.gallery].filter((image): image is string => Boolean(image)))]} />
    <div className="editorial-product-copy"><nav className="text-[11px] text-stone-500" aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/ecommerce/products">{category}</Link></nav><h1>{product.name}</h1><div className="editorial-product-price">{formatCurrency(price)}</div>
      {needsReview ? <p className="editorial-notice">Imported collection: price, availability and sizing require verification before sale.</p> : null}
      {[...groups].map(([key, values]) => <fieldset key={key} className="editorial-options"><legend>{key.toUpperCase()}: {selection[key] || "Select"}</legend><div>{[...values].map(value => <button key={value} type="button" aria-pressed={selection[key] === value} onClick={() => { setSelection(previous => ({ ...previous, [key]: value })); setMessage(""); }}>{value}</button>)}</div></fieldset>)}
      <div className="editorial-purchase-quantity"><span>QUANTITY</span><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(value => Math.max(1, value - 1))}>−</button><span aria-live="polite">{quantity}</span><button type="button" aria-label="Increase quantity" disabled={quantity >= Math.min(stock, 99)} onClick={() => setQuantity(value => Math.min(stock, 99, value + 1))}>+</button></div>
      <button type="button" className="editorial-buy-button" disabled={!canBuy || busy} onClick={() => void add(false)}>{!cartHydrated ? "LOADING…" : busy ? "ADDING…" : !complete ? "SELECT YOUR OPTIONS" : stock < 1 ? "CURRENTLY UNAVAILABLE" : "ADD TO CART"}</button>
      {canBuy ? <button type="button" disabled={busy} className="w-full pb-5 text-center text-[10px] underline underline-offset-4" onClick={() => void add(true)}>BUY NOW</button> : null}
      <p role="status" aria-live="polite">{message}</p>
      <details open><summary>Details & care</summary><div className="py-4 leading-7">{description}</div></details><details><summary>Delivery & returns</summary><p><Link href="/ecommerce/shipping">View delivery information</Link><br /><Link href="/ecommerce/returns">View our returns policy</Link></p></details>
    </div>
  </section>;
}
