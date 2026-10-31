export type CentroProduct = {
  categories: Array<{ name: string; slug: string }>;
  product: {
    name: string; slug: string; sku: string; type: string; description: string;
    basePrice: number; currency: string; image: string; gallery: string[];
    available: boolean; featured: boolean;
  };
  variants: Array<{
    sku: string; price: number; currency: string; stock: number;
    active: boolean; isDefault: boolean;
    options: { __meta: Record<string, string | boolean | string[]> };
  }>;
  review: Record<string, string | boolean | string[]>;
};
export const CENTRO_CATEGORIES: Record<string, string>;
export const CENTRO_REVIEWED_IMAGES: Array<{ id: string; category: string; name: string; role: string }>;
export function centroMediaPath(file: string, root?: string): string;
export function normalizeCentroCatalog(source: unknown, root?: string): CentroProduct[];
export function loadCentroCatalog(root?: string): CentroProduct[];
