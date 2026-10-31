import { loadEnvConfig } from "@next/env";
import { createHash, randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { PrismaClient } from "../generated/prisma";
import { consumeDatabaseRateLimit } from "../lib/request-rate-limit";

async function main() {
  loadEnvConfig(process.cwd());
  const clients = [new PrismaClient(), new PrismaClient()];
  const key = createHash("sha256").update(`rate-limit-test:${randomUUID()}`).digest("hex");
  const otherKey = createHash("sha256").update(`rate-limit-test:${randomUUID()}`).digest("hex");
  try {
    const options = { key, limit: 7, windowMs: 60_000 };
    // Independent database clients represent separate serverless instances.
    const results = await Promise.all(Array.from({ length: 30 }, (_, index) =>
      consumeDatabaseRateLimit(clients[index % 2], options)));
    assert.equal(results.filter(result => result.allowed).length, 7);
    assert.ok(results.filter(result => !result.allowed).every(result => result.retryAfter >= 1));
    assert.deepEqual(await consumeDatabaseRateLimit(clients[1], { ...options, key: otherKey }), {
      allowed: true, remaining: 6, retryAfter: 0,
    });
    await clients[0].$executeRaw`UPDATE "RequestRateLimit" SET "expiresAt" = CURRENT_TIMESTAMP - INTERVAL '1 second' WHERE "key" = ${key}`;
    assert.deepEqual(await consumeDatabaseRateLimit(clients[1], options), {
      allowed: true, remaining: 6, retryAfter: 0,
    });
    console.log("PASS: PostgreSQL concurrency (7/30 allowed), separate identities, expiry reset. Redis not used.");
  } finally {
    await clients[0].$executeRaw`DELETE FROM "RequestRateLimit" WHERE "key" IN (${key}, ${otherKey})`;
    await Promise.all(clients.map(client => client.$disconnect()));
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
