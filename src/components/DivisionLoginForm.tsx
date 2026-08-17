"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Division = { id: string; name: string; slug: string };

export default function DivisionLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [divisionId, setDivisionId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDivisions, setLoadingDivisions] = useState(true);

  useEffect(() => {
    fetch("/api/divisions")
      .then((res) => res.json())
      .then((data) => {
        setDivisions(data.divisions || []);
        if (data.divisions?.[0]) setDivisionId(data.divisions[0].id);
      })
      .finally(() => setLoadingDivisions(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/division-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ divisionId, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal.");
        setLoading(false);
        return;
      }
      const next = searchParams.get("next") || "/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
        <select
          value={divisionId}
          onChange={(e) => setDivisionId(e.target.value)}
          required
          disabled={loadingDivisions}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          {loadingDivisions && <option>Memuat divisi...</option>}
          {!loadingDivisions && divisions.length === 0 && (
            <option value="">Belum ada divisi terdaftar</option>
          )}
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">PIN 6 Digit</label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          required
          placeholder="••••••"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !divisionId}
        className="mt-2 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg"
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
