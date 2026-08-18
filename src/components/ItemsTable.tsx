"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditIcon, TrashIcon } from "./Icons";
import LinkBadge from "./LinkBadge";

type Item = {
  id: string;
  title: string;
  category: string;
  linkType: string;
  url: string;
  published: boolean;
  updatedAt: string | Date;
  divisions: { id: string; name: string }[];
};

export default function ItemsTable({
  items,
  basePath,
  canDelete,
}: {
  items: Item[];
  basePath: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Hapus dokumen "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal menghapus.");
      } else {
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function togglePublished(item: Item) {
    setBusyId(item.id);
    setError("");
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          category: item.category,
          linkType: item.linkType,
          url: item.url,
          published: !item.published,
          divisionIds: item.divisions.map((d) => d.id),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal memperbarui status.");
      } else {
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          {error}
        </p>
      )}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Judul</th>
              <th className="text-left px-4 py-3 font-medium">Divisi</th>
              <th className="text-left px-4 py-3 font-medium">Sumber</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  Belum ada dokumen. Klik &quot;Tambah Dokumen&quot; untuk mulai menambahkan.
                </td>
              </tr>
            )}
            {items.map((item) => {
              const busy = busyId === item.id;
              return (
                <tr key={item.id} className={busy ? "opacity-50" : ""}>
                  <td className="px-4 py-3 max-w-xs">
                    <Link
                      href={`/item/${item.id}`}
                      className="font-medium text-gray-900 hover:text-brand-600 truncate block"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {new Date(item.updatedAt).toLocaleDateString("id-ID")}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex flex-wrap gap-1">
                      {item.divisions.map((d) => (
                        <span
                          key={d.id}
                          className="text-xs bg-secondary-100 text-secondary-700 rounded-full px-2 py-0.5"
                        >
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <LinkBadge linkType={item.linkType} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={busy}
                      onClick={() => togglePublished(item)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        item.published
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.published ? "Terbit" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`${basePath}/items/${item.id}/edit`}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand-600"
                        title="Ubah"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Link>
                      {canDelete && (
                        <button
                          disabled={busy}
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                          title="Hapus"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
