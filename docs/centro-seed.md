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
npm run seed:centro-stock -- --apply # publish existing Centro products and randomize stock
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
inventory. Per the user's explicit request, new products are available, get a
conservative category-based BDT price estimate, and each default variant
receives a random integer stock quantity from 70 through 200 inclusive. The
variant price matches the product base price, and its initial warehouse
quantity matches the variant stock. Price and size review flags remain set:
estimates must be confirmed before sale. Stock metadata identifies the
requested random quantity rather than claiming the quantity came from the
source website.

Each new product, default variant and warehouse balance is created with one
atomic nested write. Normal repeat imports skip existing Centro products,
preserving operator edits and stock after purchases; zero-priced products and
variants are backfilled with the seed estimate without changing nonzero prices.
Slug/SKU collisions stop inserts. After all products exist, the importer
soft-deletes the previous BOED products while retaining their orders and
inventory history.

The explicit `seed:centro-stock -- --apply` command publishes existing Centro
products and assigns fresh random stock to their active variants. It uses the
inventory service inside a transaction for each product, retaining reservations,
checking expected stock, and updating warehouse quantities, inventory logs,
snapshots and the variant's derived stock. Rerunning this explicit command
randomizes stock again; normal default seeds do not replenish existing products.

Images may show multiple views of one product; review galleries, names, prices
and sizes in admin. Source URLs, categories, checksums and review flags remain
in variant `options.__meta`. No product price is changed by the stock command.
