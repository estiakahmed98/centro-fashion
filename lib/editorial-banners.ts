import { connection } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { homeImages } from "@/lib/editorial-images";

const readBannerSlots = unstable_cache(async () => {
  const banners = await prisma.banner.findMany({
    where: {
      type: { in: ["HERO", "BANNER1"] },
      position: { in: [1, 2] },
      isActive: true,
    },
    // If a slot is duplicated, the most recently edited active banner wins.
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: { type: true, position: true, image: true, startDate: true, endDate: true },
  });
  return banners.map(banner => ({ ...banner, startDate: banner.startDate?.getTime() ?? null, endDate: banner.endDate?.getTime() ?? null }));
}, ["editorial-banner-slots-v1"], { revalidate: 120, tags: ["editorial-banners"] });

/** Cache configuration, but evaluate scheduled start/end times on every request. */
export async function getEditorialBannerImages() {
  await connection();
  const now = Date.now();
  const banners = (await readBannerSlots()).filter(banner =>
    (banner.startDate === null || banner.startDate <= now) &&
    (banner.endDate === null || banner.endDate >= now));
  const imageFor = (type: "HERO" | "BANNER1", position: number) =>
    banners.find(banner => banner.type === type && banner.position === position && banner.image.trim())?.image;
  const hero = imageFor("HERO", 1) || homeImages.hero;
  const summer = imageFor("BANNER1", 1) || homeImages.summer;
  return {
    hero,
    heroMobile: imageFor("HERO", 2) || imageFor("HERO", 1) || homeImages.heroMobile,
    summer,
    summerMobile: imageFor("BANNER1", 2) || imageFor("BANNER1", 1) || homeImages.summerMobile,
  };
}
