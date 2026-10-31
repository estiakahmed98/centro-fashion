"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useCart } from "@/components/ecommarce/CartContext";
import { useStorefrontSettings } from "@/providers/storefront-settings-provider";

export function EditorialBag({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { formatCurrency } = useStorefrontSettings();
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [open]);
  return <dialog ref={dialog} className="editorial-bag" aria-labelledby="editorial-bag-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="editorial-bag-inner"><div className="editorial-bag-heading"><h2 id="editorial-bag-title">Your shopping bag</h2><button type="button" aria-label="Close shopping bag" onClick={onClose}><X size={20} /></button></div>
      <div className="editorial-bag-items">{cartItems.length ? cartItems.map(item => <article key={item.id} className="editorial-bag-item"><img src={item.image || "/placeholder.svg"} alt={item.name} /><div><Link href={`/ecommerce/products/${item.productId}`} onClick={onClose}>{item.name}</Link><p>{item.variantLabel}</p><p>{formatCurrency(item.price)}</p><div className="editorial-bag-quantity"><button type="button" aria-label={`Decrease ${item.name} quantity`} disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button><span>{item.quantity}</span><button type="button" aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= 99} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button><button type="button" className="editorial-bag-remove" onClick={() => removeFromCart(item.id)}>Remove</button></div></div></article>) : <p className="editorial-bag-empty">Your bag is waiting for something special.</p>}</div>
      <div className="editorial-bag-bottom"><div><span>SUBTOTAL</span><span>{formatCurrency(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span></div><p>Shipping and any applicable discounts are calculated at checkout.</p>{cartItems.length ? <Link className="editorial-bag-checkout" href="/ecommerce/checkout" onClick={onClose}>PROCEED TO CHECKOUT</Link> : null}<Link href="/ecommerce/products" onClick={onClose}>CONTINUE EXPLORING</Link></div>
    </div>
  </dialog>;
}
