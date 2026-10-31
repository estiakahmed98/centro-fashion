"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { cartLineUnitPrice } from "@/lib/commerce-cart";
import { formatPrice } from "@/lib/products";
import { Icon } from "./Icons";
import { useStore } from "./StoreProvider";

export function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartError,
  } = useStore();
  useEffect(() => {
    if (!cartOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [cartOpen, setCartOpen]);
  return (
    <>
      {cartOpen && (
        <button
          type="button"
          aria-label="Close bag"
          className="drawer-backdrop fixed inset-[0] w-[100%] h-[100%] [background:#0007] z-[90] cursor-default"
          onClick={() => setCartOpen(false)}
        />
      )}
      <aside
        className={`side-drawer fixed right-[0] top-[0] bottom-[0] w-[min(480px,_100vw)] h-[100dvh] [background:#fff] z-[95] [transform:translateX(105%)] [transition:transform_0.3s_ease] flex flex-col [box-shadow:-5px_0_20px_#00000012] [&.drawer-active]:[transform:translateX(0)] ${cartOpen ? "drawer-active" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        aria-hidden={!cartOpen}
      >
        <div className="drawer-head flex items-center justify-between p-[24px_25px] [border-bottom:1px_solid_var(--line)] [flex:0_0_auto] [&_h2]:[font-size:19px] [&_h2]:[font-weight:var(--font-weight-medium,_500)] [&_h2]:m-[0] [&_button]:flex [&_button]:items-center [&_button]:justify-center">
          <h2>
            Your bag ({cart.reduce((count, item) => count + item.quantity, 0)})
          </h2>
          <button aria-label="Close bag" onClick={() => setCartOpen(false)}>
            <Icon name="close" size={23} />
          </button>
        </div>
        {cartError && (
          <p role="alert" className="px-6 text-xs text-[#9e3430]">
            {cartError}
          </p>
        )}
        {cart.length === 0 ? (
          <div className="empty-bag flex flex-col items-center text-center justify-center p-[65px_30px] gap-[10px] [flex:1] [&_h3]:[font-family:var(--serif)] [&_h3]:[font-size:32px] [&_h3]:[font-weight:var(--font-weight-normal,_400)] [&_h3]:m-[8px_0_0] [&_p]:[font-size:13px] [&_p]:[color:var(--muted)] [&_p]:leading-[1.7] [&_p]:mb-[15px]">
            <Icon name="bag" size={36} />
            <h3>Your bag is empty</h3>
            <p>Discover the pieces that speak to your style.</p>
            <Link
              href="/collections/suits"
              onClick={() => setCartOpen(false)}
              className="dark-button [background:#222321] [color:white] inline-flex items-center justify-center p-[16px_21px] [font-size:11px] [font-weight:var(--font-weight-bold,_700)] tracking-[0.09em] text-center [border:1px_solid_#222321] [transition:background_0.2s] [&:hover]:[background:#484b48]"
            >
              EXPLORE THE COLLECTION
            </Link>
          </div>
        ) : (
          <>
            <div className="drawer-items p-[22px] [overflow-y:auto] [flex:1]">
              {cart.map((item) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <div
                    className="drawer-item flex gap-[15px] mb-[25px] [&_>_a_img]:w-[105px] [&_>_a_img]:h-[137px] [&_>_a_img]:object-cover"
                    key={item.key}
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setCartOpen(false)}
                    >
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <span>Image coming soon</span>
                      )}
                    </Link>
                    <div className="drawer-item-info flex flex-col items-start gap-[10px] [font-size:12px] [flex:1] [&_>_a]:[font-weight:var(--font-weight-semibold,_600)] [&_>_a]:leading-[1.5] [&_>_span]:[color:#817d79]">
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={() => setCartOpen(false)}
                      >
                        {product.name}
                      </Link>
                      <span>
                        Size: {item.size} · {item.color}
                      </span>
                      <span>
                        {formatPrice(cartLineUnitPrice(item))}
                        {item.isDemo && <small className="ml-2">DEMO</small>}
                      </span>
                      <div className="qty-controls flex items-center [border:1px_solid_#ddd] h-[31px] mt-[3px] [&_button]:w-[29px] [&_button]:h-[28px] [&_button]:grid [&_button]:[place-items:center] [&_strong]:[font-weight:var(--font-weight-medium,_500)] [&_strong]:p-[0_7px]">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                        >
                          <Icon name="minus" size={14} />
                        </button>
                        <strong>{item.quantity}</strong>
                        <button
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                        >
                          <Icon name="plus" size={14} />
                        </button>
                      </div>
                      <button
                        className="remove-item [text-decoration:underline] [color:#888] [font-size:11px]"
                        onClick={() => removeFromCart(item.key)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="drawer-footer p-[20px_25px_25px] [border-top:1px_solid_var(--line)] [&_>_div]:flex [&_>_div]:justify-between [&_>_div]:[font-weight:var(--font-weight-semibold,_600)] [&_p]:[font-size:11px] [&_p]:[color:#8d8a86] [&_p]:leading-[1.7] [&_p]:m-[15px_0] [&_.dark-button]:w-[100%]">
              <div>
                <span>SUBTOTAL</span>
                <strong>{formatPrice(cartSubtotal)}</strong>
              </div>
              <p>Shipping calculated at checkout. This is a showcase demo.</p>
              <button
                className="dark-button [background:#222321] [color:white] inline-flex items-center justify-center p-[16px_21px] [font-size:11px] [font-weight:var(--font-weight-bold,_700)] tracking-[0.09em] text-center [border:1px_solid_#222321] [transition:background_0.2s] [&:hover]:[background:#484b48]"
                onClick={() => {
                  setCartOpen(false);
                  router.push("/checkout");
                }}
              >
                PROCEED TO CHECKOUT
              </button>
              <button
                className="secondary-button text-center block w-[100%] p-[16px]"
                onClick={() => setCartOpen(false)}
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
