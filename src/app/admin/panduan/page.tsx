import { verifySession } from "@/lib/auth";
import CategoryDashboard from "@/components/CategoryDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPanduanPage({
  searchParams,
}: {
  searchParams: { q?: string; divisionId?: string };
}) {
  const session = (await verifySession())!;
  return <CategoryDashboard session={session} categoryKey="PANDUAN" searchParams={searchParams} />;
}
