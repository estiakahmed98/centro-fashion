import type { PrismaClient } from "../generated/prisma";

export async function consumeDatabaseRateLimit(
  db: Pick<PrismaClient, "$queryRaw">,
  options: { key: string; limit: number; windowMs: number },
) {
  const { key, limit, windowMs } = options;
  if (!/^[a-f0-9]{64}$/.test(key) || !Number.isSafeInteger(limit) || limit < 1 || limit > 1_000_000 ||
    !Number.isSafeInteger(windowMs) || windowMs < 1 || windowMs > 86_400_000) {
    throw new Error("Invalid request rate-limit policy");
  }
  // One atomic upsert serializes competing requests across Vercel instances.
  // PostgreSQL's clock controls expiry. Database errors propagate: no bypass.
  const rows = await db.$queryRaw<Array<{ count: number; retryAfter: number }>>`
    INSERT INTO "RequestRateLimit" ("key", "count", "expiresAt")
    VALUES (${key}, 1, CURRENT_TIMESTAMP + ${windowMs}::bigint * INTERVAL '1 millisecond')
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RequestRateLimit"."expiresAt" <= CURRENT_TIMESTAMP THEN 1
        ELSE LEAST("RequestRateLimit"."count", ${limit}::integer) + 1
      END,
      "expiresAt" = CASE
        WHEN "RequestRateLimit"."expiresAt" <= CURRENT_TIMESTAMP
        THEN CURRENT_TIMESTAMP + ${windowMs}::bigint * INTERVAL '1 millisecond'
        ELSE "RequestRateLimit"."expiresAt"
      END
    RETURNING "count",
      GREATEST(1, CEIL(EXTRACT(EPOCH FROM ("expiresAt" - CURRENT_TIMESTAMP))))::integer AS "retryAfter"
  `;
  const bucket = rows[0];
  if (!bucket || !Number.isInteger(bucket.count) || bucket.count < 1 ||
    !Number.isInteger(bucket.retryAfter) || bucket.retryAfter < 1) {
    throw new Error("Invalid database rate-limit response");
  }
  const allowed = bucket.count <= limit;
  return {
    allowed,
    remaining: allowed ? Math.max(0, limit - bucket.count) : 0,
    retryAfter: allowed ? 0 : bucket.retryAfter,
  };
}
