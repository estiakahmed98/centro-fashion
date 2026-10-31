# Active database migrations

`prisma.config.ts` uses this directory for Prisma migrations. Keep it in source control: an empty or missing migration directory lets `prisma migrate reset` finish without recreating application tables, after which seeding fails with `The table public.Product does not exist`.

`00000000000000_current_schema_baseline` creates the current Prisma schema and the three externally managed PC Builder tables. The latter definitions and indexes come from `scripts/repair-pc-builder-database.mjs`. The baseline runs transactionally.

For a new or already-reset database:

```powershell
npx prisma migrate deploy
npx prisma db seed
```

`npx prisma migrate reset` replays this baseline and runs the configured seed, but deletes existing data. It is unnecessary when only re-running the seed.

For an existing populated database created with `prisma db push`, compare its schema with this baseline and reconcile differences before marking the baseline as applied. Do not apply the initial create-table migration directly to populated databases, and do not reset them to resolve migration history differences.
