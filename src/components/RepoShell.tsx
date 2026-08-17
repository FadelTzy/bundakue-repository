"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoutIcon, BookIcon, ClipboardIcon, ScaleIcon, BuildingIcon } from "./Icons";

type NavItem = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => JSX.Element;
};

export default function RepoShell({
  role,
  divisionName,
  children,
}: {
  role: "ADMIN" | "USER";
  divisionName?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const base = role === "ADMIN" ? "/admin" : "/dashboard";

  const NAV: NavItem[] = [
    { href: `${base}/panduan`, label: "Panduan", icon: BookIcon },
    { href: `${base}/sop`, label: "SOP", icon: ClipboardIcon },
    { href: `${base}/peraturan`, label: "Peraturan / Dokumen", icon: ScaleIcon },
    ...(role === "ADMIN" ? [{ href: "/admin/divisi", label: "Divisi", icon: BuildingIcon }] : []),
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(role === "ADMIN" ? "/admin/login" : "/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 bg-brand-800 text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-semibold leading-tight">Repository Bundakue Makassar</p>
          <p className="text-xs text-brand-200">
            {role === "ADMIN" ? "Admin" : `Divisi ${divisionName}`}
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  active ? "bg-white/15 text-white" : "text-brand-100 hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-brand-100 hover:bg-white/10 text-left"
          >
            <LogoutIcon className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
