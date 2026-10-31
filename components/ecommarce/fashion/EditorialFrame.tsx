import type { ReactNode } from "react";
import { getStorefrontNavigationHighlights } from "@/lib/storefront-navigation";
import { getSiteSettingsForSeo } from "@/lib/seo";
import { EditorialShell } from "./EditorialShell";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-editorial-serif" });
const sans = DM_Sans({ subsets: ["latin"], display: "swap", variable: "--font-editorial-sans" });

export async function EditorialFrame({ children }: { children: ReactNode }) {
  const [highlights, settings] = await Promise.all([
    getStorefrontNavigationHighlights().catch(() => []),
    getSiteSettingsForSeo(),
  ]);
  const socials = [
    { name: "Facebook", href: settings.facebookLink },
    { name: "Instagram", href: settings.instagramLink },
    { name: "YouTube", href: settings.youtubeLink },
    { name: "X", href: settings.twitterLink },
  ].filter((item): item is { name: string; href: string } => Boolean(item.href && /^https?:\/\//.test(item.href)));
  return <EditorialShell fontClassName={`${serif.variable} ${sans.variable}`} highlights={highlights} socials={socials}>{children}</EditorialShell>;
}
