"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { categoryNames, type Product, type Collection } from "@/lib/products";
import { Icon, type IconName } from "./Icons";
type AdminItem = { label: string; icon: IconName };
type AdminGroup = { label: string; description: string; items: AdminItem[] };
const navigationGroups: AdminGroup[] = [
  {
    label: "OVERVIEW",
    description: "Monitor store performance and daily activity.",
    items: [
      { label: "Dashboard", icon: "grid-four" },
      { label: "Analytics & Reports", icon: "sliders" },
    ],
  },
  {
    label: "CATALOGUE",
    description: "Organise products, merchandising and catalogue information.",
    items: [
      { label: "Products", icon: "bag" },
      { label: "Categories & Collections", icon: "grid-four" },
      { label: "Variants & Attributes", icon: "sliders" },
      { label: "Brands", icon: "bookmark" },
      { label: "Product Reviews", icon: "check" },
    ],
  },
  {
    label: "SALES & FULFILMENT",
    description:
      "Manage orders, payment status, delivery and after-sales service.",
    items: [
      { label: "Orders", icon: "bag" },
      { label: "Abandoned Checkouts", icon: "rotate" },
      { label: "Payments & Transactions", icon: "shield" },
      { label: "Invoices", icon: "bookmark" },
      { label: "Shipping & Delivery", icon: "truck" },
      { label: "Returns & Refunds", icon: "rotate" },
    ],
  },
  {
    label: "INVENTORY & SUPPLY",
    description:
      "Track stock across warehouses, manage purchasing and coordinate inventory movements.",
    items: [
      { label: "Inventory", icon: "grid-four" },
      { label: "Warehouses", icon: "map-pin" },
      { label: "Stock Transfers", icon: "truck" },
      { label: "Stock Adjustments", icon: "sliders" },
      { label: "Purchase Orders", icon: "bag" },
      { label: "Suppliers", icon: "user" },
      { label: "Low Stock Alerts", icon: "bookmark" },
    ],
  },
  {
    label: "CUSTOMERS",
    description:
      "Understand customers, manage segments and handle support requests.",
    items: [
      { label: "Customers", icon: "user" },
      { label: "Customer Groups", icon: "grid-four" },
      { label: "Support & Tickets", icon: "user" },
    ],
  },
  {
    label: "MARKETING & CONTENT",
    description:
      "Plan promotions, manage storefront content and grow customer relationships.",
    items: [
      { label: "Discounts & Coupons", icon: "bookmark" },
      { label: "Campaigns", icon: "arrow-right" },
      { label: "Gift Cards", icon: "bag" },
      { label: "Newsletter Subscribers", icon: "user" },
      { label: "Pages & Banners", icon: "grid-two" },
      { label: "SEO", icon: "search" },
    ],
  },
  {
    label: "ADMINISTRATION",
    description:
      "Control staff access, store configuration, integrations and operational settings.",
    items: [
      { label: "Users & Roles", icon: "user" },
      { label: "Permissions", icon: "shield" },
      { label: "Store Settings", icon: "sliders" },
      { label: "Taxes & Currencies", icon: "sliders" },
      { label: "Payment Gateways", icon: "shield" },
      { label: "Integrations", icon: "grid-four" },
      { label: "Activity Log", icon: "rotate" },
    ],
  },
];
const navigation = navigationGroups.flatMap((group) => group.items);
export function AdminPanel({ products }: { products: Product[] }) {
  const [active, setActive] = useState("Dashboard");
  const [query, setQuery] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [mobileNavigation, setMobileNavigation] = useState(false);
  const navigationRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const handleResize = () => {
      if (!media.matches) setMobileNavigation(false);
    };
    media.addEventListener("change", handleResize);
    return () => media.removeEventListener("change", handleResize);
  }, []);
  useEffect(() => {
    if (!mobileNavigation) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = navigationRef.current;
    const focusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input:not([disabled])",
        ) || [],
      ).filter((element) => element.getClientRects().length);
    const focusFrame = requestAnimationFrame(() => focusable()[0]?.focus());
    const focusTimer = window.setTimeout(() => {
      if (!panel?.contains(document.activeElement)) focusable()[0]?.focus();
    }, 300);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileNavigation(false);
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!panel?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      cancelAnimationFrame(focusFrame);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, [mobileNavigation]);

  const visibleGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        `${item.label} ${group.label}`
          .toLowerCase()
          .includes(menuSearch.trim().toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length);
  const activeGroup = navigationGroups.find((group) =>
    group.items.some((item) => item.label === active),
  );
  function selectSection(label: string) {
    setActive(label);
    setMobileNavigation(false);
  }
  function toggleGroup(label: string) {
    setCollapsedGroups((current) =>
      current.includes(label)
        ? current.filter((group) => group !== label)
        : [...current, label],
    );
  }

  const pictured = products.filter((p) => p.image).length;
  const categories = Object.entries(categoryNames) as [Collection, string][];
  const selected = products
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);
  return (
    <div className="admin-shell min-h-[100vh] flex [background:#f6f7f9] [color:#283531] [font-family:Arial,_Helvetica,_sans-serif] max-[700.01px]:block [&_.admin-sidebar]:w-[286px] [&_.admin-sidebar]:h-[100dvh] [&_.admin-sidebar]:p-[29px_16px_20px] [@media(min-width:_701px)_and_(max-height:_650px)]:[&_.admin-sidebar]:pt-[20px] [@media(max-width:_1100px)_and_(min-width:_701px)]:[&_.admin-sidebar]:w-[260px] [@media(max-width:_1100px)_and_(min-width:_701px)]:[&_.admin-sidebar]:pl-[12px] [@media(max-width:_1100px)_and_(min-width:_701px)]:[&_.admin-sidebar]:pr-[12px] max-[700.01px]:[&_.admin-sidebar]:relative max-[700.01px]:[&_.admin-sidebar]:w-[100%] max-[700.01px]:[&_.admin-sidebar]:h-[auto] max-[700.01px]:[&_.admin-sidebar]:p-[20px_18px]">
      <aside className="admin-sidebar w-[250px] [background:#fff] [border-right:1px_solid_#e5e9e7] p-[38px_22px] flex flex-col sticky top-[0] h-[100vh] [flex-shrink:0] [&_nav]:grid [&_nav]:gap-[8px] [&_nav_button]:flex [&_nav_button]:items-center [&_nav_button]:gap-[13px] [&_nav_button]:p-[14px] [&_nav_button]:rounded-[7px] [&_nav_button]:[border:0] [&_nav_button]:[background:none] [&_nav_button]:[color:#748079] [&_nav_button]:text-left [&_nav_button]:[font-size:13px] [&_nav_button[aria-current='page']]:[background:#edf3ef] [&_nav_button[aria-current='page']]:[color:#244e3b] [&_nav_button[aria-current='page']]:[font-weight:var(--font-weight-semibold,_600)] [&_nav_button_small]:ml-[auto] [&_nav_button_small]:[font-size:9px] [&_nav_button_small]:[color:#929b95] [&_nav_button_small]:[border:1px_solid_#e8eae8] [&_nav_button_small]:p-[3px_5px] [&_nav_button_small]:rounded-[4px] max-[1150.01px]:w-[210px] max-[1150.01px]:p-[30px_14px] max-[700.01px]:static max-[700.01px]:w-[100%] max-[700.01px]:h-[auto] max-[700.01px]:p-[22px_16px] max-[700.01px]:[&_nav]:flex max-[700.01px]:[&_nav]:overflow-auto max-[700.01px]:[&_nav]:mt-[23px] max-[700.01px]:[&_nav]:gap-[5px] max-[700.01px]:[&_nav_button]:whitespace-nowrap max-[700.01px]:[&_nav_button]:p-[11px] max-[700.01px]:[&_nav_button]:[font-size:10px] max-[700.01px]:[&_nav_button]:gap-[6px] max-[700.01px]:[&_nav_button_small]:hidden [&_.admin-sidebar-navigation_nav]:grid [&_.admin-sidebar-navigation_nav]:gap-[22px] [&_.admin-sidebar-navigation_nav]:m-[0] [&_.admin-sidebar-navigation_nav]:[overflow:visible] [&_nav_.admin-group-toggle]:w-[100%] [&_nav_.admin-group-toggle]:flex [&_nav_.admin-group-toggle]:items-center [&_nav_.admin-group-toggle]:justify-between [&_nav_.admin-group-toggle]:gap-[8px] [&_nav_.admin-group-toggle]:p-[0_10px] [&_nav_.admin-group-toggle]:rounded-[0] [&_nav_.admin-group-toggle]:[font-size:8px] [&_nav_.admin-group-toggle]:[font-weight:var(--font-weight-semibold,_600)] [&_nav_.admin-group-toggle]:tracking-[1.2px] [&_nav_.admin-group-toggle]:leading-[1.8] [&_nav_.admin-group-toggle]:[color:#94a294] [&_nav_.admin-menu-item]:flex [&_nav_.admin-menu-item]:w-[100%] [&_nav_.admin-menu-item]:items-center [&_nav_.admin-menu-item]:gap-[11px] [&_nav_.admin-menu-item]:p-[11px_10px] [&_nav_.admin-menu-item]:[font-size:11px] [&_nav_.admin-menu-item]:[color:#718075] [&_nav_.admin-menu-item]:[font-weight:var(--font-weight-normal,_400)] [&_nav_.admin-menu-item]:rounded-[6px] [&_nav_.admin-menu-item]:[white-space:normal] [&_nav_.admin-menu-item]:leading-[1.4] [&_nav_.admin-menu-item_>_svg]:[flex-shrink:0] [&_nav_.admin-menu-item_>_svg]:[color:#829787] [&_nav_.admin-menu-item_>_span]:[flex:1] [&_nav_.admin-menu-item_small]:block [&_nav_.admin-menu-item_small]:[flex-shrink:0] [&_nav_.admin-menu-item_small]:ml-[auto] [&_nav_.admin-menu-item_small]:[font-size:8px] [&_nav_.admin-menu-item_small]:[font-weight:var(--font-weight-normal,_400)] [&_nav_.admin-menu-item_small]:p-[2px_5px] [&_nav_.admin-menu-item_small]:[border:1px_solid_#e7ece7] [&_nav_.admin-menu-item_small]:[color:#a0aba1] [&_nav_.admin-menu-item_small]:rounded-[4px] [&_nav_.admin-menu-item:hover]:[background:#f5f8f4] [&_nav_.admin-menu-item:hover]:[color:#365841] [&_nav_.admin-menu-item[aria-current='page']]:[background:#eaf2ec] [&_nav_.admin-menu-item[aria-current='page']]:[color:#28503b] [&_nav_.admin-menu-item[aria-current='page']]:[font-weight:var(--font-weight-semibold,_600)] [&_nav_.admin-menu-item[aria-current='page']_>_svg]:[color:#3b6d4a] [&_.admin-sidebar-bottom]:p-[17px_6px_0] [&_.admin-sidebar-bottom]:mt-[0] [&_.admin-sidebar-bottom]:[border-top:1px_solid_#e9ede7] [&_.admin-sidebar-bottom]:[flex-shrink:0] [&_.admin-sidebar-bottom_>_a]:mt-[16px] [&_.admin-sidebar-bottom_>_a]:[font-size:10px] [@media(min-width:_701px)_and_(max-height:_650px)]:[&_.admin-preview]:hidden [@media(min-width:_701px)_and_(max-height:_650px)]:[&_.admin-sidebar-bottom]:pt-[0] max-[700.01px]:[&_.admin-sidebar-bottom]:hidden max-[700.01px]:[&_nav_.admin-menu-item]:[font-size:12px] max-[700.01px]:[&_nav_.admin-menu-item]:min-h-[42px] max-[700.01px]:[&_nav_.admin-menu-item]:p-[12px] max-[700.01px]:[&_nav_.admin-group-toggle]:[font-size:9px] max-[700.01px]:[&_nav_.admin-group-toggle]:pl-[12px]">
        <div
          className="admin-sidebar-brand-row flex items-center justify-between p-[0_7px_24px] [flex-shrink:0] [&_.admin-brand]:p-[0_8px] [&_.admin-brand]:[font-size:28px] [&_.admin-brand]:flex [&_.admin-brand]:items-center [&_.admin-brand]:gap-[8px] [&_.admin-brand_small]:[font-size:7px] [&_.admin-brand_small]:tracking-[1.8px] [@media(min-width:_701px)_and_(max-height:_650px)]:pb-[18px] max-[700.01px]:p-[0] max-[700.01px]:[&_.admin-brand]:[font-size:25px] max-[700.01px]:[&_.admin-brand]:p-[0]"
          inert={mobileNavigation}
        >
          <Link
            href="/"
            className="admin-brand [font-family:Georgia,_serif] [font-size:29px] tracking-[-1px] p-[0_12px] [&_small]:block [&_small]:[font-family:Arial,_sans-serif] [&_small]:[font-size:8px] [&_small]:tracking-[2px] [&_small]:mt-[10px] [&_small]:[color:#8a948e] max-[700.01px]:[font-size:25px] [&_.admin-brand-icon]:w-[40px] [&_.admin-brand-icon]:h-[40px] [&_.admin-brand-icon]:rounded-[7px] [&_.admin-brand-icon]:object-cover [&_.admin-brand-icon]:[flex-shrink:0] [&_.admin-brand-wordmark]:w-[170px] [&_.admin-brand-wordmark]:h-[55px] [&_.admin-brand-wordmark]:object-cover"
            aria-label="Aura BOED homepage"
          >
            <img
              className="admin-brand-icon"
              src="/favicon.png"
              alt=""
              width={40}
              height={40}
            />
            <img
              className="admin-brand-wordmark"
              src="/AURA_BOED_Logo.svg"
              alt="Aura BOED"
              width={170}
              height={55}
            />
          </Link>
          <button
            type="button"
            className="admin-mobile-nav-toggle hidden max-[700.01px]:grid max-[700.01px]:[place-items:center] max-[700.01px]:w-[40px] max-[700.01px]:h-[40px] max-[700.01px]:[border:1px_solid_#e3eae2] max-[700.01px]:rounded-[6px] max-[700.01px]:[color:#496750]"
            aria-label="Toggle admin navigation"
            aria-expanded={mobileNavigation}
            aria-controls="admin-sidebar-navigation"
            onClick={() => setMobileNavigation((open) => !open)}
          >
            <Icon name={mobileNavigation ? "close" : "menu"} size={22} />
          </button>
        </div>
        {mobileNavigation && (
          <button
            type="button"
            className="admin-mobile-backdrop hidden max-[700.01px]:block max-[700.01px]:fixed max-[700.01px]:inset-[0] max-[700.01px]:z-[99] max-[700.01px]:[background:#14271b70] max-[700.01px]:[backdrop-filter:blur(3px)]"
            aria-label="Close admin navigation"
            tabIndex={-1}
            onClick={() => setMobileNavigation(false)}
          />
        )}
        <div
          ref={navigationRef}
          role={mobileNavigation ? "dialog" : undefined}
          aria-modal={mobileNavigation || undefined}
          aria-label={mobileNavigation ? "Admin navigation menu" : undefined}
          id="admin-sidebar-navigation"
          className={`admin-sidebar-navigation [flex:1] min-h-[0] [overflow-y:auto] [overflow-x:hidden] [scrollbar-width:thin] [scrollbar-color:#d4ded5_transparent] p-[0_6px_20px] max-[700.01px]:block max-[700.01px]:fixed max-[700.01px]:inset-[0_auto_0_0] max-[700.01px]:w-[90vw] max-[700.01px]:h-[100dvh] max-[700.01px]:max-h-[none] max-[700.01px]:m-[0] max-[700.01px]:p-[0_20px_max(24px,_env(safe-area-inset-bottom))] max-[700.01px]:z-[100] max-[700.01px]:[background:#fff] max-[700.01px]:[overflow-y:auto] max-[700.01px]:[overscroll-behavior:contain] max-[700.01px]:[transform:translateX(-100%)] max-[700.01px]:[visibility:hidden] max-[700.01px]:[transition:transform_0.28s_ease,_visibility_0.28s] max-[700.01px]:[&.is-open]:block max-[700.01px]:[&.is-open]:max-h-[none] max-[700.01px]:[&.is-open]:mt-[24px] max-[700.01px]:[&.is-open]:p-[0_20px_max(24px,_env(safe-area-inset-bottom))] max-[700.01px]:[&.is-open]:fixed max-[700.01px]:[&.is-open]:inset-[0_auto_0_0] max-[700.01px]:[&.is-open]:w-[90vw] max-[700.01px]:[&.is-open]:h-[100dvh] max-[700.01px]:[&.is-open]:m-[0] max-[700.01px]:[&.is-open]:z-[100] max-[700.01px]:[&.is-open]:[background:#fff] max-[700.01px]:[&.is-open]:[overflow-y:auto] max-[700.01px]:[&.is-open]:[overscroll-behavior:contain] max-[700.01px]:[&.is-open]:[transform:translateX(0)] max-[700.01px]:[&.is-open]:[visibility:visible] max-[700.01px]:[&.is-open]:[transition:transform_0.28s_ease,_visibility_0.28s] max-[700.01px]:[&_.admin-menu-search]:top-[0] max-[700.01px]:[&_.admin-menu-search]:m-[0_0_24px] motion-reduce:[transition:none] motion-reduce:[&.is-open]:[transition:none] ${mobileNavigation ? "is-open" : ""}`}
        >
          <div className="admin-drawer-header hidden max-[700.01px]:flex max-[700.01px]:items-center max-[700.01px]:justify-between max-[700.01px]:gap-[20px] max-[700.01px]:min-h-[95px] max-[700.01px]:pt-[env(safe-area-inset-top)] max-[700.01px]:[background:#fff] max-[700.01px]:[&_>_span]:[font-family:Georgia,_serif] max-[700.01px]:[&_>_span]:[font-size:27px] max-[700.01px]:[&_>_span]:[color:#283d2d] max-[700.01px]:[&_small]:block max-[700.01px]:[&_small]:[font-family:Arial,_sans-serif] max-[700.01px]:[&_small]:[font-size:7px] max-[700.01px]:[&_small]:tracking-[1.5px] max-[700.01px]:[&_small]:[color:#91a08e] max-[700.01px]:[&_small]:mt-[9px] max-[700.01px]:[&_button]:grid max-[700.01px]:[&_button]:[place-items:center] max-[700.01px]:[&_button]:w-[42px] max-[700.01px]:[&_button]:h-[42px] max-[700.01px]:[&_button]:[border:1px_solid_#e0e8de] max-[700.01px]:[&_button]:rounded-[6px] [&_.admin-drawer-brand]:flex [&_.admin-drawer-brand]:items-center [&_.admin-drawer-brand]:gap-[8px] [&_.admin-drawer-brand]:min-w-[0] max-[370.01px]:gap-[8px]">
            <Link
              href="/"
              className="admin-drawer-brand [&_>_img:first-child]:w-[38px] [&_>_img:first-child]:h-[38px] [&_>_img:first-child]:object-cover [&_>_img:first-child]:rounded-[6px] [&_>_img:last-child]:w-[150px] [&_>_img:last-child]:h-[55px] [&_>_img:last-child]:object-cover max-[370.01px]:[&_>_img:last-child]:w-[120px]"
              aria-label="Aura BOED homepage"
            >
              <img src="/favicon.png" alt="" width={38} height={38} />
              <img
                src="/AURA_BOED_Logo.svg"
                alt="Aura BOED"
                width={150}
                height={55}
              />
            </Link>
            <button
              type="button"
              aria-label="Close admin menu"
              onClick={() => setMobileNavigation(false)}
            >
              <Icon name="close" size={23} />
            </button>
          </div>
          <label className="admin-menu-search sticky top-[0] z-[1] flex items-center gap-[9px] [background:#f6f8f6] [border:1px_solid_#e7ece7] rounded-[7px] p-[11px_10px] m-[0_0_22px] [color:#97a397] [&_input]:w-[100%] [&_input]:min-w-[0] [&_input]:[background:transparent] [&_input]:[border:0] [&_input]:[outline:none] [&_input]:[font-size:11px] [&_input]:[color:#3c5544] [&_input::placeholder]:[color:#9aa69b] [&_button]:p-[0] [&_button]:flex max-[700.01px]:mb-[20px]">
            <Icon name="search" size={16} />
            <input
              aria-label="Search admin menu"
              placeholder="Find a menu..."
              value={menuSearch}
              onChange={(event) => setMenuSearch(event.target.value)}
            />
            {menuSearch && (
              <button
                type="button"
                aria-label="Clear menu search"
                onClick={() => setMenuSearch("")}
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </label>
          <nav aria-label="Admin navigation">
            {visibleGroups.map((group) => {
              const expanded =
                Boolean(menuSearch.trim()) ||
                !collapsedGroups.includes(group.label);
              const groupId = `admin-group-${group.label.toLowerCase().replaceAll(/[^a-z]+/g, "-")}`;
              return (
                <section
                  className="admin-menu-group [&_h2]:m-[0_0_8px]"
                  key={group.label}
                >
                  <h2>
                    <button
                      type="button"
                      className="admin-group-toggle [&_>_svg]:[transition:transform_0.15s] [&_>_svg]:[flex-shrink:0] [&[aria-expanded='false']_>_svg]:[transform:rotate(-90deg)] motion-reduce:[&_>_svg]:[transition:none]"
                      aria-expanded={expanded}
                      aria-controls={groupId}
                      onClick={() => toggleGroup(group.label)}
                    >
                      <span>{group.label}</span>
                      <Icon name="chevron-down" size={12} />
                    </button>
                  </h2>
                  <div
                    id={groupId}
                    className="admin-menu-items [&:not([hidden])]:grid [&:not([hidden])]:gap-[3px]"
                    hidden={!expanded}
                  >
                    {group.items.map((item) => (
                      <button
                        type="button"
                        className="admin-menu-item"
                        key={item.label}
                        aria-current={
                          active === item.label ? "page" : undefined
                        }
                        onClick={() => selectSection(item.label)}
                      >
                        <Icon name={item.icon} size={18} />
                        <span>{item.label}</span>
                        {item.label !== "Dashboard" && <small>Soon</small>}
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </nav>
          {!visibleGroups.length && (
            <div className="admin-menu-empty [font-size:11px] text-center leading-[1.8] [color:#97a293] p-[20px_10px] [&_button]:block [&_button]:m-[12px_auto] [&_button]:[color:#3c6947] [&_button]:[text-decoration:underline]">
              No menu items match ?{menuSearch}?.
              <button type="button" onClick={() => setMenuSearch("")}>
                Clear search
              </button>
            </div>
          )}
        </div>
        <div className="admin-sidebar-bottom mt-[auto] [font-size:11px] [&_>_a]:flex [&_>_a]:gap-[10px] [&_>_a]:items-center [&_>_a]:m-[23px_12px_0] [&_>_a]:[color:#66756c] max-[700.01px]:hidden">
          <div className="admin-preview flex gap-[10px] items-center [border:1px_solid_#e8ebe7] rounded-[8px] p-[13px] [color:#52675b] [&_small]:block [&_small]:mt-[5px] [&_small]:[font-size:9px] [&_small]:[color:#939c96]">
            <Icon name="shield" />
            <div>
              Design preview<small>Admin services coming soon</small>
            </div>
          </div>
          <Link href="/">
            <Icon name="arrow-left" size={17} />
            Back to storefront
          </Link>
        </div>
      </aside>
      <section
        className="admin-workspace min-w-[0] [flex:1]"
        inert={mobileNavigation}
      >
        <header className="admin-topbar h-[82px] [background:#fff] [border-bottom:1px_solid_#e5e9e7] flex items-center justify-between p-[0_40px] [font-size:12px] [&_>_span_>_span]:m-[0_14px] [&_>_span_>_span]:[color:#bdc4bf] [&_>_div]:flex [&_>_div]:items-center [&_>_div]:gap-[13px] [&_b]:[font-size:11px] [&_b]:[font-weight:var(--font-weight-medium,_500)] max-[700.01px]:h-[60px] max-[700.01px]:p-[0_20px] max-[700.01px]:[&_b]:hidden">
          <span>
            Workspace <span>/</span> {active}
          </span>
          <div>
            <span className="admin-preview-pill [font-size:8px] tracking-[1px] [background:#f2efe7] [color:#9d8554] p-[6px_9px] rounded-[4px]">
              PREVIEW
            </span>
            <span className="admin-avatar [background:#e9efeb] rounded-[50%] p-[11px] [font-size:10px]">
              AB
            </span>
            <b>Store admin</b>
          </div>
        </header>
        <div className="admin-content max-w-[1560px] m-[auto] p-[38px_40px_20px] max-[1150.01px]:p-[30px_24px] max-[700.01px]:p-[25px_16px]">
          <div className="admin-page-title flex justify-between items-center mb-[30px] [&_.eyebrow]:[font-size:9px] [&_.eyebrow]:tracking-[1.7px] [&_.eyebrow]:[color:#8b958d] [&_h1]:[font-family:Georgia,_serif] [&_h1]:[font-size:34px] [&_h1]:[font-weight:var(--font-weight-normal,_400)] [&_h1]:m-[10px_0] [&_p]:[font-size:12px] [&_p]:[color:#88928c] max-[700.01px]:items-start max-[700.01px]:gap-[10px] max-[700.01px]:[&_h1]:[font-size:28px] max-[700.01px]:[&_p]:leading-[1.7]">
            <div>
              <span className="eyebrow block [font-size:10px] tracking-[0.24em] [font-weight:var(--font-weight-bold,_700)] mb-[17px]">
                YOUR STORE AT A GLANCE
              </span>
              <h1>{active === "Dashboard" ? "Store overview" : active}</h1>
              <p>
                {active === "Dashboard"
                  ? "A clearer view of your collection. All in one place."
                  : "Everything you need to manage your store, coming soon."}
              </p>
            </div>
            <Link
              href="/"
              className="admin-view-store flex gap-[16px] items-center [background:white] [border:1px_solid_#dce2dd] p-[12px_17px] rounded-[5px] [font-size:11px] max-[700.01px]:[font-size:9px] max-[700.01px]:whitespace-nowrap max-[700.01px]:p-[10px] max-[700.01px]:gap-[6px]"
            >
              View storefront <Icon name="arrow-right" size={17} />
            </Link>
          </div>
          {active !== "Dashboard" ? (
            <div className="admin-coming-soon flex flex-col items-center justify-center text-center min-h-[530px] [background:#fff] [border:1px_solid_#e2e7e1] rounded-[10px] p-[35px] [&_>_span]:[background:#eff4ef] [&_>_span]:p-[25px] [&_>_span]:rounded-[50%] [&_>_span]:[color:#69846e] [&_>_span]:mb-[25px] [&_h2]:[font-family:Georgia,_serif] [&_h2]:[font-size:32px] [&_h2]:[font-weight:var(--font-weight-normal,_400)] [&_h2]:m-[14px_0] [&_>_p]:[color:#899689] [&_>_p]:[font-size:12px] [&_>_p]:leading-[1.8] [&_button]:mt-[25px] [&_button]:gap-[20px] [&_button]:flex [&_button]:items-center [&_>_p:not(.eyebrow)]:max-w-[480px]">
              <span>
                <Icon
                  name={navigation.find((n) => n.label === active)!.icon}
                  size={32}
                />
              </span>
              <p className="eyebrow block [font-size:10px] tracking-[0.24em] [font-weight:var(--font-weight-bold,_700)] mb-[17px]">
                ON THE WAY
              </p>
              <h2>{active} is coming soon.</h2>
              <p>{activeGroup?.description} This section is being prepared.</p>
              <button
                className="dark-button [background:#222321] [color:white] inline-flex items-center justify-center p-[16px_21px] [font-size:11px] [font-weight:var(--font-weight-bold,_700)] tracking-[0.09em] text-center [border:1px_solid_#222321] [transition:background_0.2s] [&:hover]:[background:#484b48]"
                onClick={() => setActive("Dashboard")}
              >
                BACK TO DASHBOARD <Icon name="arrow-right" size={17} />
              </button>
            </div>
          ) : (
            <>
              <div className="admin-welcome flex justify-between items-center [background:#234b3c] [color:#fff] p-[31px_34px] rounded-[10px] mb-[24px] overflow-hidden [&_>_svg]:opacity-[0.35] [&_>_svg]:mr-[25px] [&_>_svg]:[transform:rotate(-12deg)] [&_span]:[font-size:8px] [&_span]:tracking-[2px] [&_span]:[color:#bacabe] [&_h2]:[font-family:Georgia,_serif] [&_h2]:[font-weight:var(--font-weight-normal,_400)] [&_h2]:[font-size:27px] [&_h2]:m-[13px_0] [&_p]:[font-size:11px] [&_p]:[color:#bed0c5] max-[700.01px]:p-[25px] max-[700.01px]:[&_h2]:[font-size:24px] max-[700.01px]:[&_p]:leading-[1.8] max-[700.01px]:[&_>_svg]:hidden">
                <div>
                  <span>THE AURA BOED CATALOGUE</span>
                  <h2>Your collection, thoughtfully organised.</h2>
                  <p>
                    Explore your products and see what is ready for the next
                    chapter.
                  </p>
                </div>
                <Icon name="bag" size={64} />
              </div>
              <div className="admin-stats grid grid-cols-[repeat(4,_1fr)] gap-[18px] mb-[26px] [&_article]:[background:#fff] [&_article]:[border:1px_solid_#e6eae7] [&_article]:rounded-[8px] [&_article]:p-[23px] [&_article_>_div]:flex [&_article_>_div]:items-center [&_article_>_div]:justify-between [&_article_>_div]:[font-size:11px] [&_article_>_div]:[color:#7a887e] [&_article_svg]:[color:#779580] [&_strong]:block [&_strong]:[font-size:32px] [&_strong]:[font-weight:var(--font-weight-medium,_500)] [&_strong]:m-[19px_0_10px] [&_small]:[font-size:10px] [&_small]:[color:#939c95] max-[1150.01px]:gap-[12px] max-[1150.01px]:[&_article]:p-[17px] max-[700.01px]:grid-cols-[repeat(2,_1fr)] max-[700.01px]:[&_small]:[font-size:9px]">
                {[
                  {
                    label: "Total products",
                    value: products.length,
                    note: "Imported from your catalogue",
                    icon: "bag",
                  },
                  {
                    label: "With photography",
                    value: pictured,
                    note: `${products.length - pictured} awaiting images`,
                    icon: "grid-four",
                  },
                  {
                    label: "Collections",
                    value: categories.length,
                    note: "Storefront categories",
                    icon: "bookmark",
                  },
                  {
                    label: "Prices pending",
                    value: products.filter((p) => p.price === null).length,
                    note: "Pricing has not been supplied",
                    icon: "sliders",
                  },
                ].map((stat) => (
                  <article key={stat.label}>
                    <div>
                      {stat.label}
                      <Icon name={stat.icon as IconName} size={19} />
                    </div>
                    <strong>{stat.value}</strong>
                    <small>{stat.note}</small>
                  </article>
                ))}
              </div>
              <div className="admin-dashboard-grid grid grid-cols-[minmax(0,_1.8fr)_minmax(250px,_1fr)] gap-[24px] max-[1150.01px]:grid-cols-[1fr]">
                <section className="admin-card [background:#fff] [border:1px_solid_#e4e9e5] rounded-[9px] overflow-hidden [&_table]:[border-collapse:collapse] [&_table]:w-[100%] [&_table]:text-left [&_th]:[font-size:9px] [&_th]:[font-weight:var(--font-weight-medium,_500)] [&_th]:[text-transform:uppercase] [&_th]:tracking-[1px] [&_th]:[background:#fbfcfa] [&_th]:p-[14px_20px] [&_th]:[color:#8a958d] [&_td]:p-[14px_20px] [&_td]:[border-top:1px_solid_#f0f2ef] [&_td]:[font-size:10px] [&_td]:[color:#7a877e] [&_td:first-child]:w-[57%] [&_td_a]:flex [&_td_a]:items-center [&_td_a]:gap-[12px] [&_td_a]:min-w-[190px] [&_td_a]:[color:#354b3c] [&_td_a]:leading-[1.6] [&_td_img]:h-[49px] [&_td_img]:w-[40px] [&_td_img]:object-cover [&_td_img]:[background:#f0eee9] [&_td_img]:rounded-[4px] [&_td_img]:[flex-shrink:0] max-[1150.01px]:[&_td:first-child]:w-[60%]">
                  <div className="admin-card-heading flex gap-[12px] items-center justify-between p-[24px] [border-bottom:1px_solid_#eef0ed] [&_h2]:[font-size:14px] [&_h2]:[font-weight:var(--font-weight-semibold,_600)] [&_h2]:m-[0_0_7px] [&_p]:[font-size:10px] [&_p]:[color:#939d96] [&_p]:m-[0] max-[700.01px]:p-[19px]">
                    <div>
                      <h2>Product catalogue</h2>
                      <p>Your real products and imagery</p>
                    </div>
                    <label className="admin-search flex items-center gap-[8px] [border:1px_solid_#e5e9e5] p-[9px] rounded-[5px] [color:#95a198] [&_input]:[border:0] [&_input]:[outline:0] [&_input]:w-[110px] [&_input]:[font-size:10px] [&_input]:[background:none] max-[700.01px]:[&_input]:w-[85px]">
                      <Icon name="search" size={17} />
                      <input
                        aria-label="Search catalogue"
                        placeholder="Find a product..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="admin-table-scroll overflow-auto">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Collection</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <Link href={`/products/${p.slug}`}>
                                {p.image ? (
                                  <img src={p.image} alt="" />
                                ) : (
                                  <span className="admin-no-image h-[49px] w-[40px] object-cover [background:#f0eee9] rounded-[4px] [flex-shrink:0] grid [place-items:center]">
                                    <Icon name="bag" />
                                  </span>
                                )}
                                <span>{p.name}</span>
                              </Link>
                            </td>
                            <td>{categoryNames[p.category]}</td>
                            <td>
                              <span
                                className={`admin-status inline-block whitespace-nowrap [font-size:8px] p-[5px_8px] [background:#edf5ef] [color:#5a8265] rounded-[4px] [&.pending]:[background:#faf3e6] [&.pending]:[color:#ad8c4c] ${p.image ? "" : "pending"}`}
                              >
                                {p.image ? "Image available" : "Needs image"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!selected.length && (
                      <p className="admin-empty p-[30px] [color:#879387] [font-size:12px]">
                        No products match your search.
                      </p>
                    )}
                  </div>
                </section>
                <section className="admin-card [background:#fff] [border:1px_solid_#e4e9e5] rounded-[9px] overflow-hidden [&_table]:[border-collapse:collapse] [&_table]:w-[100%] [&_table]:text-left [&_th]:[font-size:9px] [&_th]:[font-weight:var(--font-weight-medium,_500)] [&_th]:[text-transform:uppercase] [&_th]:tracking-[1px] [&_th]:[background:#fbfcfa] [&_th]:p-[14px_20px] [&_th]:[color:#8a958d] [&_td]:p-[14px_20px] [&_td]:[border-top:1px_solid_#f0f2ef] [&_td]:[font-size:10px] [&_td]:[color:#7a877e] [&_td:first-child]:w-[57%] [&_td_a]:flex [&_td_a]:items-center [&_td_a]:gap-[12px] [&_td_a]:min-w-[190px] [&_td_a]:[color:#354b3c] [&_td_a]:leading-[1.6] [&_td_img]:h-[49px] [&_td_img]:w-[40px] [&_td_img]:object-cover [&_td_img]:[background:#f0eee9] [&_td_img]:rounded-[4px] [&_td_img]:[flex-shrink:0] max-[1150.01px]:[&_td:first-child]:w-[60%]">
                  <div className="admin-card-heading flex gap-[12px] items-center justify-between p-[24px] [border-bottom:1px_solid_#eef0ed] [&_h2]:[font-size:14px] [&_h2]:[font-weight:var(--font-weight-semibold,_600)] [&_h2]:m-[0_0_7px] [&_p]:[font-size:10px] [&_p]:[color:#939d96] [&_p]:m-[0] max-[700.01px]:p-[19px]">
                    <div>
                      <h2>Collection breakdown</h2>
                      <p>Pieces across your store</p>
                    </div>
                  </div>
                  <div className="admin-collections p-[8px_24px] [&_a]:block [&_a]:m-[19px_0] [&_a_>_div:first-child]:flex [&_a_>_div:first-child]:justify-between [&_a_>_div:first-child]:[font-size:11px] [&_a_>_div:first-child]:[color:#748579] [&_a_>_div:first-child]:mb-[9px] [&_b]:[font-weight:var(--font-weight-medium,_500)]">
                    {categories.map(([key, label]) => {
                      const count = products.filter(
                        (p) => p.category === key,
                      ).length;
                      return (
                        <Link key={key} href={`/collections/${key}`}>
                          <div>
                            <span>{label}</span>
                            <b>{count}</b>
                          </div>
                          <div className="admin-bar h-[4px] rounded-[4px] [background:#eef2ee] overflow-hidden [&_span]:block [&_span]:h-[100%] [&_span]:[background:#739881] [&_span]:rounded-[4px]">
                            <span
                              style={{
                                width: `${(count / products.length) * 100}%`,
                              }}
                            />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <p className="admin-catalog-note m-[20px_24px] [font-size:10px] [color:#9aa299] leading-[1.8]">
                    Prices, sizes and stock are awaiting confirmation. No sales
                    or customer data is connected.
                  </p>
                </section>
              </div>
              <div className="admin-readiness flex items-center gap-[17px] p-[22px_25px] [border:1px_solid_#e0e6df] [background:#f0f3ed] rounded-[8px] mt-[25px] [color:#70856c] [&_h3]:[font-size:12px] [&_h3]:m-[0_0_8px] [&_h3]:[font-weight:var(--font-weight-medium,_500)] [&_p]:[font-size:10px] [&_p]:m-[0] [&_p]:leading-[1.8] [&_p]:[color:#8c9987] max-[700.01px]:p-[18px] max-[700.01px]:[&_>_svg]:[flex-shrink:0]">
                <Icon name="shield" size={24} />
                <div>
                  <h3>A little preparation goes a long way.</h3>
                  <p>
                    {products.filter((p) => p.needsReview).length} products
                    flagged for review. Confirm photography, pricing and
                    availability before taking orders.
                  </p>
                </div>
              </div>
            </>
          )}
          <footer className="admin-footer flex justify-between [border-top:1px_solid_#e2e7e1] p-[23px_0_0] mt-[35px] [font-size:10px] [color:#849081] [&_span]:[color:#a1aaa1] max-[700.01px]:[&_span]:max-w-[150px] max-[700.01px]:[&_span]:text-right max-[700.01px]:[&_span]:leading-[1.6]">
            Aura BOED <span>Considered design. Everyday clarity.</span>
          </footer>
        </div>
      </section>
    </div>
  );
}
