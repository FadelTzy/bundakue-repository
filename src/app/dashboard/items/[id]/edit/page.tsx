import { verifySession } from "@/lib/auth";
import ItemFormPage from "@/components/ItemFormPage";

export const dynamic = "force-dynamic";

export default async function DashboardEditItemPage({ params }: { params: { id: string } }) {
  const session = (await verifySession())!;
  return <ItemFormPage session={session} itemId={params.id} />;
}
