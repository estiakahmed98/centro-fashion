import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import bcrypt from "bcryptjs";

const source = readFileSync(new URL("../prisma/admin-seed.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const emails = ["admin@example.com", "admin@gmail.com"];

function fixture({ existingEmails = [], env = {}, failure, corruptReadback = false } = {}) {
  const writes = [];
  const users = new Map(existingEmails.map(email => [email, { id: email, email, passwordHash: "old-password", role: "user", banned: true }]));
  const assignments = new Set();
  let disconnected = false;
  let constructorOptions;
  const user = {
    findUnique: async ({ where, select }) => {
      const record = users.get(where.email);
      if (!record) return null;
      if (!select) return record;
      return { ...record, passwordHash: corruptReadback ? "invalid" : record.passwordHash,
        userRoles: assignments.has(record.id) ? [{ role: { name: "superadmin", deletedAt: null } }] : [] };
    },
    upsert: async args => {
      if (failure) throw failure;
      writes.push({ model: "user", ...args });
      const existing = users.get(args.where.email);
      const record = existing ? { ...existing, ...args.update } : { id: args.where.email, ...args.create };
      users.set(record.email, record);
      return record;
    },
  };
  const tx = {
    user,
    role: { upsert: async args => { writes.push({ model: "role", ...args }); return { id: "superadmin-role" }; } },
    userRole: {
      findFirst: async ({ where }) => assignments.has(where.userId) ? { id: where.userId } : null,
      create: async args => { writes.push({ model: "userRole", ...args }); assignments.add(args.data.userId); },
    },
  };
  const sandbox = {
    exports: {},
    URL,
    process: { cwd: () => ".", env: { DATABASE_URL: "postgresql://seed:private@database.invalid/store", ...env } },
    console: { log() {} },
    require(name) {
      if (name === "@next/env") return { loadEnvConfig() {} };
      if (name === "bcryptjs") return bcrypt;
      if (name === "../generated/prisma") return { PrismaClient: class {
        constructor(options) { constructorOptions = options; }
        user = user;
        async $transaction(callback) { return callback(tx); }
        async $disconnect() { disconnected = true; }
      } };
      throw new Error("Unexpected dependency: " + name);
    },
  };
  vm.runInNewContext(compiled, sandbox);
  return { seedAdmin: sandbox.exports.seedAdmin, writes, users, assignments, disconnected: () => disconnected, options: () => constructorOptions };
}

test("default Prisma seed creates and reads back both login-compatible global admins", async () => {
  const f = fixture();
  await f.seedAdmin();
  for (const email of emails) {
    const user = f.users.get(email);
    assert.equal(user.role, "admin");
    assert.equal(user.banned, false);
    assert.ok(user.emailVerified);
    assert.ok(await bcrypt.compare("admin123", user.passwordHash));
    assert.ok(f.assignments.has(user.id));
  }
  assert.equal(f.options().datasources.db.url, "postgresql://seed:private@database.invalid/store");
  assert.equal(f.disconnected(), true);
});

test("existing banned accounts receive the requested password and missing global roles", async () => {
  const f = fixture({ existingEmails: emails, env: { SEED_ADMIN_PASSWORD: "previous-environment-password" } });
  await f.seedAdmin();
  for (const email of emails) {
    const user = f.users.get(email);
    assert.equal(user.banned, false);
    assert.equal(user.role, "admin");
    assert.ok(await bcrypt.compare("admin123", user.passwordHash));
  }
  assert.equal(f.assignments.size, 2);
});

test("repeated seed does not duplicate global assignments", async () => {
  const f = fixture();
  await f.seedAdmin();
  await f.seedAdmin();
  assert.equal(f.users.size, 2);
  assert.equal(f.writes.filter(row => row.model === "userRole").length, 2);
});

test("optional if-missing mode skips only the existing account and still creates the second", async () => {
  const f = fixture({ existingEmails: [emails[0]] });
  await f.seedAdmin({ ifMissing: true });
  assert.equal(f.users.get(emails[0]).passwordHash, "old-password");
  assert.ok(await bcrypt.compare("admin123", f.users.get(emails[1]).passwordHash));
});

test("Vercel refuses an absent deployment DATABASE_URL", async () => {
  const f = fixture({ env: { VERCEL: "1", DATABASE_URL: "" } });
  await assert.rejects(f.seedAdmin(), /Set DATABASE_URL/);
  assert.equal(f.options(), undefined);
});

test("a failed credential readback fails the seed and disconnects", async () => {
  const f = fixture({ corruptReadback: true });
  await assert.rejects(f.seedAdmin(), /Admin seed verification failed/);
  assert.equal(f.disconnected(), true);
});

test("database errors propagate and release the connection", async () => {
  const f = fixture({ failure: new Error("Database unavailable") });
  await assert.rejects(f.seedAdmin(), /Database unavailable/);
  assert.equal(f.disconnected(), true);
});
