import type { PrismaClient } from "../generated/prisma";

type CategoryInput = { slug: string; name: string };
type CategoryRecord = { id: number; parentId: number | null };

// Resolve shared categories once per import, outside product transactions.
export async function resolveBoedCategory(
  db: Pick<PrismaClient, "category">,
  categories: CategoryInput[],
  cache: Map<string, CategoryRecord>,
) {
  let parentId: number | null = null;
  for (const category of categories) {
    let current = cache.get(category.slug);
    if (!current) {
      current = await db.category.upsert({
        where: { slug: category.slug }, update: {},
        create: { ...category, parentId, showInHeader: true, showInFooter: true },
        select: { id: true, parentId: true },
      });
      cache.set(category.slug, current);
    }
    if (current.parentId !== parentId) {
      throw new Error(`Existing category hierarchy differs: ${category.slug}`);
    }
    parentId = current.id;
  }
  if (parentId === null) throw new Error("BOED product requires a category.");
  return parentId;
}
