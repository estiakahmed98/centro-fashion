export const STOREFRONT_PAGE_SIZE = 24;

/** A bounded list even for catalogs with thousands of pages. */
export function storefrontPaginationItems(page: number, totalPages: number): Array<number | string> {
  const total = Math.max(1, Math.floor(totalPages));
  const current = Math.min(total, Math.max(1, Math.floor(page)));
  const numbers = [...new Set([1, 2, 3, 4, current - 1, current, current + 1, total - 1, total])]
    .filter(value => value >= 1 && value <= total).sort((a, b) => a - b);
  const items: Array<number | string> = [];
  for (const value of numbers) {
    const previous = items.at(-1);
    if (typeof previous === "number" && value - previous === 2) items.push(previous + 1);
    else if (typeof previous === "number" && value - previous > 2) items.push(`gap-${previous}`);
    items.push(value);
  }
  return items;
}
export function storefrontPage(value: unknown) {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100_000) : 1;
}
