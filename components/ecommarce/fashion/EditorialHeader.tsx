"use client";

import Link from "next/link";
import Form from "next/form";
import { useState } from "react";
import { Bookmark, ChevronDown, LogOut, Menu, Search, ShoppingBag, UserRound, X, ArrowRight } from "lucide-react";
import type { CentroCategory } from "@/lib/centro-navigation";
import { useCart } from "@/components/ecommarce/CartContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";

export type MenuProduct = { id: number; slug: string; name: string; image: string | null };
type MenuName = "shop" | "company";
const collection = (slug: string) => `/ecommerce/collections/${slug}`;
const companyLinks = [
  ["About Centro", "/ecommerce/about"],
  ["History", "/ecommerce/history"],
  ["Leadership", "/ecommerce/leadership"],
  ["Design & production", "/ecommerce/process"],
  ["Sustainability", "/ecommerce/centro/sustainability"],
  ["Social responsibilities", "/ecommerce/centro/social-responsibilities"],
  ["Get in touch", "/ecommerce/contact"],
];

export function EditorialHeader({ highlights, categories, contactEmail, onOpenBag }: { highlights: MenuProduct[]; categories: CentroCategory[]; contactEmail?: string | null; onOpenBag: () => void }) {
  const { cartCount } = useCart();
  const { data: session } = useSession();
  const [activeMenu, setActiveMenu] = useState<MenuName | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const roots = categories.filter(item => item.showInHeader && (item.parentId === null || !categories.some(parent => parent.id === item.parentId && parent.showInHeader)));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const close = () => { setActiveMenu(null); setMobileOpen(false); setSearchOpen(false); };
  const preview = categories.find(item => item.id === previewId) || roots[0];
  const children = categories.filter(item => item.parentId === preview?.id && item.showInHeader);
  const openMenu = (name: MenuName) => { setActiveMenu(name); setSearchOpen(false); };
  return <div className="editorial-header-group" onKeyDown={event => { if (event.key === "Escape") close(); }}>
    <div className="editorial-announcement"><span>DESIGNED WITH PURPOSE. MADE FOR EVERYDAY.</span><Link href="/ecommerce/contact">{contactEmail || "LET'S CREATE SOMETHING TOGETHER"} <ArrowRight size={11} /></Link></div>
    <header className="editorial-header" onMouseLeave={() => setActiveMenu(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setActiveMenu(null); }}>
      <button className="editorial-mobile-menu" type="button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} onClick={() => { setMobileOpen(!mobileOpen); setSearchOpen(false); }}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
      <nav className="editorial-desktop-nav" aria-label="Main navigation">
        <Link className="editorial-nav-accent" href="/ecommerce/products?sort=newest" onMouseEnter={() => setActiveMenu(null)} onClick={close}>New Arrivals</Link>
        <button type="button" aria-expanded={activeMenu === "shop"} aria-controls="editorial-mega-menu" onMouseEnter={() => openMenu("shop")} onClick={() => openMenu("shop")}>Shop collections <ChevronDown size={12} /></button>
        <button type="button" aria-expanded={activeMenu === "company"} aria-controls="editorial-mega-menu" onMouseEnter={() => openMenu("company")} onClick={() => openMenu("company")}>Inside Centro <ChevronDown size={12} /></button>
      </nav>
      <Link href="/" className="editorial-wordmark" aria-label="Centro home" onClick={close}><img src="/centro/brand.svg" alt="Centro" width="118" height="48" /></Link>
      <div className="editorial-header-actions">
        <button type="button" aria-label="Search products" aria-expanded={searchOpen} onClick={() => { setSearchOpen(!searchOpen); setActiveMenu(null); setMobileOpen(false); }}><Search size={17} /></button>
        <Link href="/ecommerce/wishlist" aria-label="Wishlist" className="editorial-wishlist-link" onClick={close}><Bookmark size={16} /></Link>
        <span className="editorial-header-divider" aria-hidden="true" />
        <Link href="/ecommerce/contact" className="editorial-stores-link" onClick={close}>Contact</Link>
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="editorial-account-trigger" aria-label="Account menu">
                {session.user.image ? (
                  <img className="editorial-account-avatar" src={session.user.image} alt="" />
                ) : (
                  <span className="editorial-account-avatar editorial-account-avatar-fallback" aria-hidden="true">
                    {session.user.name?.trim().charAt(0).toUpperCase() || <UserRound size={16} />}
                  </span>
                )}
                <span className="editorial-action-label">Account</span>
                <ChevronDown className="editorial-action-icon" size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={12} className="z-[10001] w-48">
              <DropdownMenuItem asChild>
                <Link href="/ecommerce/user/profile" className="flex items-center gap-2">
                  <UserRound size={16} />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => {
                  void signOut({ callbackUrl: "/" }).catch(error => {
                    console.error("Error signing out:", error);
                  });
                }}
              >
                <LogOut size={16} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/signin" aria-label="Login to your account" onClick={close}>
            <span className="editorial-action-label">Account</span>
            <UserRound className="editorial-action-icon" size={18} />
          </Link>
        )}
        <button type="button" className="editorial-cart-trigger" aria-label={`Shopping bag, ${cartCount} items`} onClick={() => { close(); onOpenBag(); }}><span className="editorial-action-label">Cart</span><ShoppingBag className="editorial-action-icon" size={19} /><span className="editorial-cart-count">{cartCount}</span></button>
      </div>
      <div id="editorial-mega-menu" className="editorial-mega-panel centro-mega-panel" data-open={Boolean(activeMenu)} inert={!activeMenu} aria-hidden={!activeMenu} aria-label={activeMenu === "company" ? "Inside Centro" : "Shop collections"}>
        {activeMenu === "company" ? <>
          <div className="editorial-mega-column"><h2>THE WORLD OF CENTRO</h2>{companyLinks.map(([label, href]) => <Link key={href} href={href} onClick={close}>{label} <ArrowRight size={13} /></Link>)}</div>
          <div className="centro-mega-intro"><span className="editorial-kicker">IDEAS INTO EVERYDAY</span><h2>More than what<br />you wear.</h2><p>Discover the people, creativity and care behind Centro.</p><Link href="/ecommerce/about" onClick={close}>Meet Centro <ArrowRight size={16} /></Link></div>
          <Link className="editorial-mega-promo" href="/ecommerce/process" onClick={close}><img src="/centro/images/The_Centro_Design_and_Production_Process/790608ef71881125.png" alt="Centro design and production" /><span><strong>From first idea<br />to final detail.</strong><span>Explore our process <ArrowRight size={16} /></span></span></Link>
        </> : <>
          <div className="editorial-mega-column"><h2>EXPLORE COLLECTIONS</h2>{roots.map(category => <Link key={category.id} href={collection(category.slug)} onMouseEnter={() => setPreviewId(category.id)} onFocus={() => setPreviewId(category.id)} onClick={close}>{category.name} <ArrowRight size={13} /></Link>)}<Link href="/ecommerce/products" onClick={close}>Shop all pieces</Link></div>
          <div className="editorial-mega-column"><h2>{preview?.name || "THE LATEST EDIT"}</h2>{children.map(category => <Link key={category.id} href={collection(category.slug)} onClick={close}>{category.name}</Link>)}<Link href={preview ? collection(preview.slug) : "/ecommerce/products"} onClick={close}>Explore the collection <ArrowRight size={13} /></Link><div className="editorial-mega-products">{highlights.slice(0, 2).map(product => <Link key={product.id} className="editorial-mega-product" href={`/ecommerce/products/${product.slug}`} onClick={close}><img src={product.image || "/placeholder.svg"} alt={product.name} /><span>{product.name}<strong>Discover piece</strong></span></Link>)}</div></div>
          {preview ? <Link className="editorial-mega-promo" href={collection(preview.slug)} onClick={close}><img src={preview.image || "/placeholder.svg"} alt={preview.name} /><span><strong>{preview.name}</strong><span>Discover the collection <ArrowRight size={16} /></span></span></Link> : <div className="centro-mega-intro"><h2>A new perspective.</h2><Link href="/ecommerce/products" onClick={close}>Explore all pieces</Link></div>}
        </>}
      </div>
    </header>
    <button type="button" className="editorial-menu-shade" data-open={Boolean(activeMenu)} tabIndex={activeMenu ? 0 : -1} aria-hidden={!activeMenu} aria-label="Close menu" onClick={close} />
    {searchOpen ? <Form action="/ecommerce/products" className="editorial-search" onSubmit={close}><label htmlFor="editorial-search">Find your next favourite</label><div><input autoFocus id="editorial-search" name="q" type="search" placeholder="Search the collection…" required /><button type="submit">Search <Search size={16} /></button><button type="button" aria-label="Close search" onClick={close}><X size={18} /></button></div></Form> : null}
    {mobileOpen ? <nav className="editorial-mobile-nav centro-mobile-nav" aria-label="Mobile navigation"><Link href="/ecommerce/products?sort=newest" onClick={close}>New arrivals</Link><details open><summary>Shop collections</summary>{categories.filter(item => item.showInHeader).map(category => <Link key={category.id} href={collection(category.slug)} onClick={close} style={{ paddingLeft: category.parentId === null ? 0 : 18 }}>{category.name}</Link>)}</details><details><summary>Inside Centro</summary>{companyLinks.map(([label, href]) => <Link key={href} href={href} onClick={close}>{label}</Link>)}</details><Link href="/ecommerce/products" onClick={close}>Shop all pieces</Link></nav> : null}

  </div>;
}
