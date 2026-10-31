# Centro catalog seed

The current catalog source is `public/centro/images_report.json`, with local
images under `public/centro/images`. The previous BOED asset folders and catalog
normalizer have been removed from the active source. The old asset folders are
preserved outside `public` at `backups/retired-boed-assets/` as an ignored local
recovery copy because recursive deletion was rejected by the tool policy.

```powershell
npm run seed:centro                 # validate assets without database writes
npm run seed:centro -- --export      # also export data/centro-normalized-catalog.json
npx prisma generate
npm run seed:centro -- --apply       # import into the configured DATABASE_URL
npm run test:centro
```

The default `npx prisma db seed` runs the existing admin seed followed by the
Centro catalog import. Deployments using the default Prisma seed also import
Centro. `seed:boed` and `test:boed` remain compatibility aliases for Centro.
No schema migration or database reset is required for this catalog change.

The report provides 136 distinct product images across nine categories:
Activewear, Denim, Footwear, Home Textiles, Kidswear, Knitwear, Menswear,
Outerwear and Womenswear. Corporate, leadership, sustainability and campaign
images are excluded. Failed downloads are excluded. Every selected asset must
exist before any database operation. Content checksums deduplicate images;
source image IDs provide stable product slugs and `CENTRO-` SKUs. Categories
use `centro-` slugs so existing BOED category hierarchies cannot collide.

The crawl provides no verified product names, descriptions, prices, sizes or
inventory. Each image therefore creates an **unavailable review draft**, with
a generated name, blank description, zero placeholder price and zero stock.
Images may represent multiple views of the same product; review and merge
them before publishing. The original URLs, categories, checksum and review
flags are retained in the default variant's `options.__meta`. Ambiguous source
subcategories remain metadata instead of being turned into guessed hierarchies.

Each new product, default variant and zero warehouse balance is created with
one atomic nested write. Repeat runs skip existing Centro products, preserving
admin edits, publication state, prices and stock. Slug/SKU collisions stop the
import before inserts. Partial imports can be rerun to insert remaining drafts.
Only after all drafts exist does the importer soft-delete products whose SKU
starts with `BOED-`, clearing availability and featured status. Orders, product
IDs, variants and inventory history are retained. Other products are untouched.

Before publishing drafts, enter verified names, prices, sizes and warehouse
stock in admin, combine gallery views as appropriate, then enable availability.
Until then the storefront will not list the Centro drafts.

This checkout has no configured `DATABASE_URL`. The asset validation, export,
and offline importer tests can run here; actual database application requires
the target database environment.
