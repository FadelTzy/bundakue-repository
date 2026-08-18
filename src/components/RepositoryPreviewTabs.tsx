"use client";

import { useState } from "react";
import Link from "next/link";
import { LockIcon } from "./Icons";

type CategoryPreview = {
  key: string;
  label: string;
  icon: string;
  items: { id: string; title: string }[];
};

export default function RepositoryPreviewTabs({ categories }: { categories: CategoryPreview[] }) {
  const [activeKey, setActiveKey] = useState(categories[0]?.key);
  const active = categories.find((c) => c.key === activeKey) || categories[0];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto px-2">
        {categories.map((category) => {
          const isActive = category.key === active?.key;
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => setActiveKey(category.key)}
              className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition ${
                isActive
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {category.label}
              <span className="ml-1.5 text-xs text-gray-400">({category.items.length})</span>
            </button>
          );
        })}
      </div>

      <div className="max-h-[50vh] overflow-y-auto p-5">
        {!active || active.items.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada dokumen.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {active.items.map((item) => (
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
    </div>
  );
}
