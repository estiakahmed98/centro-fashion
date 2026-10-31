"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice, type Product, type Collection } from "@/lib/products";
import { fetchCatalogue } from "@/lib/commerce-browser";
import { Icon } from "./Icons";
import { useStore } from "./StoreProvider";
import { AccountDialog } from "./AccountDialog";

type MenuName = "Clothing" | "Shoes" | "Accessories" | "Gifts" | null;
const clothingLinks = [
  ["Suits", "/collections/suits"],
  ["Jackets", "/collections/jackets"],
  ["Trousers", "/collections/trousers"],
  ["Knitwear", "/collections/knitwear"],
  ["T-shirts", "/collections/shirts"],
  ["Outerwear", "/collections/jackets"],
  ["Classic Shirts", "/collections/shirts"],
  ["Casual Shirts", "/collections/shirts"],
  ["Eveningwear", "/collections/suits"],
  ["Waistcoats", "/collections/suits"],
  ["View All", "/collections/suits"],
];
const buildMenuContent = (
  collectionImage: (category: Collection) => string,
) => ({
  Clothing: {
    title: "CLOTHING",
    links: clothingLinks,
    highlights: [
      ["New Arrivals", "/collections/suits"],
      ["Occasion Dressing", "/collections/suits"],
      ["Everyday Essentials", "/collections/shirts"],
      ["The Aura BOED Edit", "/"],
      ["Best Sellers", "/collections/suits"],
      ["Our Story", "/#our-story"],
    ],
    promo: "Tailoring, Reimagined",
    promoCta: "Explore suits",
    promoHref: "/collections/suits",
    image: collectionImage("suits"),
  },
  Shoes: {
    title: "FOOTWEAR",
    links: [
      ["Loafers", "/collections/shoes"],
      ["Classic Shoes", "/collections/shoes"],
      ["Leather Essentials", "/collections/shoes"],
      ["View All", "/collections/shoes"],
    ],
    highlights: [
      ["Latest Styles", "/collections/shoes"],
      ["The Occasion Edit", "/collections/shoes"],
      ["Best Sellers", "/collections/shoes"],
    ],
    promo: "The Finishing Touch",
    promoCta: "Discover shoes",
    promoHref: "/collections/shoes",
    image: collectionImage("shoes"),
  },
  Accessories: {
    title: "ACCESSORIES",
    links: [
      ["Ties", "/collections/accessories"],
      ["Pocket Squares", "/collections/accessories"],
      ["Belts & Leather", "/collections/accessories"],
      ["Cufflinks", "/collections/accessories"],
      ["View All", "/collections/accessories"],
    ],
    highlights: [
      ["The Gift Edit", "/collections/accessories"],
      ["Timeless Details", "/collections/accessories"],
      ["Best Sellers", "/collections/accessories"],
    ],
    promo: "It Is In The Details",
    promoCta: "View accessories",
    promoHref: "/collections/accessories",
    image: collectionImage("accessories"),
  },
  Gifts: {
    title: "DISCOVER GIFTS",
    links: [
      ["Gifts for Him", "/collections/accessories"],
      ["Modern Classics", "/collections/shirts"],
      ["Special Occasions", "/collections/suits"],
      ["View All", "/collections/accessories"],
    ],
    highlights: [
      ["Thoughtful Choices", "/collections/accessories"],
      ["New Season Gifts", "/collections/accessories"],
      ["Explore Collections", "/collections/suits"],
    ],
    promo: "A Thoughtful Gesture",
    promoCta: "Shop gifts",
    promoHref: "/collections/accessories",
    image: collectionImage("accessories"),
  },
});

export function Header() {
  const {
    cartCount,
    setCartOpen,
    favorites,
    products,
    registerProducts,
    catalogue,
  } = useStore();
  const menuContent = buildMenuContent(
    (category) => catalogue.collectionImages[category] || "",
  );
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [wishlistError, setWishlistError] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<MenuName>(null);
  const [displayedMenu, setDisplayedMenu] =
    useState<Exclude<MenuName, null>>("Clothing");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 40);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);
  useEffect(() => {
    setMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setWishlistOpen(false);
    setAccountOpen(false);
  }, [pathname]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setSearchOpen(false);
        setMobileOpen(false);
        setWishlistOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!searchOpen) return;
    const controller = new AbortController();
    setSearchLoading(true);
    setSearchError("");
    const timer = setTimeout(() => {
      void fetchCatalogue(
        {
          q: search.trim() || undefined,
          group: search.trim() ? undefined : "featured",
          limit: 6,
        },
        controller.signal,
      )
        .then((page) => {
          if (!controller.signal.aborted) {
            setSearchResults(page.products);
            registerProducts(page.products);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setSearchError("Search is temporarily unavailable.");
            setSearchResults([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearchLoading(false);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, searchOpen, registerProducts]);
  useEffect(() => {
    if (!wishlistOpen || !favorites.length) return;
    const controller = new AbortController();
    setWishlistError("");
    void fetchCatalogue(
      { ids: favorites.slice(0, 48), limit: 48 },
      controller.signal,
    )
      .then((page) => {
        if (!controller.signal.aborted) registerProducts(page.products);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setWishlistError("Saved pieces could not be refreshed.");
      });
    return () => controller.abort();
  }, [wishlistOpen, favorites, registerProducts]);
  const savedProducts = products.filter((p) => favorites.includes(p.id));
  // Keep the last content mounted so closing and interrupted transitions can finish.
  const activeMenu = menuContent[displayedMenu];
  const openMenu = (name: Exclude<MenuName, null>) => {
    setDisplayedMenu(name);
    setMenu(name);
  };

  return (
    <>
      <div className="announcement h-[34px] flex items-center justify-center [background:#f2f2f2] [color:#4f4e4c] [font-size:10px] [font-weight:var(--font-weight-semibold,_600)] tracking-[-0.01em] [&_a:hover]:[text-decoration:underline] max-[800.01px]:[font-size:9px] max-[800.01px]:h-[31px]">
        <Link href="/collections/suits">
          DISCOVER OUR NEW SEASON COLLECTION
        </Link>
      </div>
      <div
        className={`header-wrap h-[57px] sticky top-[0] z-[60] [background:#fff] [border-bottom:1px_solid_#e9e9e9] max-[800.01px]:h-[59px] ${scrolled ? "header-scrolled" : ""}`}
        onMouseLeave={() => setMenu(null)}
      >
        <header className="site-header h-[57px] p-[0_18px] flex items-center justify-between gap-[18px] relative z-[61] [background:#fff] max-[1150.01px]:p-[0_14px] max-[800.01px]:h-[59px] max-[520.01px]:p-[0_12px] [&_.brand-logo]:top-[0] [&_.brand-logo]:h-[57px] [&_.brand-logo]:flex-row [&_.brand-logo]:gap-[2px] max-[800.01px]:[&_.brand-logo]:h-[59px]">
          <div className="header-left flex items-center gap-[23px] [flex:1] whitespace-nowrap [&_>_a]:[font-size:14px] [&_>_a]:[font-weight:var(--font-weight-semibold,_600)] [&_>_a]:[color:#111] [&_>_a:hover]:[color:#8a2e26] [&_>_a.nav-active]:[color:#8a2e26] [&_>_a.red-link]:[color:#bb2522] max-[1550.01px]:gap-[15px] max-[1550.01px]:[&_>_a]:[font-size:16px] max-[1150.01px]:[&_>_a:nth-of-type(n_+_4)]:hidden! max-[1150.01px]:gap-[14px] max-[800.01px]:[&_>_a]:hidden! max-[800.01px]:[flex:1]">
            <button
              className="mobile-toggle hidden! max-[800.01px]:inline-flex! icon-button inline-flex items-center justify-center min-w-[18px] h-[28px] relative"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu" size={23} />
            </button>
            <Link
              className="red-link"
              href="/collections/suits"
              onMouseEnter={() => setMenu(null)}
            >
              New Arrivals
            </Link>
            {(["Clothing", "Shoes", "Accessories", "Gifts"] as const).map(
              (nav) => (
                <Link
                  key={nav}
                  href={
                    nav === "Clothing"
                      ? "/collections/suits"
                      : nav === "Shoes"
                        ? "/collections/shoes"
                        : "/collections/accessories"
                  }
                  className={menu === nav ? "nav-active" : ""}
                  onMouseEnter={() => openMenu(nav)}
                  onFocus={() => openMenu(nav)}
                  aria-expanded={menu === nav}
                  aria-controls="header-mega-menu"
                >
                  {nav}
                </Link>
              ),
            )}
            <Link
              className="red-link"
              href="/#our-story"
              onMouseEnter={() => setMenu(null)}
            >
              Our Story
            </Link>
          </div>
          <Link
            className="brand-logo absolute left-[50%] top-[6px] [transform:translateX(-50%)] flex items-center flex-col gap-[0] leading-[1] [color:#252522] tracking-[0.015em] [&_>_span]:[font-family:var(--serif)] [&_>_span]:[font-weight:var(--font-weight-medium,_500)] [&_>_span]:[font-size:32px] [&_>_span]:leading-[30px] [&_small]:[font-size:7.5px] [&_small]:tracking-[0.43em] [&_small]:[font-weight:var(--font-weight-medium,_500)] [&_small]:ml-[0.43em] [&_small]:mt-[1px] max-[800.01px]:[&_>_span]:[font-size:30px] max-[520.01px]:[&_>_span]:[font-size:27px] max-[520.01px]:[&_small]:[font-size:6px] max-[700.01px]:[&_>_span]:[font-size:27px] max-[700.01px]:[&_small]:[font-size:6px] max-[700.01px]:[&_small]:tracking-[0.23em] max-[360.01px]:[&_>_span]:[font-size:23px]"
            href="/"
            aria-label="Aura BOED homepage"
            onMouseEnter={() => setMenu(null)}
          >
            <img
              className="nav-brand-wordmark w-[190px] h-[57px] object-cover max-[800.01px]:w-[150px] max-[800.01px]:h-[55px] max-[380.01px]:w-[125px]"
              src="/AURA_BOED_Logo.svg"
              alt="Aura BOED"
              width={190}
              height={57}
            />
          </Link>
          <div className="header-right flex items-center gap-[22px] [flex:1] whitespace-nowrap justify-end [&_>_.desktop-nav]:[font-size:14px] [&_>_.desktop-nav]:[font-weight:var(--font-weight-semibold,_600)] [&_>_.desktop-nav]:[color:#111] [&_>_.account-trigger]:[font-size:14px] [&_>_.account-trigger]:[font-weight:var(--font-weight-semibold,_600)] [&_>_.account-trigger]:[color:#111] [&_button]:p-[0] max-[1550.01px]:gap-[15px] max-[1550.01px]:[&_.desktop-nav]:[font-size:16px]! max-[1550.01px]:[&_.account-trigger]:[font-size:16px]! max-[1150.01px]:[&_.desktop-nav]:hidden! max-[800.01px]:[&_.desktop-nav]:hidden! max-[800.01px]:[&_.language-button]:hidden! max-[800.01px]:[&_.header-divider]:hidden! max-[800.01px]:gap-[15px] max-[520.01px]:gap-[11px] max-[700.01px]:gap-[12px]! max-[360.01px]:gap-[8px]!">
            <button
              className="icon-button inline-flex items-center justify-center min-w-[18px] h-[28px] relative"
              aria-label="Search products"
              onClick={() => {
                setMenu(null);
                setSearchOpen(true);
              }}
            >
              <Icon name="search" size={18} />
            </button>
            <button
              className="icon-button favorites-icon [&_sup]:absolute [&_sup]:[font-size:9px] [&_sup]:top-[-1px] [&_sup]:right-[-8px] max-[800.01px]:hidden! inline-flex items-center justify-center min-w-[18px] h-[28px] relative"
              aria-label={`Saved items (${favorites.length})`}
              onClick={() => {
                setMenu(null);
                setWishlistOpen(true);
              }}
            >
              <Icon name="bookmark" size={18} />
              {favorites.length > 0 && <sup>{favorites.length}</sup>}
            </button>
            <span className="header-divider h-[16px] w-[1px] [background:#c9c7c5] m-[0_3px_0_0] max-[1150.01px]:hidden!" />
            <button
              className="language-button [font-size:14px] [font-weight:var(--font-weight-semibold,_600)] [color:#111] flex items-center gap-[5px] max-[1150.01px]:hidden!"
              aria-label="Language English"
            >
              EN <Icon name="chevron-down" size={11} />
            </button>
            <Link className="desktop-nav" href="/#our-story">
              Our stores
            </Link>
            <button
              className="account-trigger inline-flex items-center p-[4px_0] [&_svg]:hidden max-[1150.01px]:[&_span]:hidden max-[1150.01px]:[&_svg]:block"
              aria-label="Open account"
              aria-haspopup="dialog"
              onClick={() => {
                setMenu(null);
                setAccountOpen(true);
              }}
            >
              <span>Account</span>
              <Icon name="user" size={19} />
            </button>
            <button
              className="cart-button [font-size:14px] [font-weight:var(--font-weight-semibold,_600)] [color:#111] flex items-center gap-[4px] max-[800.01px]:[font-size:0]"
              onClick={() => {
                setMenu(null);
                setCartOpen(true);
              }}
            >
              Cart{" "}
              <span className="cart-count inline-flex items-center justify-center w-[14px] h-[14px] rounded-[50%] [background:#151515] [color:#fff] [font-size:9px] [font-weight:var(--font-weight-semibold,_600)] max-[800.01px]:[font-size:9px]">
                {cartCount}
              </span>
            </button>
          </div>
        </header>
          <div
            id="header-mega-menu"
            data-open={menu !== null}
            aria-hidden={menu === null}
            inert={menu === null}
            className="mega-menu absolute top-[57px] left-[0] w-[100%] h-[500px] grid grid-cols-[24.8%_24.8%_25%_25.4%] z-[62] [background:white] [box-shadow:0_8px_20px_#0000000c] max-[1150.01px]:grid-cols-[25%_25%_25%_25%] max-[800.01px]:hidden!"
          >
            <div className="mega-column p-[20px_20px_26px] [border-right:1px_solid_#e7e7e7] [overflow-y:auto] [&_h3]:[font-size:12px] [&_h3]:tracking-[0.22em] [&_h3]:[font-weight:var(--font-weight-bold,_700)] [&_h3]:[border-bottom:1px_solid_#e7e7e7] [&_h3]:p-[0_0_10px] [&_h3]:m-[0_0_10px] mega-list [&_>_a]:block [&_>_a]:leading-[28px] [&_>_a]:[font-size:13px] [&_>_a]:[font-weight:var(--font-weight-medium,_500)] [&_>_a]:[color:#3c3b3a] [&_>_a:hover]:[color:#ad2826] [&_>_a:hover]:[text-decoration:underline]">
              <h3>{activeMenu.title}</h3>
              {activeMenu.links.map(([label, href]) => (
                <Link href={href} key={label}>
                  {label}
                </Link>
              ))}
            </div>
            <div className="mega-column p-[20px_20px_26px] [border-right:1px_solid_#e7e7e7] [overflow-y:auto] [&_h3]:[font-size:12px] [&_h3]:tracking-[0.22em] [&_h3]:[font-weight:var(--font-weight-bold,_700)] [&_h3]:[border-bottom:1px_solid_#e7e7e7] [&_h3]:p-[0_0_10px] [&_h3]:m-[0_0_10px] mega-list [&_>_a]:block [&_>_a]:leading-[28px] [&_>_a]:[font-size:13px] [&_>_a]:[font-weight:var(--font-weight-medium,_500)] [&_>_a]:[color:#3c3b3a] [&_>_a:hover]:[color:#ad2826] [&_>_a:hover]:[text-decoration:underline]">
              <h3>HIGHLIGHTS</h3>
              {activeMenu.highlights.map(([label, href]) => (
                <Link href={href} key={label}>
                  {label}
                </Link>
              ))}
            </div>
            <div className="mega-column p-[20px_20px_26px] [border-right:1px_solid_#e7e7e7] [overflow-y:auto] [&_h3]:[font-size:12px] [&_h3]:tracking-[0.22em] [&_h3]:[font-weight:var(--font-weight-bold,_700)] [&_h3]:[border-bottom:1px_solid_#e7e7e7] [&_h3]:p-[0_0_10px] [&_h3]:m-[0_0_10px] mega-feature [&_.mini-product]:flex [&_.mini-product]:items-center [&_.mini-product]:gap-[14px] [&_.mini-product]:m-[0_0_9px] [&_.mini-product]:min-h-[130px] [&_.mini-product_img]:w-[116px] [&_.mini-product_img]:h-[126px] [&_.mini-product_img]:object-cover [&_.mini-product_img]:[background:#eee] [&_.mini-product_span]:[font-size:12px] [&_.mini-product_span]:leading-[1.6] [&_.mini-product_span]:[color:#696664] [&_.mini-product_strong]:block [&_.mini-product_strong]:[text-decoration:underline] [&_.mini-product_strong]:[text-underline-offset:5px] [&_.mini-product_strong]:[color:#20201f] [&_.mini-product_strong]:[font-size:12px] [&_.mini-product_strong]:mt-[7px] max-[1150.01px]:[&_.mini-product_img]:w-[85px] max-[1150.01px]:[&_.mini-product_img]:h-[105px] max-[1150.01px]:[&_.mini-product]:min-h-[107px] max-[1150.01px]:[&_.mini-product_span]:[font-size:11px]">
              <h3>BEST-SELLING ESSENTIALS</h3>
              {products
                .filter((p) => p.bestSelling && p.image)
                .slice(0, 3)
                .map((p) => (
                  <Link
                    className="mini-product"
                    href={`/products/${p.slug}`}
                    key={p.id}
                  >
                    {p.image ? (
                      <img src={p.image} alt="" />
                    ) : (
                      <span className="image-unavailable flex items-center justify-center min-h-[240px] h-[100%] [background:#eeeae4] [color:#83796a] [font-size:13px] tracking-[0.05em]">
                        No image
                      </span>
                    )}
                    <span>
                      {p.name}
                      <strong>Buy now</strong>
                    </span>
                  </Link>
                ))}
            </div>
            <Link
              className="mega-editorial relative overflow-hidden [background:#c1bdb7] block h-[100%] [&_img]:h-[100%] [&_img]:w-[100%] [&_img]:object-cover [&_img]:object-[center_20%] [&_img]:[filter:brightness(0.79)] [&:after]:[content:''] [&:after]:absolute [&:after]:inset-[40%_0_0] [&:after]:[background:linear-gradient(transparent,_rgba(0,_0,_0,_0.38))] [&_>_div]:absolute [&_>_div]:z-[2] [&_>_div]:bottom-[64px] [&_>_div]:left-[14px] [&_>_div]:right-[14px] [&_>_div]:text-center [&_>_div]:[color:white] [&_h2]:[font-size:20px] [&_h2]:[font-weight:var(--font-weight-semibold,_600)] [&_h2]:m-[0_0_14px] [&_h2]:[text-shadow:0_1px_2px_#555] [&_span]:inline-flex [&_span]:items-center [&_span]:gap-[8px] [&_span]:[border:1px_solid_#fff] [&_span]:p-[14px_20px] [&_span]:[font-weight:var(--font-weight-semibold,_600)]"
              href={activeMenu.promoHref}
            >
              <img src={activeMenu.image} alt="" />
              <div>
                <h2>{activeMenu.promo}</h2>
                <span>
                  {activeMenu.promoCta} <Icon name="arrow-right" size={16} />
                </span>
              </div>
            </Link>
          </div>
      </div>
        <button
          data-open={menu !== null}
          aria-hidden={menu === null}
          inert={menu === null}
          tabIndex={-1}
          className="mega-shade fixed z-[55] top-[91px] [inset-inline:0] bottom-[0] [background:rgba(0,_0,_0,_0.58)] w-[100%] h-[calc(100dvh_-_91px)] cursor-default max-[800.01px]:hidden!"
          onMouseEnter={() => setMenu(null)}
          onClick={() => setMenu(null)}
          aria-label="Close menu"
        />

      {searchOpen && (
        <div
          className="modal-shade fixed inset-[0] z-[100] [background:rgba(0,_0,_0,_0.43)] flex justify-end"
          onMouseDown={() => setSearchOpen(false)}
        >
          <div
            className="search-panel h-[min(650px,_90vh)] [background:white] absolute top-[0] left-[0] right-[0] p-[35px_max(30px,_calc((100vw_-_1200px)_/_2))] overflow-auto [&_h3]:[font-size:11px] [&_h3]:tracking-[0.18em] [&_h3]:m-[31px_0_15px] max-[800.01px]:p-[28px_22px]"
            role="dialog"
            aria-label="Search products"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="search-panel-head flex items-center justify-between mb-[25px] [&_h2]:[font-family:var(--serif)] [&_h2]:[font-size:38px] [&_h2]:[font-weight:var(--font-weight-medium,_500)] [&_h2]:m-[0]">
              <h2>What are you looking for?</h2>
              <button
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <Icon name="close" size={22} />
              </button>
            </div>
            <div className="search-input-wrap flex items-center gap-[12px] p-[13px_0] [border-bottom:1px_solid_#777] [&_input]:w-[100%] [&_input]:[outline:none] [&_input]:[border:0] [&_input]:[font-size:18px]">
              <Icon name="search" size={23} />
              <input
                autoFocus
                placeholder="Search for a product or collection..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <h3>
              {search.trim()
                ? `RESULTS (${searchResults.length})`
                : "THE SELECTION OF THE MOMENT"}
            </h3>
            {searchLoading && <p role="status">Searching the collection...</p>}
            {searchError && <p role="alert">{searchError}</p>}
            <div className="search-results grid grid-cols-[repeat(4,_1fr)] gap-[15px] [&_>_a]:flex [&_>_a]:gap-[12px] [&_>_a]:items-center [&_>_a]:[font-size:12px] [&_img]:w-[68px] [&_img]:h-[90px] [&_img]:object-cover [&_small]:block [&_small]:mt-[7px] [&_small]:[color:var(--muted)] max-[800.01px]:grid-cols-[repeat(2,_1fr)]">
              {searchResults.length ? (
                searchResults.map((p) => (
                  <Link
                    href={`/products/${p.slug}`}
                    key={p.id}
                    onClick={() => setSearchOpen(false)}
                  >
                    {p.image ? (
                      <img src={p.image} alt="" />
                    ) : (
                      <span className="image-unavailable flex items-center justify-center min-h-[240px] h-[100%] [background:#eeeae4] [color:#83796a] [font-size:13px] tracking-[0.05em]">
                        No image
                      </span>
                    )}
                    <span>
                      {p.name}
                      <small>{formatPrice(p.price)}</small>
                    </span>
                  </Link>
                ))
              ) : (
                <p>No products found. Try another term.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {wishlistOpen && (
        <div
          className="modal-shade fixed inset-[0] z-[100] [background:rgba(0,_0,_0,_0.43)] flex justify-end"
          onMouseDown={() => setWishlistOpen(false)}
        >
          <div
            className="wishlist-panel h-[100%] [background:#fff] w-[min(430px,_100vw)] overflow-auto"
            role="dialog"
            aria-label="Saved pieces"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="drawer-head flex items-center justify-between p-[24px_25px] [border-bottom:1px_solid_var(--line)] [flex:0_0_auto] [&_h2]:[font-size:19px] [&_h2]:[font-weight:var(--font-weight-medium,_500)] [&_h2]:m-[0] [&_button]:flex [&_button]:items-center [&_button]:justify-center">
              <h2>Saved pieces ({savedProducts.length})</h2>
              <button
                aria-label="Close saved items"
                onClick={() => setWishlistOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            {wishlistError && (
              <p role="alert" className="px-5">
                {wishlistError}
              </p>
            )}
            {savedProducts.length ? (
              <div className="wishlist-items p-[20px] [&_>_a]:flex [&_>_a]:items-center [&_>_a]:gap-[15px] [&_>_a]:mb-[15px] [&_>_a]:[font-size:13px] [&_img]:w-[80px] [&_img]:h-[105px] [&_img]:object-cover [&_small]:block [&_small]:[color:var(--muted)] [&_small]:mt-[10px]">
                {savedProducts.map((p) => (
                  <Link
                    href={`/products/${p.slug}`}
                    key={p.id}
                    onClick={() => setWishlistOpen(false)}
                  >
                    {p.image ? (
                      <img src={p.image} alt="" />
                    ) : (
                      <span className="image-unavailable flex items-center justify-center min-h-[240px] h-[100%] [background:#eeeae4] [color:#83796a] [font-size:13px] tracking-[0.05em]">
                        No image
                      </span>
                    )}
                    <span>
                      {p.name}
                      <small>View item</small>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-bag flex flex-col items-center text-center justify-center p-[65px_30px] gap-[10px] [flex:1] [&_h3]:[font-family:var(--serif)] [&_h3]:[font-size:32px] [&_h3]:[font-weight:var(--font-weight-normal,_400)] [&_h3]:m-[8px_0_0] [&_p]:[font-size:13px] [&_p]:[color:var(--muted)] [&_p]:leading-[1.7] [&_p]:mb-[15px]">
                <Icon name="bookmark" size={34} />
                <h3>Your wishlist is empty</h3>
                <p>Save your favourite styles to find them later.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {accountOpen && <AccountDialog onClose={() => setAccountOpen(false)} />}

      {mobileOpen && (
        <div
          className="modal-shade fixed inset-[0] z-[100] [background:rgba(0,_0,_0,_0.43)] flex justify-end"
          onMouseDown={() => setMobileOpen(false)}
        >
          <nav
            className="mobile-panel h-[100%] [background:#fff] w-[min(430px,_100vw)] overflow-auto max-[800.01px]:[&_>_a]:p-[17px_24px] max-[800.01px]:[&_>_a]:[border-bottom:1px_solid_var(--line)] max-[800.01px]:[&_>_a]:flex max-[800.01px]:[&_>_a]:justify-between max-[800.01px]:[&_>_a]:[font-size:14px]"
            aria-label="Mobile navigation"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="drawer-head flex items-center justify-between p-[24px_25px] [border-bottom:1px_solid_var(--line)] [flex:0_0_auto] [&_h2]:[font-size:19px] [&_h2]:[font-weight:var(--font-weight-medium,_500)] [&_h2]:m-[0] [&_button]:flex [&_button]:items-center [&_button]:justify-center">
              <span className="mobile-brand max-[800.01px]:[font-family:var(--serif)] max-[800.01px]:[font-size:30px]">
                <img
                  src="/AURA_BOED_Logo.svg"
                  alt="Aura BOED"
                  width={170}
                  height={55}
                />
              </span>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            {[
              ["New Arrivals", "/collections/suits"],
              ...clothingLinks.slice(0, 8),
              ["Shoes", "/collections/shoes"],
              ["Accessories", "/collections/accessories"],
              ["Our Story", "/#our-story"],
            ].map(([label, href], i) => (
              <Link
                key={`${label}-${i}`}
                href={href}
                onClick={() => setMobileOpen(false)}
              >
                {label}
                <Icon name="arrow-right" size={16} />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
