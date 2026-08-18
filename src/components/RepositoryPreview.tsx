import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import { CATEGORY_ICONS, LockIcon } from "./Icons";

export default async function RepositoryPreview() {
  const items = await prisma.knowledgeItem.findMany({
    where: { published: true },
    select: { id: true, title: true, category: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <section className="max-w-3xl mx-auto px-4 pb-16">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Isi Repository</h2>
        <p className="text-sm text-gray-500 mt-1">
          Daftar dokumen yang tersedia. Login divisi dengan PIN untuk membuka isinya.
        </p>
      </div>

      <div className="grid gap-5">
        {CATEGORIES.map((category) => {
          const categoryItems = items.filter((item) => item.category === category.key);
          const Icon = CATEGORY_ICONS[category.icon];
          return (
            <div key={category.key} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  {Icon && <Icon className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{category.label}</h3>
                  <p className="text-xs text-gray-500">{categoryItems.length} dokumen</p>
                </div>
              </div>

              {categoryItems.length === 0 ? (
                <p className="text-sm text-gray-400">Belum ada dokumen.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {categoryItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/item/${item.id}`}
                        className="group flex items-center justify-between gap-3 py-2.5"
                      >
                        <span className="text-sm text-gray-700 truncate group-hover:text-brand-600">
                          {item.title}
                        </span>
                        <span className="shrink-0 inline-flex items-center gap-1 text-xs text-gray-400 group-hover:text-brand-600">
                          <LockIcon className="w-3.5 h-3.5" />
                          Login untuk buka
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
