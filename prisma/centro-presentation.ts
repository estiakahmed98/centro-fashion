import type { PrismaClient } from "../generated/prisma";
import { centroMediaPath, type CentroProduct } from "../scripts/centro-catalog.mjs";

const covers: Record<string, string> = {
  "centro-womenswear": "images/Our_Product/3afbaf7c1dd13621.png",
  "centro-menswear": "images/Our_Product/5a6a3e8d7cb97247.png",
  "centro-kids": "images/Our_Product/4ee23370af779ab4.png",
  "centro-outerwear": "images/Our_Product/1b930f7d7aa6cc65.png",
  "centro-denim": "images/Our_Product/55237cc3459c0ecd.png",
  "centro-home-textiles": "images/Our_Product/f3ecd7ad40f0ade6.png",
};

export async function seedCentroPresentation(db: PrismaClient, catalog: CentroProduct[]) {
  const categories = await db.category.findMany({ where: { slug: { in: catalog.flatMap(item => item.categories.map(category => category.slug)) } } });
  for (const category of categories) {
    if (category.image && !/^\/(editorial|images|boed-media|boed_static_public)\//.test(category.image)) continue;
    const fallback = catalog.find(item => item.categories.some(item => item.slug === category.slug))?.product.image;
    await db.category.update({ where: { id: category.id }, data: {
      image: covers[category.slug] ? centroMediaPath(covers[category.slug]) : fallback,
    } });
  }
  const settings = await db.sitesettings.findFirst({ orderBy: { id: "asc" } });
  if (!settings || !settings.storeName || /boed|e-commerce/i.test(settings.storeName)) {
    const identity = {
      siteTitle: "Centro", storeName: "Centro", storeTagline: "Designed with purpose. Made for everyday.",
      defaultSeoTitle: "Centro | Made for the way you live",
      defaultSeoDescription: "Discover Centro collections, from everyday apparel to home textiles. Explore our people, design process and sustainability story.",
      logo: "/centro/logo.svg", favicon: "/centro/logo.svg", storeType: "FASHION", currency: "BDT",
      address: "House 7/7A, Floor W-7, Sector 17, Block H-1, BGMEA Complex, Uttara, Dhaka-1230, Bangladesh",
      footerDescription: "A world of apparel, home textiles and creative possibilities. Discover the people and ideas behind Centro.",
    };
    if (settings) await db.sitesettings.update({ where: { id: settings.id }, data: identity });
    else await db.sitesettings.create({ data: identity });
  } else {
    const updates = {
      ...(settings.logo === "/centro/brand.svg" ? { logo: "/centro/logo.svg" } : {}),
      ...(settings.favicon === "/centro/brand.svg" ? { favicon: "/centro/logo.svg" } : {}),
    };
    if (Object.keys(updates).length) {
      await db.sitesettings.update({ where: { id: settings.id }, data: updates });
    }
  }
}
