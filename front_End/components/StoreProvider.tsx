"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  CartLine,
  CommerceCategory,
  CommerceVariant,
  Collection,
  DataSource,
  Product,
} from "@/lib/commerce-types";
import { canAddVariant } from "@/lib/commerce-adapter";
import { fetchCatalogue } from "@/lib/commerce-browser";
import {
  createDemoCartLine,
  canUpdateCartLine,
  cartLineUnitPrice,
  type DemoSelection,
} from "@/lib/commerce-cart";

type Shell = {
  products: Product[];
  categories: CommerceCategory[];
  collectionImages: Partial<Record<Collection, string>>;
  dataSource: DataSource;
  catalogueError: boolean;
};
type StoreContextValue = {
  cart: CartLine[];
  favorites: string[];
  cartOpen: boolean;
  setCartOpen: (value: boolean) => void;
  addToCart: (
    product: Product,
    variant: CommerceVariant | undefined,
    quantity?: number,
    selection?: DemoSelection,
  ) => string | null;
  updateQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  toggleFavorite: (id: string) => void;
  cartCount: number;
  cartSubtotal: number;
  products: Product[];
  registerProducts: (products: Product[]) => void;
  catalogue: Shell;
  cartError: string;
  checkoutReady: false;
  cartHydrated: boolean;
  clearDemoCart: () => void;
};
const StoreContext = createContext<StoreContextValue | null>(null);
const CART_STORAGE = "aura-commerce-cart-v2";
const FAVORITES_STORAGE = "boed-demo-favorites-v1";

export function StoreProvider({
  children,
  initialCatalogue,
}: {
  children: ReactNode;
  initialCatalogue: Shell;
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [cartError, setCartError] = useState("");
  const [cache, setCache] = useState<Record<string, Product>>(() =>
    Object.fromEntries(initialCatalogue.products.map((p) => [p.id, p])),
  );
  const registerProducts = useCallback((products: Product[]) => {
    setCache((current) => {
      if (products.every((p) => current[p.id] === p)) return current;
      return {
        ...current,
        ...Object.fromEntries(products.map((p) => [p.id, p])),
      };
    });
  }, []);
  useEffect(() => {
    registerProducts(initialCatalogue.products);
  }, [initialCatalogue.products, registerProducts]);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function restore() {
      try {
        const savedFavorites: unknown = JSON.parse(
          localStorage.getItem(FAVORITES_STORAGE) || "[]",
        );
        if (Array.isArray(savedFavorites))
          setFavorites(
            savedFavorites
              .filter((id): id is string => typeof id === "string")
              .slice(0, 100),
          );
        const raw: unknown = JSON.parse(
          localStorage.getItem(CART_STORAGE) || "[]",
        );
        if (!Array.isArray(raw) || !raw.length) return;
        const saved = raw
          .filter(
            (
              line,
            ): line is {
              productId: string;
              backendVariantId: number | null;
              size?: string;
              color?: string;
              quantity: number;
              dataSource: DataSource;
            } =>
              !!line &&
              typeof line === "object" &&
              typeof line.productId === "string" &&
              (line.dataSource === "local"
                ? line.backendVariantId === null
                : Number.isSafeInteger(line.backendVariantId)) &&
              Number.isSafeInteger(line.quantity) &&
              line.quantity > 0 &&
              line.dataSource === initialCatalogue.dataSource,
          )
          .slice(0, 48);
        if (!saved.length) return;
        const page = await fetchCatalogue(
          { ids: [...new Set(saved.map((line) => line.productId))], limit: 48 },
          controller.signal,
        );
        if (!active) return;
        registerProducts(page.products);
        const restored: CartLine[] = [];
        for (const line of saved) {
          const product = page.products.find((p) => p.id === line.productId);
          if (product?.dataSource === "local") {
            const demo = createDemoCartLine(product, line.quantity, {
              size:
                typeof line.size === "string" && line.size !== "Size to confirm"
                  ? line.size
                  : undefined,
              color: typeof line.color === "string" ? line.color : undefined,
            });
            if (demo && !restored.some((item) => item.key === demo.key))
              restored.push(demo);
            continue;
          }
          const variant = product?.variants.find(
            (v) => v.backendVariantId === line.backendVariantId,
          );
          if (
            !product ||
            !canAddVariant(product, variant, line.quantity) ||
            !variant
          )
            continue;
          const key = `${product.backendProductId}:${variant.backendVariantId}`;
          if (restored.some((item) => item.key === key)) continue;
          restored.push({
            isDemo: false,
            key,
            productId: product.id,
            productSlug: product.slug,
            backendProductId: product.backendProductId,
            backendVariantId: variant.backendVariantId,
            size: variant.size || "Default option",
            color: variant.color || product.color,
            quantity: line.quantity,
            dataSource: product.dataSource,
            product,
          });
        }
        setCart(restored);
      } catch {
        if (active)
          setCartError(
            "Saved bag items could not be verified. Please add them again.",
          );
      } finally {
        if (active) setHydrated(true);
      }
    }
    void restore();
    return () => {
      active = false;
      controller.abort();
    };
  }, [initialCatalogue.dataSource, registerProducts]);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        CART_STORAGE,
        JSON.stringify(
          cart.map(
            ({
              productId,
              backendVariantId,
              quantity,
              dataSource,
              size,
              color,
            }) => ({
              productId,
              backendVariantId,
              size,
              color,
              quantity,
              dataSource,
            }),
          ),
        ),
      );
    } catch {
      /* Storage may be unavailable in private mode. */
    }
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated)
      try {
        localStorage.setItem(FAVORITES_STORAGE, JSON.stringify(favorites));
      } catch {
        /* In-memory favorites still work. */
      }
  }, [favorites, hydrated]);

  const addToCart = (
    product: Product,
    variant: CommerceVariant | undefined,
    quantity = 1,
    selection: DemoSelection = {},
  ) => {
    if (!hydrated) return "Your bag is still loading. Please try again.";
    if (
      initialCatalogue.dataSource === "local" &&
      product.dataSource === "local"
    ) {
      const demo = createDemoCartLine(product, quantity, selection);
      if (!demo) return "This demo selection or quantity is unavailable.";
      const existing = cart.find((line) => line.key === demo.key);
      if (!existing && cart.length >= 48)
        return "Your bag can contain up to 48 different options.";
      if (
        existing &&
        !canUpdateCartLine(existing, existing.quantity + quantity)
      )
        return "The requested demo quantity is unavailable.";
      registerProducts([product]);
      setCart((current) => {
        const old = current.find((line) => line.key === demo.key);
        if (old)
          return canUpdateCartLine(old, old.quantity + quantity)
            ? current.map((line) =>
                line.key === demo.key
                  ? { ...demo, quantity: old.quantity + quantity }
                  : line,
              )
            : current;
        return current.length < 48 ? [...current, demo] : current;
      });
      setCartError("");
      setCartOpen(true);
      return null;
    }
    if (!canAddVariant(product, variant, quantity) || !variant)
      return "Verified size, color, price and stock are required before adding this piece.";
    const key = `${product.backendProductId}:${variant.backendVariantId}`;
    const existing = cart.find((line) => line.key === key);
    if (!existing && cart.length >= 48)
      return "Your bag can contain up to 48 different options.";
    if ((existing?.quantity || 0) + quantity > variant.availableStock!)
      return "The requested quantity is unavailable.";
    registerProducts([product]);
    setCart((current) => {
      const line = current.find((item) => item.key === key);
      if (line && line.quantity + quantity > variant.availableStock!)
        return current;
      return line
        ? current.map((item) =>
            item.key === key
              ? { ...item, quantity: item.quantity + quantity, product }
              : item,
          )
        : [
            ...current,
            {
              key,
              isDemo: false,
              productId: product.id,
              productSlug: product.slug,
              backendProductId: product.backendProductId,
              backendVariantId: variant.backendVariantId,
              size: variant.size || "Default option",
              color: variant.color || product.color,
              quantity,
              dataSource: product.dataSource,
              product,
            },
          ];
    });
    setCartError("");
    setCartOpen(true);
    return null;
  };
  const updateQuantity = (key: string, quantity: number) =>
    setCart((current) =>
      current.flatMap((line) => {
        if (line.key !== key) return [line];
        if (!Number.isSafeInteger(quantity) || quantity < 0) return [line];
        if (quantity === 0) return [];
        const variant = line.product.variants.find(
          (v) => v.backendVariantId === line.backendVariantId,
        );
        return (
          line.isDemo
            ? canUpdateCartLine(line, quantity)
            : canAddVariant(line.product, variant, quantity)
        )
          ? [{ ...line, quantity }]
          : [line];
      }),
    );
  const removeFromCart = (key: string) =>
    setCart((current) => current.filter((line) => line.key !== key));
  const toggleFavorite = (id: string) =>
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((saved) => saved !== id)
        : [...current, id].slice(-100),
    );
  const cartCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart],
  );
  const cartSubtotal = useMemo(
    () =>
      cart.reduce(
        (sum, line) => sum + (cartLineUnitPrice(line) || 0) * line.quantity,
        0,
      ),
    [cart],
  );
  const products = useMemo(() => Object.values(cache), [cache]);
  return (
    <StoreContext.Provider
      value={{
        cart,
        favorites,
        cartOpen,
        setCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleFavorite,
        cartCount,
        cartSubtotal,
        products,
        registerProducts,
        catalogue: initialCatalogue,
        cartError,
        checkoutReady: false,
        cartHydrated: hydrated,
        clearDemoCart: () =>
          setCart((current) => current.filter((line) => !line.isDemo)),
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore requires StoreProvider");
  return store;
}
