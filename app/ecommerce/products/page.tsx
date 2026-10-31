import { cache } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EditorialCatalog } from "@/components/ecommarce/fashion/EditorialCatalog";
import { catalogCanonicalUrl, catalogUrl, getStorefrontCatalog, getStorefrontCatalogFacets, isIndexableCatalogView, parseCatalogFilters, type CatalogSearchParams } from "@/lib/storefront-catalog";
import { getSiteSettingsForSeo } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
const getSeoFacets = cache(getStorefrontCatalogFacets);
type ProductsPageProps = { searchParams: Promise<CatalogSearchParams> };
export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const [filters, settings, facets] = await Promise.all([
    searchParams.then(parseCatalogFilters),
    getSiteSettingsForSeo(),
    getSeoFacets(),
  ]);
  const t = await getTranslations("StorefrontCatalog.page");
  const category = facets.categories.find((item) => item.slug === filters.category || String(item.id) === filters.category);
  const brand = filters.brands.length === 1 ? facets.brands.find((item) => item.slug === filters.brands[0]) : undefined;
  const normalized = { ...filters, category: category?.slug ?? filters.category };
  const qualifier = filters.q
    ? t("metadata.searchResults", { query: filters.q })
    : filters.category
      ? t("metadata.categoryProducts", { category: category?.name ?? filters.category.replaceAll("-", " ") })
      : brand ? t("metadata.categoryProducts", { category: brand.name }) : t("allProducts");

  return {
    title: { absolute: `${qualifier} — ${settings.siteTitle}` },
    description:
      t("metadata.description", { site: category?.name || brand?.name ? `${settings.siteTitle}: ${category?.name ?? brand?.name}` : settings.siteTitle }),
    alternates: {
      canonical: catalogCanonicalUrl(normalized),
    },
    robots: isIndexableCatalogView(normalized) && (!filters.category || Boolean(category?.productCount)) && (!filters.brands.length || Boolean(brand?.productCount))
      ? undefined
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
  };
}


export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const parsedFilters = parseCatalogFilters(await searchParams);
  const data = await getStorefrontCatalog(parsedFilters);
  if (catalogUrl(parsedFilters) !== catalogUrl(data.filters)) redirect(catalogUrl(data.filters));
  if (data.pagination.page > data.pagination.totalPages) redirect(catalogUrl(data.filters, { page: data.pagination.totalPages }));
  return <EditorialCatalog data={data} />;
}
