import { createHash, randomInt } from "node:crypto";
import { prisma } from "./prisma";
import { consumeDatabaseRateLimit } from "./request-rate-limit";

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (request.headers.get("cf-connecting-ip")?.trim() || request.headers.get("x-real-ip")?.trim() || forwarded || "unknown").slice(0, 128);
}

export async function rateLimitRequest(
  request: Request,
  options: { scope: string; limit: number; windowMs: number; identifier?: string },
) {
  const identity = options.identifier?.trim() || getClientIp(request);
  // Store neither raw IPs nor user IDs. Different durations have separate keys.
  const key = createHash("sha256").update(JSON.stringify([options.scope, identity, options.windowMs])).digest("hex");
  const result = await consumeDatabaseRateLimit(prisma, { ...options, key });
  // Bounded housekeeping needs no external service or cron job.
  if (randomInt(100) === 0) {
    try {
      await prisma.$executeRaw`
        DELETE FROM "RequestRateLimit" WHERE "expiresAt" < CURRENT_TIMESTAMP - INTERVAL '1 day' AND "key" IN (
          SELECT "key" FROM "RequestRateLimit"
          WHERE "expiresAt" < CURRENT_TIMESTAMP - INTERVAL '1 day'
          ORDER BY "expiresAt" LIMIT 500
        )
      `;
    } catch {
      // Cleanup failure must not change the already-enforced request limit.
      console.warn("Request rate-limit cleanup failed; counters remain enforced.");
    }
  }
  return result;
}
