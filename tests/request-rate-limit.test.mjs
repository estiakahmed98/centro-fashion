import test from "node:test";
import assert from "node:assert/strict";
import { consumeDatabaseRateLimit } from "../lib/request-rate-limit.ts";

const policy = { key: "a".repeat(64), limit: 3, windowMs: 60_000 };
test("allowed and exhausted counters preserve remaining and Retry-After semantics", async () => {
  for (const [count, expected] of [
    [1, { allowed: true, remaining: 2, retryAfter: 0 }],
    [3, { allowed: true, remaining: 0, retryAfter: 0 }],
    [4, { allowed: false, remaining: 0, retryAfter: 39 }],
  ]) {
    const db = { $queryRaw: async () => [{ count, retryAfter: 39 }] };
    assert.deepEqual(await consumeDatabaseRateLimit(db, policy), expected);
  }
});

test("invalid limits, windows and keys fail before touching the database", async () => {
  const db = { $queryRaw: async () => assert.fail("invalid policy reached database") };
  for (const value of [
    { limit: 0 }, { limit: -1 }, { limit: 1.5 }, { limit: Infinity },
    { windowMs: 0 }, { windowMs: 1.5 }, { windowMs: 86_400_001 },
    { key: "raw-user-or-ip" },
  ]) {
    await assert.rejects(consumeDatabaseRateLimit(db, { ...policy, ...value }), /Invalid request rate-limit policy/);
  }
});

test("database failures never silently allow an unprotected request", async () => {
  await assert.rejects(consumeDatabaseRateLimit({ $queryRaw: async () => { throw new Error("database unavailable"); } }, policy), /database unavailable/);
  for (const rows of [[], [{ count: 0, retryAfter: 10 }], [{ count: 1, retryAfter: 0 }]]) {
    await assert.rejects(consumeDatabaseRateLimit({ $queryRaw: async () => rows }, policy), /Invalid database rate-limit response/);
  }
});
