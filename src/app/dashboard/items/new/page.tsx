import { verifySession } from "@/lib/auth";
import ItemFormPage from "@/components/ItemFormPage";

export default async function DashboardNewItemPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const session = (await verifySession())!;
  return <ItemFormPage session={session} defaultCategory={searchParams.category} />;
}
