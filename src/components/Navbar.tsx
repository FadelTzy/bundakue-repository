import Link from "next/link";

export default function Navbar() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Repository Bundakue Makassar";
  return (
    <header className="bg-brand-700 text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/15">
            📚
          </span>
          <span className="leading-tight">{siteName}</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/login" className="hover:text-brand-100">
            Login Divisi
          </Link>
        </nav>
      </div>
    </header>
  );
}
