import { AdminPanel } from "@/components/AdminPanel";
import { getCommerceClient } from "@/lib/commerce-client";
export const dynamic = "force-dynamic";
export const metadata = { title: "Catalogue Preview" };
export default async function AdminPage() {
  const page = await getCommerceClient().listProducts({ limit: 48 });
  return <AdminPanel products={page.products} />;
}
