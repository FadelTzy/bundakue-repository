import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Session } from "@/lib/auth";
import RepoShell from "./RepoShell";
import ItemForm from "./ItemForm";

export default async function ItemFormPage({
  session,
  itemId,
  defaultCategory,
}: {
  session: Session;
  itemId?: string;
  defaultCategory?: string;
}) {
  const basePath = session.role === "ADMIN" ? "/admin" : "/dashboard";

  const [divisions, item] = await Promise.all([
    prisma.division.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    itemId
      ? prisma.knowledgeItem.findUnique({
          where: { id: itemId },
          include: { divisions: { select: { id: true } } },
        })
      : Promise.resolve(null),
  ]);

  if (itemId) {
    if (!item) notFound();
    if (session.role === "USER" && !item.divisions.some((d) => d.id === session.divisionId)) {
      notFound();
    }
  }

  return (
    <RepoShell
      role={session.role}
      divisionName={session.role === "USER" ? session.divisionName : undefined}
    >
      <h1 className="text-xl font-semibold text-gray-900">
        {item ? "Ubah Dokumen" : "Tambah Dokumen"}
      </h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        {item
          ? item.title
          : "Tempelkan link Google Drive, website, atau YouTube — tidak perlu unggah file."}
      </p>
      <ItemForm
        basePath={basePath}
        divisions={divisions}
        requiredDivisionId={session.role === "USER" ? session.divisionId : undefined}
        initial={
          item
            ? {
                id: item.id,
                title: item.title,
                description: item.description || "",
                category: item.category,
                linkType: item.linkType,
                url: item.url,
                tags: item.tags || "",
                published: item.published,
                divisionIds: item.divisions.map((d) => d.id),
              }
            : defaultCategory
              ? { category: defaultCategory }
              : undefined
        }
      />
    </RepoShell>
  );
}
