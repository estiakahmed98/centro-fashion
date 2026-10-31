-- Additive and repeatable: existing storefront/order tables are untouched.
CREATE TABLE IF NOT EXISTS "RequestRateLimit" (
  "key" VARCHAR(64) NOT NULL,
  "count" INTEGER NOT NULL,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "RequestRateLimit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX IF NOT EXISTS "RequestRateLimit_expiresAt_idx" ON "RequestRateLimit" ("expiresAt");
