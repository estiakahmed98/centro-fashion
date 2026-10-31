import type { Metadata } from "next";
import EditorialHome from "@/components/ecommarce/fashion/EditorialHome";
import { EditorialFrame } from "@/components/ecommarce/fashion/EditorialFrame";
import { getSiteSettingsForSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsForSeo();

  return {
    title: { absolute: settings.defaultSeoTitle },
    description: settings.defaultSeoDescription,
    keywords: settings.defaultSeoKeywords,
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  return (
    <EditorialFrame>
      <EditorialHome />
    </EditorialFrame>
  );
}
