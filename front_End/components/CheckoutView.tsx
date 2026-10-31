"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useStore } from "./StoreProvider";
import { Icon } from "./Icons";
import { formatPrice } from "@/lib/products";
import {
  cartLineUnitPrice,
  canUpdateCartLine,
  demoDeliveryFee,
} from "@/lib/commerce-cart";

const inputClass =
  "mt-2 w-full rounded-none border border-[#dcd9d3] bg-white px-3 py-3 text-[13px] outline-offset-4 focus:border-[#343731]";
const buttonClass =
  "inline-flex min-h-12 items-center justify-center gap-4 bg-[#232321] px-6 py-4 text-[11px] font-semibold tracking-[0.1em] text-white transition-colors hover:bg-[#45483f] disabled:cursor-not-allowed disabled:opacity-50";
type Delivery = {
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  postalCode: string;
};

export function CheckoutView() {
  const {
    cart,
    cartSubtotal,
    cartHydrated,
    catalogue,
    updateQuantity,
    removeFromCart,
    clearDemoCart,
  } = useStore();
  const [step, setStep] = useState<"delivery" | "review">("delivery");
  const [delivery, setDelivery] = useState<Delivery>({
    name: "",
    email: "",
    phone: "",
    address: "",
    district: "",
    postalCode: "",
  });
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{
    reference: string;
    total: number;
    count: number;
  } | null>(null);
  const shipping = delivery.district.trim()
    ? demoDeliveryFee(
        delivery.district.trim().toLowerCase() === "dhaka" ? "Dhaka" : "Other",
      )
    : 0;
  const total = cartSubtotal + shipping;

  if (!cartHydrated)
    return (
      <div role="status" className="px-6 py-24 text-center text-[var(--muted)]">
        Loading your bag...
      </div>
    );
  if (receipt)
    return (
      <section
        className="mx-auto max-w-2xl px-6 py-24 text-center"
        role="status"
      >
        <span className="mx-auto mb-6 grid size-14 place-items-center rounded-full bg-[#edf3eb] text-[#486143]">
          <Icon name="check" size={26} />
        </span>
        <p className="text-[10px] tracking-[0.2em] text-[#85877a]">
          AURA BOED / DEMO CHECKOUT
        </p>
        <h1 className="text-5xl font-normal [font-family:var(--serif)]">
          Demo checkout complete
        </h1>
        <p className="leading-7 text-[var(--muted)]">
          Your checkout preview is complete. No real order has been placed and
          no payment has been collected.
        </p>
        <div className="my-8 border-y border-[#e8e7e5] py-6 text-sm">
          <p>Reference: {receipt.reference}</p>
          <p>
            {receipt.count} item{receipt.count === 1 ? "" : "s"} /{" "}
            {formatPrice(receipt.total)} estimated
          </p>
        </div>
        <Link href="/collections/suits" className={buttonClass}>
          CONTINUE SHOPPING <Icon name="arrow-right" size={16} />
        </Link>
      </section>
    );
  if (!cart.length)
    return (
      <section className="px-6 py-24 text-center">
        <h1 className="text-5xl font-normal [font-family:var(--serif)]">
          Your bag is empty
        </h1>
        <p className="mb-8 text-[var(--muted)]">
          Add a piece to your bag to start checkout.
        </p>
        <Link className={buttonClass} href="/collections/suits">
          EXPLORE THE COLLECTION
        </Link>
      </section>
    );
  if (
    catalogue.dataSource !== "local" ||
    cart.some((line) => !line.isDemo || line.dataSource !== "local")
  )
    return (
      <section className="px-6 py-24 text-center">
        <h1 className="text-4xl [font-family:var(--serif)]">
          Checkout is not available yet
        </h1>
        <p className="text-[var(--muted)]">
          Live checkout requires verified backend mapping and server cart
          synchronization.
        </p>
        <Link href="/" className={buttonClass}>
          BACK TO HOME
        </Link>
      </section>
    );

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\+?[\d ()-]{8,20}$/.test(delivery.phone.trim())) {
      setError("Enter a valid phone number.");
      return;
    }
    if (
      [delivery.name, delivery.address, delivery.district].some(
        (value) => !value.trim(),
      )
    ) {
      setError("Complete your name and delivery address.");
      return;
    }
    setError("");
    setStep("review");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function completeDemo() {
    if (
      !cart.length ||
      cart.some(
        (line) => !line.isDemo || !canUpdateCartLine(line, line.quantity),
      )
    ) {
      setError(
        "Your bag has changed. Please check the quantities and try again.",
      );
      return;
    }
    setReceipt({
      reference: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      total,
      count: cart.reduce((sum, line) => sum + line.quantity, 0),
    });
    clearDemoCart();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <section className="mx-auto max-w-[1220px] px-6 py-12 sm:px-10 sm:py-16">
      <Link
        href="/collections/suits"
        className="inline-flex items-center gap-2 text-[11px] text-[#787775]"
      >
        <Icon name="arrow-left" size={14} /> CONTINUE SHOPPING
      </Link>
      <div className="mb-10 mt-7 border-b border-[#e8e7e5] pb-8">
        <p className="text-[10px] tracking-[0.2em] text-[#85877a]">
          AURA BOED / CHECKOUT
        </p>
        <h1 className="mb-5 text-5xl font-normal [font-family:var(--serif)] sm:text-6xl">
          A considered choice.
        </h1>
        <ol className="flex gap-6 text-[11px] tracking-wide">
          <li
            aria-current={step === "delivery" ? "step" : undefined}
            className={
              step === "delivery"
                ? "font-semibold text-[#232321]"
                : "text-[#787775]"
            }
          >
            01 DELIVERY
          </li>
          <li
            aria-current={step === "review" ? "step" : undefined}
            className={
              step === "review"
                ? "font-semibold text-[#232321]"
                : "text-[#787775]"
            }
          >
            02 REVIEW
          </li>
          <li className="text-[#96968d]">03 CONFIRMATION</li>
        </ol>
      </div>
      <div className="mb-8 border border-[#e5e0d5] bg-[#f7f5ef] px-5 py-4 text-xs leading-6">
        Demo checkout. Product options, prices and delivery charges are
        estimates. No real order or payment will be submitted.
      </div>
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          {step === "delivery" ? (
            <form onSubmit={review} className="space-y-7">
              <h2 className="text-3xl font-normal [font-family:var(--serif)]">
                Delivery details
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {(
                  [
                    {
                      key: "name",
                      label: "Full name",
                      type: "text",
                      autoComplete: "name",
                      required: true,
                    },
                    {
                      key: "email",
                      label: "Email address",
                      type: "email",
                      autoComplete: "email",
                      required: false,
                    },
                    {
                      key: "phone",
                      label: "Phone number",
                      type: "tel",
                      autoComplete: "tel",
                      required: true,
                    },
                  ] as const
                ).map((field) => (
                  <label key={field.key} className="block text-xs">
                    {field.label}
                    {field.required ? " *" : " (optional)"}
                    <input
                      className={inputClass}
                      name={field.key}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      required={field.required}
                      maxLength={field.key === "phone" ? 20 : 120}
                      value={delivery[field.key]}
                      onChange={(event) =>
                        setDelivery((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
              <label className="block text-xs">
                Street address *
                <textarea
                  name="address"
                  autoComplete="street-address"
                  required
                  maxLength={500}
                  rows={3}
                  className={inputClass}
                  value={delivery.address}
                  onChange={(event) =>
                    setDelivery((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-xs">
                  District / City *
                  <input
                    name="district"
                    autoComplete="address-level2"
                    required
                    maxLength={100}
                    className={inputClass}
                    value={delivery.district}
                    onChange={(event) =>
                      setDelivery((current) => ({
                        ...current,
                        district: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="block text-xs">
                  Postal code (optional)
                  <input
                    name="postalCode"
                    autoComplete="postal-code"
                    maxLength={12}
                    className={inputClass}
                    value={delivery.postalCode}
                    onChange={(event) =>
                      setDelivery((current) => ({
                        ...current,
                        postalCode: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Country: Bangladesh. Demo delivery estimate: BDT 80 in Dhaka,
                BDT 150 elsewhere.
              </p>
              {error && (
                <p role="alert" className="text-xs text-[#9e3430]">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className={`${buttonClass} w-full sm:w-auto`}
              >
                REVIEW CHECKOUT <Icon name="arrow-right" size={16} />
              </button>
            </form>
          ) : (
            <div className="space-y-7">
              <h2 className="text-3xl font-normal [font-family:var(--serif)]">
                Review your details
              </h2>
              <div className="border border-[#e8e7e5] p-6 text-sm leading-7">
                <p className="font-semibold">{delivery.name}</p>
                <p className="whitespace-pre-line">{delivery.address}</p>
                <p>
                  {delivery.district}
                  {delivery.postalCode ? `, ${delivery.postalCode}` : ""},
                  Bangladesh
                </p>
                <p>{delivery.phone}</p>
                {delivery.email && <p>{delivery.email}</p>}
                <button
                  type="button"
                  className="mt-3 text-xs underline underline-offset-4"
                  onClick={() => {
                    setStep("delivery");
                    setError("");
                  }}
                >
                  Edit delivery details
                </button>
              </div>
              <div className="border border-[#e8e7e5] p-6">
                <h3 className="text-xs font-semibold tracking-wide">
                  PAYMENT METHOD
                </h3>
                <p className="mb-0 text-sm text-[var(--muted)]">
                  Cash on delivery - demo preview only
                </p>
              </div>
              {error && (
                <p role="alert" className="text-xs text-[#9e3430]">
                  {error}
                </p>
              )}
              <button
                type="button"
                className={`${buttonClass} w-full`}
                onClick={completeDemo}
              >
                COMPLETE DEMO CHECKOUT <Icon name="check" size={16} />
              </button>
            </div>
          )}
        </div>
        <aside className="border border-[#e8e7e5] bg-[#fafaf8] p-6 lg:sticky lg:top-24">
          <h2 className="mb-7 text-3xl font-normal [font-family:var(--serif)]">
            Your bag
          </h2>
          <div className="space-y-6">
            {cart.map((line) => (
              <div key={line.key} className="flex gap-4">
                <Link
                  href={`/products/${line.productSlug}`}
                  className="w-20 shrink-0"
                >
                  <img
                    className="aspect-[3/4] w-full object-cover"
                    src={line.product.image}
                    alt={line.product.name}
                  />
                </Link>
                <div className="min-w-0 flex-1 text-xs">
                  <Link
                    className="leading-5"
                    href={`/products/${line.productSlug}`}
                  >
                    {line.product.name}
                  </Link>
                  <p className="my-2 text-[#85877a]">
                    {line.size} / {line.color} / Demo
                  </p>
                  <p>{formatPrice(cartLineUnitPrice(line))}</p>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center border border-[#dcd9d3]">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        className="size-7"
                        onClick={() =>
                          updateQuantity(line.key, line.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span className="min-w-6 text-center">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        className="size-7"
                        onClick={() =>
                          updateQuantity(line.key, line.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-[10px] text-[#85877a] underline"
                      type="button"
                      onClick={() => removeFromCart(line.key)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <dl className="mb-0 mt-7 space-y-4 border-t border-[#e8e7e5] pt-6 text-xs">
            <div className="flex justify-between">
              <dt>Subtotal estimate</dt>
              <dd className="m-0">{formatPrice(cartSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Demo delivery estimate</dt>
              <dd className="m-0">
                {delivery.district.trim()
                  ? formatPrice(shipping)
                  : "Enter district"}
              </dd>
            </div>
            <div className="flex justify-between border-t border-[#e8e7e5] pt-4 text-sm font-semibold">
              <dt>Estimated total</dt>
              <dd className="m-0">{formatPrice(total)}</dd>
            </div>
          </dl>
          <p className="mb-0 mt-5 text-[10px] leading-5 text-[#85877a]">
            Final pricing, availability and shipping must be confirmed before
            any real purchase.
          </p>
        </aside>
      </div>
    </section>
  );
}
