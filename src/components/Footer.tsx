export default function Footer() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Repository Bundakue Makassar";
  return (
    <footer className="mt-auto bg-secondary-900 text-secondary-200 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <p className="text-white font-medium">{siteName}</p>
          <p className="mt-1 text-secondary-300">Sistem repositori dokumen internal Bundakue Makassar</p>
        </div>
        <div className="text-secondary-300 sm:text-right">
          <p>&copy; {new Date().getFullYear()} Bundakue Makassar</p>
        </div>
      </div>
    </footer>
  );
}
