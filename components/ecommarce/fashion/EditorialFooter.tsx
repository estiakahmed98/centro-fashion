"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

const categories = [
  { title: "CLOTHING", links: [["Jackets", "jackets"], ["Suits", "suits"], ["Trousers", "trousers"], ["Classic Shirts", "classic-shirts"], ["Casual Shirts", "casual-shirts"], ["Outerwear", "outerwear"], ["Tuxedo / Eveningwear", "tuxedos-eveningwear"], ["Swimwear / Beach Towels", "swimwear"], ["Knitwear", "knitwear"], ["Waistcoats", "waistcoats"]] },
  { title: "ACCESSORIES", links: [["Shoes", "shoes"], ["Ties", "ties"], ["Pocket Squares", "pocket-squares"], ["Socks", "socks"], ["Leather goods", "leather-goods"], ["Hats & Beanies", "hats-beanies"], ["Gloves", "gloves"], ["Cufflinks", "cufflinks"], ["Sunglasses", "sunglasses"], ["Cozy at home", "homewear"]] },
];
const information = [
  { title: "CUSTOMER SERVICE", links: [["Shipping & Returns", "/ecommerce/shipping"], ["Make a Return", "/ecommerce/returns"], ["Account", "/ecommerce/user"], ["My orders", "/ecommerce/user/orders"], ["F.A.Q.", "/ecommerce/faq"], ["Contact Us", "/ecommerce/contact"]] },
  { title: "COMPANY", links: [["About us", "/ecommerce/about"], ["Blog", "/ecommerce/blogs"], ["Wholesale / Franchising", "/ecommerce/contact"], ["Terms & Conditions", "/ecommerce/terms"], ["Privacy Policy", "/ecommerce/privacy"]] },
];
const icons = { Facebook, Instagram, YouTube: Youtube, X: Twitter };

export function EditorialFooter({ socials }: { socials: Array<{ name: string; href: string }> }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/newsletter/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!response.ok) throw new Error("Please try again.");
      setMessage("Thank you. You’re on the list."); setEmail("");
    } catch { setMessage("We couldn’t subscribe you. Please try again shortly."); }
    finally { setBusy(false); }
  }
  return <footer className="editorial-footer">
    <div className="editorial-service-strip"><div><strong>CONSIDERED QUALITY</strong><span>Thoughtful pieces. Distinctive details.</span></div><div><strong>DELIVERY ACROSS BANGLADESH</strong><Link href="/ecommerce/shipping">Explore our delivery options</Link></div><div><strong>RETURNS & EXCHANGES</strong><Link href="/ecommerce/returns">Find the right fit for you</Link></div></div>
    <div className="editorial-footer-watermark" aria-hidden="true">AURA BOED</div>
    <div className="editorial-footer-main"><nav className="editorial-footer-columns" aria-label="Footer navigation">{categories.map(column => <div key={column.title}><h3>{column.title}</h3>{column.links.map(([label, slug]) => <Link key={label} href={`/ecommerce/products?category=${slug}`}>{label}</Link>)}</div>)}{information.map(column => <div key={column.title}><h3>{column.title}</h3>{column.links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</div>)}</nav>
      <section className="editorial-newsletter" aria-labelledby="editorial-newsletter-title"><h3>STAY INFORMED WITH AURA BOED</h3><h4 id="editorial-newsletter-title">Newsletter</h4><p>Join our newsletter to be the first informed about new arrivals, restocks, promotions and more.</p><form onSubmit={subscribe}><label className="sr-only" htmlFor="editorial-newsletter-email">Email address</label><input id="editorial-newsletter-email" type="email" autoComplete="email" placeholder="Email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} /><button type="submit" disabled={busy}>{busy ? "SUBSCRIBING…" : "SUBSCRIBE"}</button></form><p>By signing up, you agree to receive our emails. You can unsubscribe at any time. See our <Link href="/ecommerce/privacy">privacy policy</Link>.</p><p role="status" aria-live="polite">{message}</p></section>
    </div>
    <div className="editorial-footer-utility"><div className="editorial-footer-socials">{socials.map(social => { const SocialIcon = icons[social.name as keyof typeof icons]; return SocialIcon ? <a key={social.name} href={social.href} aria-label={social.name} target="_blank" rel="noreferrer"><SocialIcon size={16} /></a> : null; })}</div><div className="editorial-footer-region"><span>Delivery in</span><span>Bangladesh (BDT)</span></div></div>
    <div className="editorial-footer-bottom"><span>© {new Date().getFullYear()} – Aura BOED</span><Link href="/ecommerce/privacy">Privacy & cookies</Link><div className="editorial-footer-payments"><span>Payment methods</span><div aria-label="Payment method brands">{["SSLCOMMERZ", "bKash", "Nagad", "EPS", "AMEX", "Apple Pay", "Google Pay", "Mastercard", "PayPal", "Shop Pay", "VISA"].map(payment => <span className={`editorial-payment editorial-payment-${payment.toLowerCase().replaceAll(" ", "-")}`} key={payment} role="img" aria-label={payment} title={payment}>{payment === "Mastercard" ? <span className="editorial-mastercard-circles" aria-hidden="true"><i /><i /></span> : payment}</span>)}</div></div></div>
  </footer>;
}
