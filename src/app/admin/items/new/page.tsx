import { verifySession } from "@/lib/auth";
import ItemFormPage from "@/components/ItemFormPage";

export default async function AdminNewItemPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const session = (await verifySession())!;
  return <ItemFormPage session={session} defaultCategory={searchParams.category} />;
}
