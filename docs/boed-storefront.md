# BOED storefront integration

The supplied `front_End` is the visual reference. The live storefront uses the existing Prisma catalog, product projections, cart and wishlist providers, authentication, checkout, orders and payments. The reference's standalone demo store, account and admin implementations are not connected to production.

The home page reuses the reference editorial layout and local `public/editorial` images. `/ecommerce/products` provides collections, search, sorting, price, brand, type, attribute, specification and variant filters, and pagination. `/ecommerce/collections/[slug]` resolves the reference collection links. Physical products use the reference gallery and an options-aware purchase panel, preserving product information, reviews and questions; other product types retain the existing purchase flow. The shopping bag drawer uses the existing cart. Cart, checkout and account routes retain their established behavior.

## Homepage banners

Homepage campaign images are read from active, currently scheduled Banner Management records on each page request. `HERO` positions 1/2 supply desktop/mobile hero images; `BANNER1` positions 1/2 supply desktop/mobile images for “LONG DAYS. LIGHTER LAYERS.” Mobile falls back to the desktop image when its slot is missing. Missing desktop slots retain the local editorial fallback. If multiple active records occupy a slot, the most recently updated one wins. All four configured image slots were verified in desktop/mobile browsers.

## Current catalog seed

The catalog now uses local Centro images. See [Centro seed instructions](centro-seed.md) for validation, import behavior, review requirements and database commands. The BOED import command is retained as a Centro compatibility alias.
