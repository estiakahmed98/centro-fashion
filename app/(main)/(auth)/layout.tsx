import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, ShieldCheck, ShoppingBag } from "lucide-react";
import "./auth.css";

export const metadata: Metadata = { robots: { index: false, follow: false, googleBot: { index: false, follow: false } } };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="boed-auth">
    <aside className="boed-auth-story">
      <Link className="boed-auth-brand" href="/" aria-label="Aura BOED home"><span aria-hidden="true">A</span><img src="/AURA_BOED_Logo.svg" alt="Aura BOED" width="190" height="64" /></Link>
      <div className="boed-auth-story-copy"><span className="boed-auth-eyebrow">YOUR WORLD, CONSIDERED</span><h1>A little more personal.<br />A little more you.</h1><p>Your favourites, your orders and your everyday essentials. Together in one considered space.</p><div className="boed-auth-benefits"><div><Bookmark size={17} />Keep your favourite pieces close</div><div><ShoppingBag size={17} />Follow every order, effortlessly</div><div><ShieldCheck size={17} />A secure place to call your own</div></div></div>
      <div className="boed-auth-story-bottom"><Link href="/"><ArrowLeft size={13} />Back to storefront</Link><span>AURA BOED</span></div>
    </aside>
    <main className="boed-auth-main"><div className="boed-auth-content"><Link href="/" className="boed-auth-mobile-brand" aria-label="Aura BOED home"><img src="/AURA_BOED_Logo.svg" alt="Aura BOED" width="210" height="70" /></Link>{children}<p className="boed-auth-legal">By continuing, you agree to our <Link href="/ecommerce/terms">Terms & Conditions</Link> and <Link href="/ecommerce/privacy">Privacy Policy</Link>.</p></div></main>
  </div>;
}
