import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Session } from "@/lib/auth";
import { CATEGORIES, getCategoryByKey, type CategoryKey } from "@/lib/categories";
import RepoShell from "./RepoShell";
import ItemsTable from "./ItemsTable";
import SearchBar from "./SearchBar";
import DivisionFilterForm from "./DivisionFilterForm";

export default async function CategoryDashboard({
  session,
  categoryKey,
  searchParams,
}: {
  session: Session;
  categoryKey: CategoryKey;
  searchParams: { q?: string; divisionId?: string };
}) {
  const category = getCategoryByKey(categoryKey)!;
  const basePath = session.role === "ADMIN" ? "/admin" : "/dashboard";
  const q = (searchParams.q || "").trim();
  const divisionFilter =
    session.role === "USER" ? session.divisionId : searchParams.divisionId || "";

  const [items, divisions] = await Promise.all([
    prisma.knowledgeItem.findMany({
      where: {
        category: categoryKey,
        ...(divisionFilter ? { divisions: { some: { id: divisionFilter } } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" as const } },
                { description: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      include: { divisions: { select: { id: true, name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    session.role === "ADMIN"
      ? prisma.division.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
      : Promise.resolve([]),
  ]);

  return (
    <RepoShell
      role={session.role}
      divisionName={session.role === "USER" ? session.divisionName : undefined}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{category.label}</h1>
          <p className="text-sm text-gray-500 mt-1">{category.description}</p>
        </div>
        <Link
          href={`${basePath}/items/new?category=${categoryKey}`}
          className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Tambah Dokumen
        </Link>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mt-5 overflow-x-auto">
        {CATEGORIES.map((c) => {
          const isActive = c.key === categoryKey;
          return (
            <Link
              key={c.key}
              href={`${basePath}/${c.slug}`}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
                isActive
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {c.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-5 mb-5">
        <div className="flex-1">
          <SearchBar
            action={`${basePath}/${category.slug}`}
            defaultValue={q}
            placeholder="Cari dokumen..."
          />
        </div>
        {session.role === "ADMIN" && (
          <DivisionFilterForm
            action={`${basePath}/${category.slug}`}
            q={q}
            divisionId={divisionFilter}
            divisions={divisions}
          />
        )}
      </div>

      <p className="text-xs text-gray-400 mb-2">{items.length} dokumen</p>

      <ItemsTable items={items} basePath={basePath} canDelete={session.role === "ADMIN"} />
    </RepoShell>
  );
}
