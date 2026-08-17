"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, detectLinkType, getCategoryByKey } from "@/lib/categories";

type InitialData = {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  linkType?: string;
  url?: string;
  tags?: string;
  published?: boolean;
  divisionIds?: string[];
};

export default function ItemForm({
  basePath,
  divisions,
  requiredDivisionId,
  initial,
}: {
  basePath: string;
  divisions: { id: string; name: string }[];
  requiredDivisionId?: string;
  initial?: InitialData;
}) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [category, setCategory] = useState(initial?.category || "PANDUAN");
  const [linkType, setLinkType] = useState(initial?.linkType || "WEBSITE");
  const [url, setUrl] = useState(initial?.url || "");
  const [tags, setTags] = useState(initial?.tags || "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [divisionIds, setDivisionIds] = useState<string[]>(
    initial?.divisionIds || (requiredDivisionId ? [requiredDivisionId] : [])
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleUrlChange(value: string) {
    setUrl(value);
    if (value) setLinkType(detectLinkType(value));
  }

  function toggleDivision(id: string) {
    if (id === requiredDivisionId) return;
    setDivisionIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (divisionIds.length === 0) {
      setError("Pilih minimal satu divisi.");
      return;
    }

    setLoading(true);

    const payload = { title, description, category, linkType, url, tags, published, divisionIds };

    try {
      const res = await fetch(isEdit ? `/api/items/${initial!.id}` : "/api/items", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan data.");
        setLoading(false);
        return;
      }
      const slug = getCategoryByKey(category)?.slug || "panduan";
      router.push(`${basePath}/${slug}`);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Contoh: Panduan Penggunaan Aplikasi eOffice"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Ringkasan singkat mengenai dokumen ini"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Divisi *</label>
        <div className="flex flex-wrap gap-2 border border-gray-200 rounded-lg p-3">
          {divisions.length === 0 && (
            <p className="text-sm text-gray-400">Belum ada divisi. Minta admin menambahkan divisi.</p>
          )}
          {divisions.map((d) => {
            const checked = divisionIds.includes(d.id);
            const locked = d.id === requiredDivisionId;
            return (
              <label
                key={d.id}
                className={`flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-full border cursor-pointer ${
                  checked
                    ? "bg-brand-50 border-brand-300 text-brand-700"
                    : "bg-white border-gray-300 text-gray-600"
                } ${locked ? "opacity-80 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={locked}
                  onChange={() => toggleDivision(d.id)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                {d.name}
              </label>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Bisa dipilih lebih dari satu divisi jika dokumen relevan untuk beberapa divisi.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Link (Google Drive / Website / YouTube) *
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          required
          placeholder="https://drive.google.com/... atau https://youtube.com/..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Cukup tempel link, jenis sumber (Drive/YouTube/Website) terdeteksi otomatis. Tidak perlu
          unggah file.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Link</label>
        <select
          value={linkType}
          onChange={(e) => setLinkType(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="DRIVE">Google Drive</option>
          <option value="YOUTUBE">YouTube</option>
          <option value="WEBSITE">Website</option>
          <option value="LAINNYA">Lainnya</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tag (pisahkan dengan koma)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="eoffice, panduan, persuratan"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        />
        Tampilkan di repository (terbit)
      </label>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg"
        >
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Dokumen"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-medium px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
