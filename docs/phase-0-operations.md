# Phase 0 operations

## Required secrets

- `NEXTAUTH_SECRET` (or `AUTH_SECRET`) signs short-lived guest payment-init tokens.
- `CRON_SECRET` protects inventory-reservation cleanup.
- `BLOB_READ_WRITE_TOKEN` enables durable Vercel Blob upload storage and is required
  in production.
- `DATABASE_URL` supports shared PostgreSQL request rate limiting. Upstash/Redis
  credentials are no longer used. Run `npm run prepare:rate-limit` once when
  deploying outside Vercel; the Vercel build prepares the table automatically.
- `MAILBOX_API_KEY` is optional. Without it, email checks fall back to format validation.

Rotate the old MailboxLayer key that previously existed in Git history. Removing it
from the current source does not revoke the credential or erase earlier commits.

## Inventory cleanup schedule

Call `GET /api/cron/release-expired-inventory` every 5 minutes with either:

```text
Authorization: Bearer <CRON_SECRET>
```

or:

```text
x-cron-secret: <CRON_SECRET>
```

The job releases expired SSLCommerz reservations, fails unfinished payment attempts,
and returns coupon usage when an unpaid order expires.

## Verification

```bash
npm audit --omit=dev
npm run test:phase0
npm run lint
npm run typecheck
```

`npm run typecheck` must pass before deployment. Next.js build error suppression has
been removed, so production builds enforce the same TypeScript gate.

## Deployment note

Uploads use local `public/upload` storage only during development. Production fails
closed unless Vercel Blob is configured. Protected SCM, investor, payment, delivery,
and digital-asset objects are stored as private blobs and remain behind the existing
route-level token/RBAC controls.

Rate limiting uses atomic PostgreSQL counters in every environment. All serverless
instances share the same counters, using the database clock for expiry. Raw IPs
and user IDs are hashed before storage. Requests still fail closed if the database
is unavailable. Expired counters are cleaned in bounded batches without a cron.

The additive `RequestRateLimit` table is prepared during Vercel builds without
resetting, pushing the full schema, or reseeding the store. The SQL is also tracked
as a normal Prisma migration for installations using migration history.

Verify with `npm run test:rate-limit` and `npm run verify:rate-limit-db`.
