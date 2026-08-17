import { verifySession } from "@/lib/auth";
import CategoryDashboard from "@/components/CategoryDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardSopPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = (await verifySession())!;
  return <CategoryDashboard session={session} categoryKey="SOP" searchParams={searchParams} />;
}
