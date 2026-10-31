"use client";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
export function Storefront({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");
  return admin ? (
    <main>{children}</main>
  ) : (
    <div
      className={
        pathname === "/"
          ? "storefront storefront-home [&_>_.announcement]:relative [&_>_.announcement]:z-[61] [&_>_.announcement]:[background:#ffffff26] [&_>_.announcement]:[color:#fff] [&_.header-wrap:not(.header-scrolled):not(:has(.mega-menu))]:[background:transparent] [&_.header-wrap:not(.header-scrolled):not(:has(.mega-menu))]:[border-color:#ffffff21] [&_.header-wrap:not(.header-scrolled):not(:has(.mega-menu))_.site-header]:[background:transparent] [&_.header-wrap:not(.header-scrolled):not(:has(.mega-menu))_.site-header]:[border-color:#ffffff21] [&_.header-wrap:not(.header-scrolled):not(:has(.mega-menu))_.site-header_a]:[color:white] [&_.header-wrap:not(.header-scrolled):not(:has(.mega-menu))_.site-header_button]:[color:white] [&_.header-wrap:not(.header-scrolled):not(:has(.mega-menu))_.header-divider]:[background:#ffffff80] [&_.header-wrap:not(.header-scrolled):not(:has(.mega-menu))_.cart-count]:[background:#fff] [&_.header-wrap:not(.header-scrolled):not(:has(.mega-menu))_.cart-count]:[color:#242620] [&_.header-wrap:not(.header-scrolled):not(:has(.mega-menu))_.nav-brand-wordmark]:[filter:brightness(0)_invert(1)]"
          : "storefront"
      }
    >
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
