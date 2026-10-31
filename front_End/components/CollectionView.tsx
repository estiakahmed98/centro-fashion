"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { Icon } from "./Icons";
import {
  subcollections,
  type CollectionPage,
  categoryNames,
  categoryDescription,
} from "@/lib/products";

import type { ProductPage, CatalogQuery } from "@/lib/commerce-types";
import { fetchCatalogue } from "@/lib/commerce-browser";
import { useStore } from "./StoreProvider";

type Sort = "featured" | "price-asc" | "price-desc" | "az";
const colorStyles: Record<string, string> = {
  beige: "dot-beige [background:#bcb09b]",
  grey: "dot-grey [background:#8c8f8b]",
  navy: "dot-navy [background:#293e56]",
  brown: "dot-brown [background:#7b5b46]",
  black: "dot-black [background:#292929]",
  blue: "dot-blue [background:#7195aa]",
  cream: "dot-cream [background:#e9e4d9]",
  olive: "dot-olive [background:#79846b]",
};
const SEASONS = ["Spring / Summer", "Autumn / Winter", "All Season"];

type Props = {
  category: CollectionPage;
  initialPage: ProductPage;
  initialQuery: CatalogQuery;
};
export function CollectionView({ category, initialPage, initialQuery }: Props) {
  const { registerProducts } = useStore();
  const [page, setPage] = useState(initialPage);
  const [pageNumber, setPageNumber] = useState(initialQuery.page || 1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const COLORS = initialPage.filters.colors;
  const SIZES = initialPage.filters.sizes;
  const [sort, setSort] = useState<Sort>(initialQuery.sort || "featured");
  const [grid, setGrid] = useState<1 | 2 | 4>(4);
  const [filterOpen, setFilterOpen] = useState(false);
  const [colors, setColors] = useState<string[]>(initialQuery.colors || []);
  const [sizes, setSizes] = useState<string[]>(initialQuery.sizes || []);
  const [seasons, setSeasons] = useState<string[]>(initialQuery.seasons || []);
  const [minPrice, setMinPrice] = useState(
    initialQuery.minPrice?.toString() || "",
  );
  const [maxPrice, setMaxPrice] = useState(
    initialQuery.maxPrice?.toString() || "",
  );
  const [quickFilter, setQuickFilter] = useState("");
  const isSuits = category === "suits";
  const shown = page.products;
  const query = useMemo<CatalogQuery>(
    () => ({
      category,
      sort,
      colors: COLORS.includes(quickFilter) ? [quickFilter] : colors,
      sizes,
      seasons:
        SEASONS.includes(quickFilter) && quickFilter !== "All Season"
          ? [quickFilter]
          : seasons,
      minPrice: minPrice === "" ? undefined : Number(minPrice),
      maxPrice: maxPrice === "" ? undefined : Number(maxPrice),
      q: initialQuery.q,
      group: initialQuery.group,
      page: pageNumber,
      limit: initialQuery.limit || 24,
    }),
    [
      category,
      sort,
      colors,
      sizes,
      seasons,
      minPrice,
      maxPrice,
      quickFilter,
      pageNumber,
      initialQuery.q,
      initialQuery.group,
      initialQuery.limit,
      COLORS,
    ],
  );
  const filtersKey = JSON.stringify({ ...query, page: undefined });
  const previousFilters = useRef(filtersKey);
  const initialRequest = useRef(true);
  useEffect(() => {
    registerProducts(page.products);
  }, [page.products, registerProducts]);
  useEffect(() => {
    if (previousFilters.current !== filtersKey) {
      previousFilters.current = filtersKey;
      if (pageNumber !== 1) {
        setPageNumber(1);
        return;
      }
    }
    if (initialRequest.current) {
      initialRequest.current = false;
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");
    const timer = setTimeout(() => {
      void fetchCatalogue(query, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) setPage(result);
        })
        .catch(() => {
          if (!controller.signal.aborted)
            setLoadError(
              "The collection could not be loaded. Please adjust your filters or try again.",
            );
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, filtersKey, pageNumber]);
  const activeCount =
    colors.length +
    sizes.length +
    seasons.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (quickFilter ? 1 : 0);
  const resetFilters = () => {
    setColors([]);
    setSizes([]);
    setSeasons([]);
    setMinPrice("");
    setMaxPrice("");
    setQuickFilter("");
  };
  const toggle = (
    value: string,
    values: string[],
    setter: (items: string[]) => void,
  ) =>
    setter(
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    );
  const countSubcollection = (tag: string) =>
    tag === "All" || tag === "All Season"
      ? page.filters.total
      : page.filters.colorCounts[tag] || page.filters.seasonCounts[tag] || 0;
  return (
    <>
      <div className="collection-top pt-[30px] [&_h1]:text-center [&_h1]:[font-size:37px] [&_h1]:[font-weight:var(--font-weight-normal,_400)] [&_h1]:leading-[1.3] [&_h1]:m-[0_0_34px] max-[800.01px]:pt-[21px] max-[800.01px]:[&_h1]:[font-size:33px] max-[800.01px]:[&_h1]:mb-[24px] max-[520.01px]:[&_h1]:[font-size:31px]">
        <h1>{categoryNames[category]}</h1>
        {isSuits ? (
          <div
            className="subcategory-scroll flex items-center justify-center gap-[24px] [overflow-x:auto] [scrollbar-width:none] whitespace-nowrap p-[0_20px_35px] min-h-[47px] [&::-webkit-scrollbar]:hidden [&_button]:[font-size:12px] [&_button]:p-[5px_0] [&_button]:[color:#444] [&_button:hover]:[text-decoration:underline] [&_button:hover]:[text-underline-offset:6px] [&_.selected-subcategory]:[text-decoration:underline] [&_.selected-subcategory]:[text-underline-offset:6px] [&_span]:[color:#a5a4a2] [&_span]:[font-size:11px] [&_span]:ml-[2px] max-[1550.01px]:[justify-content:flex-start] max-[800.01px]:pb-[25px] max-[800.01px]:gap-[20px] max-[520.01px]:gap-[20px] max-[520.01px]:[&_button]:[font-size:11px]"
            aria-label="Suits subcollections"
          >
            {subcollections.map(({ label, tag }) => (
              <button
                key={label}
                className={quickFilter === tag ? "selected-subcategory" : ""}
                onClick={() => setQuickFilter(quickFilter === tag ? "" : tag)}
              >
                {label} <span>{countSubcollection(tag)}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="collection-description text-center max-w-[640px] m-[0_auto_36px] [color:#75716e] [font-size:14px] leading-[1.8]">
            {categoryDescription[category]}
          </p>
        )}
      </div>

      <div className="collection-toolbar flex items-center justify-between gap-[20px] p-[0_18px_25px] [color:#6d6d6a] [font-size:12px] min-h-[55px] max-[800.01px]:p-[5px_13px_18px] max-[520.01px]:p-[6px_11px_16px] max-[520.01px]:gap-[6px]">
        <span className="count-products max-[520.01px]:[font-size:11px]">
          {page.pagination.total} product
          {page.pagination.total === 1 ? "" : "s"}
        </span>
        <div className="collection-controls flex items-center gap-[11px] [&_select]:[border:0] [&_select]:[color:#62615f] [&_select]:[background:transparent] [&_select]:min-w-[155px] [&_select]:cursor-pointer [&_select]:[outline-offset:5px] [&_select]:[font-size:12px] [&_select]:p-[4px_10px_4px_0] max-[520.01px]:gap-[5px] max-[520.01px]:[&_>_label]:hidden max-[520.01px]:[&_select]:min-w-[105px] max-[520.01px]:[&_select]:max-w-[110px] max-[520.01px]:[&_select]:[font-size:11px] max-[520.01px]:[&_.filter-trigger]:[font-size:11px] max-[520.01px]:[&_.filter-trigger]:ml-[0]">
          <label htmlFor="collection-sort">Sort by:</label>
          <select
            id="collection-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="az">Alphabetically, A–Z</option>
          </select>
          <button
            className="filter-trigger inline-flex items-center gap-[9px] p-[4px_0] ml-[26px] [color:#666] max-[800.01px]:ml-[5px]"
            onClick={() => setFilterOpen(true)}
          >
            Filter {activeCount > 0 ? `(${activeCount})` : ""}
            <Icon name="sliders" size={17} />
          </button>
          <span className="grid-controls flex gap-[9px] ml-[41px] [&_button]:p-[0] [&_button]:[color:#bbb] [&_button.active-grid]:[color:#222] max-[800.01px]:ml-[10px] max-[800.01px]:[&_button:first-child]:hidden max-[520.01px]:ml-[5px] max-[520.01px]:gap-[5px] max-[520.01px]:[&_button:last-child]:hidden">
            <button
              aria-label="Four columns"
              className={grid === 4 ? "active-grid" : ""}
              onClick={() => setGrid(4)}
            >
              <Icon name="grid-four" size={20} />
            </button>
            <button
              aria-label="Two columns"
              className={grid === 2 ? "active-grid" : ""}
              onClick={() => setGrid(2)}
            >
              <Icon name="grid-two" size={20} />
            </button>
            <button
              aria-label="Single column"
              className={grid === 1 ? "active-grid" : ""}
              onClick={() => setGrid(1)}
            >
              <Icon name="grid-one" size={20} />
            </button>
          </span>
        </div>
      </div>

      {activeCount > 0 && (
        <div className="filter-chips p-[0_18px_22px] flex [flex-wrap:wrap] items-center gap-[9px] [&_span]:[font-size:10px] [&_span]:tracking-[0.1em] [&_span]:mr-[5px] [&_button]:[border:1px_solid_#d5d3ce] [&_button]:p-[7px_10px] [&_button]:[font-size:11px] [&_.clear-all]:[text-decoration:underline] [&_.clear-all]:[border:0] max-[520.01px]:p-[0_10px_18px]">
          <span>ACTIVE FILTERS</span>
          {colors.map((v) => (
            <button key={v} onClick={() => toggle(v, colors, setColors)}>
              {v} ×
            </button>
          ))}
          {sizes.map((v) => (
            <button key={v} onClick={() => toggle(v, sizes, setSizes)}>
              Size {v} ×
            </button>
          ))}
          {seasons.map((v) => (
            <button key={v} onClick={() => toggle(v, seasons, setSeasons)}>
              {v} ×
            </button>
          ))}
          {quickFilter && (
            <button onClick={() => setQuickFilter("")}>
              Collection: {quickFilter} ×
            </button>
          )}
          <button className="clear-all" onClick={resetFilters}>
            Clear all
          </button>
        </div>
      )}
      {loading && (
        <p role="status" className="px-6 pb-4 text-xs text-[var(--muted)]">
          Loading the collection...
        </p>
      )}
      {loadError && (
        <p role="alert" className="px-6 pb-4 text-xs text-[#9e3430]">
          {loadError}
        </p>
      )}
      {!loadError && shown.length ? (
        <div
          className={`collection-product-grid grid p-[0_18px] gap-[2px] grid-cols-[repeat(4,_minmax(0,_1fr))] [&.grid-2]:grid-cols-[repeat(2,_minmax(0,_1fr))] [&.grid-2]:gap-[12px] [&.grid-1]:grid-cols-[minmax(0,_640px)] [&.grid-1]:justify-center [&_.product-meta]:pl-[3px] [&_.product-meta]:pr-[10px] max-[800.01px]:grid-cols-[repeat(2,_minmax(0,_1fr))] max-[800.01px]:p-[0_10px] max-[800.01px]:gap-[8px] max-[800.01px]:[&.grid-4]:grid-cols-[repeat(2,_minmax(0,_1fr))] max-[800.01px]:[&.grid-2]:gap-[8px] max-[800.01px]:[&.grid-1]:grid-cols-[minmax(0,_580px)] max-[520.01px]:p-[0_6px] max-[520.01px]:gap-[6px] max-[520.01px]:[&.grid-2]:gap-[6px] grid-${grid}`}
        >
          {shown.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      ) : (
        <div className="no-results text-center p-[90px_20px] [&_h2]:[font-family:var(--serif)] [&_h2]:[font-size:36px] [&_h2]:[font-weight:var(--font-weight-normal,_400)] [&_p]:[color:var(--muted)] [&_button]:mt-[20px]">
          <h2>No pieces match your selection.</h2>
          <p>Try adjusting your filters to discover more of the collection.</p>
          <button
            className="dark-button [background:#222321] [color:white] inline-flex items-center justify-center p-[16px_21px] [font-size:11px] [font-weight:var(--font-weight-bold,_700)] tracking-[0.09em] text-center [border:1px_solid_#222321] [transition:background_0.2s] [&:hover]:[background:#484b48]"
            onClick={resetFilters}
          >
            CLEAR ALL FILTERS
          </button>
        </div>
      )}
      <div className="collection-end text-center p-[53px_15px_100px] [&_>_span]:[font-size:10px] [&_>_span]:tracking-[0.13em] [&_>_a]:inline-flex [&_>_a]:gap-[8px] [&_>_a]:items-center [&_>_a]:[border:1px_solid_#333] [&_>_a]:p-[12px_20px] [&_>_a]:[font-size:11px] [&_>_a]:tracking-[0.1em]">
        <span>
          YOU'VE VIEWED{" "}
          {Math.min(
            page.pagination.total,
            (page.pagination.page - 1) * page.pagination.limit + shown.length,
          )}{" "}
          OF {page.pagination.total} PRODUCTS
        </span>
        <div className="progress-line h-[2px] w-[190px] [background:#ddd] m-[16px_auto_25px] [&_div]:h-[100%] [&_div]:[background:#1b1b1b]">
          <progress
            aria-label="Catalogue progress"
            value={Math.min(
              page.pagination.total,
              (page.pagination.page - 1) * page.pagination.limit + shown.length,
            )}
            max={Math.max(1, page.pagination.total)}
            className="block h-full w-full appearance-none border-0 [&::-webkit-progress-bar]:bg-[#ddd] [&::-webkit-progress-value]:bg-[#1b1b1b] [&::-moz-progress-bar]:bg-[#1b1b1b]"
          />
        </div>
        {page.pagination.pages > 1 && (
          <nav
            aria-label="Collection pages"
            className="mb-6 flex items-center justify-center gap-4 text-xs"
          >
            <button
              disabled={loading || pageNumber <= 1}
              onClick={() => setPageNumber((n) => n - 1)}
            >
              PREVIOUS
            </button>
            <span>
              Page {pageNumber} of {page.pagination.pages}
            </span>
            <button
              disabled={loading || pageNumber >= page.pagination.pages}
              onClick={() => setPageNumber((n) => n + 1)}
            >
              NEXT
            </button>
          </nav>
        )}
        <Link href="/">
          BACK TO HOME <Icon name="arrow-right" size={15} />
        </Link>
      </div>
      <div className="collection-seo [background:#f9f8f6] p-[78px_25px] text-center [&_h2]:[font-family:var(--serif)] [&_h2]:[font-size:45px] [&_h2]:[font-weight:var(--font-weight-normal,_400)] [&_h2]:mb-[13px] [&_p]:[font-size:14px] [&_p]:leading-[1.9] [&_p]:[color:#777] [&_p]:max-w-[650px] [&_p]:m-[0_auto]">
        <span className="eyebrow block [font-size:10px] tracking-[0.24em] [font-weight:var(--font-weight-bold,_700)] mb-[17px]">
          THE Aura BOED COLLECTION
        </span>
        <h2>{categoryNames[category]} for Modern Living</h2>
        <p>
          {categoryDescription[category]} Inspired by classic forms, designed
          for the contemporary wardrobe, and made to balance style with comfort.
        </p>
      </div>

      {filterOpen && (
        <>
          <button
            className="drawer-backdrop fixed inset-[0] w-[100%] h-[100%] [background:#0007] z-[90] cursor-default"
            aria-label="Close filters"
            onClick={() => setFilterOpen(false)}
          />
          <aside
            className="filter-drawer fixed right-[0] top-[0] bottom-[0] w-[min(480px,_100vw)] h-[100dvh] [background:#fff] z-[95] [transform:translateX(0)] [transition:transform_0.3s_ease] flex flex-col [box-shadow:-5px_0_20px_#00000012]"
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
          >
            <div className="drawer-head flex items-center justify-between p-[24px_25px] [border-bottom:1px_solid_var(--line)] [flex:0_0_auto] [&_h2]:[font-size:19px] [&_h2]:[font-weight:var(--font-weight-medium,_500)] [&_h2]:m-[0] [&_button]:flex [&_button]:items-center [&_button]:justify-center">
              <h2>Filter</h2>
              <button
                aria-label="Close filters"
                onClick={() => setFilterOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="filter-body overflow-auto [flex:1] p-[0_26px]">
              <FilterSection title="Color">
                <div className="filter-colors grid grid-cols-[1fr_1fr] gap-[14px] [&_label]:flex [&_label]:items-center [&_label]:gap-[9px] [&_label]:[font-size:12px] [&_label]:cursor-pointer [&_input]:[accent-color:#242424]">
                  {COLORS.map((c) => (
                    <label key={c}>
                      <input
                        type="checkbox"
                        checked={colors.includes(c)}
                        onChange={() => toggle(c, colors, setColors)}
                      />
                      <span
                        className={`color-dot w-[14px] h-[14px] rounded-[50%] inline-block [border:1px_solid_#bfbdb7] ${colorStyles[c.toLowerCase()] || ""}`}
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
              <FilterSection title="Size">
                <div className="filter-sizes grid grid-cols-[repeat(5,_1fr)] gap-[8px] [&_input]:absolute [&_input]:opacity-[0] [&_label]:relative [&_label]:text-center [&_label]:cursor-pointer [&_label]:[border:1px_solid_#dedbd7] [&_label]:p-[9px_1px] [&_label]:[font-size:12px] [&_label:has(input:checked)]:[background:#292929] [&_label:has(input:checked)]:[color:white] [&_label:has(input:checked)]:[border-color:#292929] [&_label:has(input:focus-visible)]:[outline:2px_solid_#4b6b88] [&_label:has(input:focus-visible)]:[outline-offset:2px]">
                  {SIZES.map((s) => (
                    <label key={s}>
                      <input
                        type="checkbox"
                        checked={sizes.includes(s)}
                        onChange={() => toggle(s, sizes, setSizes)}
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
              {!SIZES.length && (
                <p className="text-xs text-[var(--muted)]">
                  Verified sizes will be added soon.
                </p>
              )}
              <FilterSection title="Price (BDT)">
                <div className="price-inputs flex gap-[15px] [&_label]:[flex:1] [&_label]:[font-size:11px] [&_label]:[color:#888] [&_input]:block [&_input]:mt-[7px] [&_input]:[border:1px_solid_#ccc] [&_input]:w-[100%] [&_input]:p-[11px] [&_input]:[color:#333]">
                  <label>
                    From
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </label>
                  <label>
                    To
                    <input
                      type="number"
                      min="0"
                      placeholder="50000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </label>
                </div>
              </FilterSection>
              <FilterSection title="Season">
                <div className="filter-checks [&_input]:[accent-color:#242424] grid gap-[15px] [&_label]:flex [&_label]:items-center [&_label]:gap-[12px] [&_label]:[font-size:12px]">
                  {SEASONS.map((s) => (
                    <label key={s}>
                      <input
                        type="checkbox"
                        checked={seasons.includes(s)}
                        onChange={() => toggle(s, seasons, setSeasons)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </FilterSection>
            </div>
            <div className="filter-footer p-[18px_25px] [border-top:1px_solid_var(--line)] flex items-center justify-between gap-[25px] [&_.dark-button]:[flex:1]">
              <button
                className="reset-button [text-decoration:underline] [font-size:12px]"
                onClick={resetFilters}
              >
                Reset filters
              </button>
              <button
                className="dark-button [background:#222321] [color:white] inline-flex items-center justify-center p-[16px_21px] [font-size:11px] [font-weight:var(--font-weight-bold,_700)] tracking-[0.09em] text-center [border:1px_solid_#222321] [transition:background_0.2s] [&:hover]:[background:#484b48]"
                onClick={() => setFilterOpen(false)}
              >
                SHOW {shown.length} PRODUCTS
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="filter-section p-[0_0_23px] [border-bottom:1px_solid_#e4e2dd]">
      <button
        className="filter-section-title w-[100%] flex items-center justify-between p-[23px_0_18px] [font-size:14px] font-semibold"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {title}
        <Icon name={open ? "minus" : "plus"} size={17} />
      </button>
      {open && children}
    </section>
  );
}
