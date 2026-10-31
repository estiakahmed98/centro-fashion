import { getCommerceShell } from "@/lib/commerce-shell";
import type { Metadata } from "next";
import "./tailwind.css";
import { StoreProvider } from "@/components/StoreProvider";
import { Storefront } from "@/components/Storefront";
import { BackToTop } from "@/components/BackToTop";

export const metadata: Metadata = {
  icons: {
    icon: { url: "/favicon.png", type: "image/png" },
    shortcut: "/favicon.png",
  },
  title: {
    default: "Aura BOED | Modern Tailoring & Contemporary Essentials",
    template: "%s | Aura BOED",
  },
  description:
    "An elegant showcase storefront for Aura BOED: modern tailoring, contemporary essentials, and considered style.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const commerceShell = await getCommerceShell();
  // Browser extensions can add attributes to <html> before React hydrates.
  // Keep suppression at this element so mismatches inside the app stay visible.
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="[--ink:#232321] [--muted:#787775] [--line:#e8e7e5] [--off:#f5f4f2] [--cream:#e9e6e0] [--accent:#ad2826] [--serif:'Cormorant_Garamond',_Georgia,_'Times_New_Roman',_serif] [--sans:'DM_Sans',_Arial,_sans-serif] [:where(&)_*]:[box-sizing:border-box] box-border scroll-smooth motion-reduce:scroll-auto! [:where(&)_button]:[font:inherit] [:where(&)_button]:cursor-pointer [:where(&)_button]:[color:inherit] [:where(&)_button]:[background:none] [:where(&)_button]:[border:0] [:where(&)_input]:[font:inherit] [:where(&)_select]:[font:inherit] [:where(&)_a]:[color:inherit] [:where(&)_a]:[text-decoration:none] [:where(&)_img]:block [:where(&)_img]:max-w-[100%] [:where(&)_h1]:mt-[0] [:where(&)_h2]:mt-[0] [:where(&)_h3]:mt-[0] [:where(&)_p]:mt-[0] [:where(&)_button:focus-visible]:[outline:2px_solid_#4b6b88] [:where(&)_button:focus-visible]:[outline-offset:3px] [:where(&)_a:focus-visible]:[outline:2px_solid_#4b6b88] [:where(&)_a:focus-visible]:[outline-offset:3px] [:where(&)_input:focus-visible]:[outline:2px_solid_#4b6b88] [:where(&)_input:focus-visible]:[outline-offset:3px] [:where(&)_select:focus-visible]:[outline:2px_solid_#4b6b88] [:where(&)_select:focus-visible]:[outline-offset:3px] [:where(&)_main]:min-h-[30vh] [:where(&)_::selection]:[background:#d7c9b7] [:where(&)_::selection]:[color:#1c1c1a] motion-reduce:[&_*]:[scroll-behavior:auto]! motion-reduce:[&_*]:[transition:none]! motion-reduce:[&_*]:[animation:none]! motion-reduce:[&_*:before]:[scroll-behavior:auto]! motion-reduce:[&_*:before]:[transition:none]! motion-reduce:[&_*:before]:[animation:none]! motion-reduce:[&_*:after]:[scroll-behavior:auto]! motion-reduce:[&_*:after]:[transition:none]! motion-reduce:[&_*:after]:[animation:none]!"
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;450;500;600;700&display=swap"
        />
      </head>
      <body className="m-[0] [background:white] [color:var(--ink)] [font-family:var(--sans)] [font-size:13px] [-webkit-font-smoothing:antialiased]">
        <StoreProvider initialCatalogue={commerceShell}>
          <Storefront>{children}</Storefront>
          <BackToTop />
        </StoreProvider>
      </body>
    </html>
  );
}
