import Link from "next/link";
import { catalogUrl, type StorefrontCatalogData } from "@/lib/storefront-catalog";
import { ProductCard } from "./EditorialCard";
import { CatalogFilterClose, CatalogFilterDrawer } from "./CatalogFilterDrawer";
import { storefrontPaginationItems } from "@/lib/storefront-pagination";
import Form from "next/form";

export function EditorialCatalog({ data }: { data: StorefrontCatalogData }) {
  const { products, filters, facets, pagination } = data;
  const selected = facets.categories.find(category => category.slug === filters.category);
  const title = filters.q ? `Results for “${filters.q}”` : selected?.name || "The collection";
  return <main className="editorial-catalog">
    <div className="editorial-catalog-heading"><span className="editorial-kicker">THE AURA BOED WARDROBE</span><h1>{title}</h1><p>Considered pieces. Distinctive details. Find your everyday refinement.</p>
      <nav className="editorial-category-tabs" aria-label="Collections"><Link href="/ecommerce/products" aria-current={!filters.category ? "page" : undefined}>ALL PIECES</Link>{["Suits", "Jackets", "Shirts", "Trousers", "Knitwear", "Shoes", "Accessories", "Ladies Wear"].map(name => <Link key={name} aria-current={filters.category === name.toLowerCase().replaceAll(" ", "-") ? "page" : undefined} href={`/ecommerce/collections/${name.toLowerCase().replaceAll(" ", "-")}`}>{name.toUpperCase()}</Link>)}</nav>
    </div>
    <div className="editorial-catalog-body">
      <CatalogFilterDrawer>
      <Form action="/ecommerce/products" className="editorial-filters">
        <label>SEARCH<input name="q" type="search" defaultValue={filters.q} placeholder="Search pieces" /></label>
        <label>COLLECTION<select name="category" defaultValue={filters.category}><option value="">All collections</option>{facets.categories.filter(category => category.productCount > 0).map(category => <option key={category.id} value={category.slug}>{category.name}</option>)}</select></label>
        {facets.brands.length ? <label>BRANDS<select name="brand" multiple defaultValue={filters.brands}>{facets.brands.map(brand => <option key={brand.id} value={brand.slug}>{brand.name}</option>)}</select></label> : null}
        <label>PRODUCT TYPE<select name="type" defaultValue={filters.type}><option value="">All types</option><option value="PHYSICAL">Physical</option><option value="DIGITAL">Digital</option><option value="SERVICE">Service</option><option value="BUNDLE">Bundle</option></select></label>
        <label>SORT BY<select name="sort" defaultValue={filters.sort}><option value="relevance">Recommended</option><option value="newest">New arrivals</option><option value="popular">Popular</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name-asc">Name</option></select></label>
        <label>MINIMUM PRICE<input type="number" name="minPrice" min="0" step="0.01" defaultValue={filters.minPrice ?? ""} /></label>
        <label>MAXIMUM PRICE<input type="number" name="maxPrice" min="0" step="0.01" defaultValue={filters.maxPrice ?? ""} /></label>
        {facets.variantOptions.map(group => <label key={group.name}>{group.name.toUpperCase()}<select name={`variant_${group.name}`} defaultValue={filters.variants[group.name]?.[0] || ""}><option value="">All</option>{group.values.map(value => <option key={value.value} value={value.value}>{value.value} ({value.productCount})</option>)}</select></label>)}
        {facets.attributes.map(group => <label key={`attr_${group.id}`}>{group.name.toUpperCase()}<select name={`attr_${group.id}`} multiple defaultValue={filters.attributes[String(group.id)] || []}>{group.values.map(value => <option key={value.value} value={value.value}>{value.value} ({value.productCount})</option>)}</select></label>)}
        {facets.specificationGroups.map(group => <label key={group.key}>{group.label.toUpperCase()}<select name={`spec_${group.key}`} multiple defaultValue={filters.specifications[group.key] || []}>{group.values.map(value => <option key={value.value} value={value.value}>{value.value} ({value.productCount})</option>)}</select></label>)}
        <label><span><input type="checkbox" name="inStock" value="1" defaultChecked={filters.inStock} /> In stock only</span></label>
        <label><span><input type="checkbox" name="featured" value="1" defaultChecked={filters.featured} /> Featured pieces</span></label>
        <div className="editorial-filter-actions"><button type="submit">APPLY FILTERS</button><CatalogFilterClose asChild><Link href="/ecommerce/products">Clear filters</Link></CatalogFilterClose></div>
      </Form>
      </CatalogFilterDrawer>
      <div><div className="editorial-results-bar"><span>{pagination.total} pieces</span><span>Page {pagination.page} of {pagination.totalPages}</span></div>
        {products.length ? <div className="editorial-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="editorial-empty"><h2>No pieces found.</h2><p>Try another collection or adjust your filters.</p></div>}
        {pagination.totalPages > 1 ? <nav className="editorial-pagination" aria-label="Pagination">
          {pagination.page > 1 ? <Link rel="prev" href={catalogUrl(filters, { page: pagination.page - 1 })}>← Previous</Link> : <span aria-disabled="true">← Previous</span>}
          {storefrontPaginationItems(pagination.page, pagination.totalPages).map(item => typeof item === "number"
            ? <Link key={item} href={catalogUrl(filters, { page: item })} aria-label={`Page ${item}`} aria-current={item === pagination.page ? "page" : undefined}>{item}</Link>
            : <span key={item} className="editorial-pagination-gap" aria-hidden="true">…</span>)}
          {pagination.page < pagination.totalPages ? <><Link rel="next" href={catalogUrl(filters, { page: pagination.page + 1 })}>Next →</Link><Link href={catalogUrl(filters, { page: pagination.totalPages })} aria-label={`Last page, page ${pagination.totalPages}`}>Last</Link></> : <><span aria-disabled="true">Next →</span><span aria-disabled="true">Last</span></>}
        </nav> : null}
      </div>
    </div>
  </main>;
}
