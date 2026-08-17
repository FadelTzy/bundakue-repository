"use client";

export default function DivisionFilterForm({
  action,
  q,
  divisionId,
  divisions,
}: {
  action: string;
  q: string;
  divisionId: string;
  divisions: { id: string; name: string }[];
}) {
  return (
    <form action={action} className="flex gap-2">
      {q && <input type="hidden" name="q" value={q} />}
      <select
        name="divisionId"
        defaultValue={divisionId}
        onChange={(e) => e.currentTarget.form?.submit()}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
      >
        <option value="">Semua Divisi</option>
        {divisions.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
    </form>
  );
}
