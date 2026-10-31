import { loadEnvConfig } from "@next/env";
import { compare, hash } from "bcryptjs";
import { PrismaClient } from "../generated/prisma";

export const ADMIN_SEED_EMAILS = ["admin@example.com", "admin@gmail.com"] as const;
const ADMIN_SEED_PASSWORD = "admin123";

export async function seedAdmin({ ifMissing = false } = {}) {
  // A deployment must use its configured database, never a checked-in env fallback.
  if (process.env.VERCEL === "1" && !process.env.DATABASE_URL?.trim()) {
    throw new Error("Set DATABASE_URL in this Vercel deployment's environment before seeding.");
  }
  loadEnvConfig(process.cwd());
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL is required to seed admin accounts.");
  const target = new URL(databaseUrl);
  if (!["postgres:", "postgresql:"].includes(target.protocol)) {
    throw new Error("Admin seed requires a PostgreSQL DATABASE_URL.");
  }
  console.log("Admin seed database:", target.hostname, target.pathname, "schema:", target.searchParams.get("schema") || "public");
  const db = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  try {
    // These two requested accounts always use admin123 on an explicit/default seed.
    const passwordHash = await hash(ADMIN_SEED_PASSWORD, 12);
    const seededEmails = await db.$transaction(async (tx) => {
      const seeded: string[] = [];
      for (const email of ADMIN_SEED_EMAILS) {
        if (ifMissing && await tx.user.findUnique({ where: { email } })) {
          console.log("Admin account already exists; left unchanged:", email);
          continue;
        }
        const data = {
          name: "Administrator",
          role: "admin",
          passwordHash,
          emailVerified: new Date(),
          banned: false,
          banReason: null,
          banExpires: null,
        };
        const admin = await tx.user.upsert({
          where: { email },
          create: { email, ...data },
          update: data,
        });
        const role = await tx.role.upsert({
          where: { name: "superadmin" },
          create: { name: "superadmin", label: "Super Admin", isSystem: true, isImmutable: true },
          update: { deletedAt: null, isSystem: true, isImmutable: true },
        });
        const assignment = await tx.userRole.findFirst({
          where: { userId: admin.id, roleId: role.id, scopeType: "GLOBAL", warehouseId: null },
        });
        if (!assignment) await tx.userRole.create({
          data: { userId: admin.id, roleId: role.id, scopeType: "GLOBAL" },
        });
        seeded.push(email);
      }
      return seeded;
    }, { maxWait: 10_000, timeout: 30_000 });

    // Read back after commit, using the same URL as application authentication.
    // A failed write, incorrect hash or missing admin role must fail the build.
    for (const email of seededEmails) {
      const admin = await db.user.findUnique({
        where: { email },
        select: {
          role: true, banned: true, passwordHash: true, emailVerified: true,
          userRoles: {
            where: { scopeType: "GLOBAL", warehouseId: null },
            select: { role: { select: { name: true, deletedAt: true } } },
          },
        },
      });
      if (!admin || admin.role !== "admin" || admin.banned || !admin.emailVerified ||
          !admin.passwordHash || !await compare(ADMIN_SEED_PASSWORD, admin.passwordHash) ||
          !admin.userRoles.some(assignment => assignment.role.name === "superadmin" && !assignment.role.deletedAt)) {
        throw new Error("Admin seed verification failed for " + email);
      }
      console.log("Admin account seeded and credentials verified:", email, "(global superadmin).");
    }
  } finally {
    await db.$disconnect();
  }
}
