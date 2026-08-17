"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditIcon, TrashIcon, PlusIcon } from "./Icons";

type Division = { id: string; name: string; slug: string };

export default function DivisionsManager({ divisions }: { divisions: Division[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPin, setEditPin] = useState("");
  const [editError, setEditError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    if (!/^\d{6}$/.test(pin)) {
      setCreateError("PIN harus 6 digit angka.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/divisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Gagal menambah divisi.");
        return;
      }
      setName("");
      setPin("");
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  function startEdit(d: Division) {
    setEditingId(d.id);
    setEditName(d.name);
    setEditPin("");
    setEditError("");
  }

  async function handleUpdate(id: string) {
    setEditError("");
    if (editPin && !/^\d{6}$/.test(editPin)) {
      setEditError("PIN harus 6 digit angka.");
      return;
    }
    setBusyId(id);
    try {
      const res = await fetch(`/api/divisions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, ...(editPin ? { pin: editPin } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Gagal memperbarui divisi.");
        return;
      }
      setEditingId(null);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `Hapus divisi "${name}"? Dokumen yang hanya terhubung ke divisi ini akan kehilangan tautan divisi. Tindakan ini tidak dapat dibatalkan.`
      )
    )
      return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/divisions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Gagal menghapus divisi.");
      } else {
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleCreate}
        className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Divisi</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Contoh: Produksi"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div className="w-full sm:w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">PIN 6 digit</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            required
            placeholder="123456"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <PlusIcon className="w-4 h-4" /> Tambah Divisi
        </button>
      </form>
      {createError && (
        <p className="-mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {createError}
        </p>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nama Divisi</th>
              <th className="text-left px-4 py-3 font-medium">PIN Baru (opsional)</th>
              <th className="text-right px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {divisions.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-gray-500">
                  Belum ada divisi. Tambahkan divisi terlebih dahulu.
                </td>
              </tr>
            )}
            {divisions.map((d) => {
              const isEditing = editingId === d.id;
              const busy = busyId === d.id;
              return (
                <tr key={d.id} className={busy ? "opacity-50" : ""}>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{d.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={editPin}
                        onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="Kosongkan jika tidak diubah"
                        className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm tracking-widest"
                      />
                    ) : (
                      <span className="text-gray-400">••••••</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {isEditing ? (
                        <>
                          <button
                            disabled={busy}
                            onClick={() => handleUpdate(d.id)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(d)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand-600"
                            title="Ubah"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => handleDelete(d.id, d.name)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                            title="Hapus"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                    {isEditing && editError && (
                      <p className="text-xs text-red-600 mt-1 text-right">{editError}</p>
                    )}
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
