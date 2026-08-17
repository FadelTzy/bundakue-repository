import { prisma } from "@/lib/prisma";
import RepoShell from "@/components/RepoShell";
import DivisionsManager from "@/components/DivisionsManager";

export const dynamic = "force-dynamic";

export default async function AdminDivisiPage() {
  const divisions = await prisma.division.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <RepoShell role="ADMIN">
      <h1 className="text-xl font-semibold text-gray-900">Divisi</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Kelola divisi beserta PIN 6 digit yang digunakan untuk login repository divisi.
      </p>
      <DivisionsManager divisions={divisions} />
    </RepoShell>
  );
}
