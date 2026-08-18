import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import RepositoryPreviewTabs from "./RepositoryPreviewTabs";

export default async function RepositoryPreview() {
  const items = await prisma.knowledgeItem.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      category: true,
      updatedAt: true,
      divisions: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const categories = CATEGORIES.map((category) => ({
    key: category.key,
    label: category.label,
    icon: category.icon,
    items: items
      .filter((item) => item.category === category.key)
      .map((item) => ({ id: item.id, title: item.title, divisions: item.divisions })),
  }));

  return (
    <section className="max-w-3xl mx-auto px-4 pb-16">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Isi Repository</h2>
        <p className="text-sm text-gray-500 mt-1">
          Daftar dokumen yang tersedia. Login divisi dengan PIN untuk membuka isinya.
        </p>
      </div>

      <RepositoryPreviewTabs categories={categories} />
    </section>
  );
}
