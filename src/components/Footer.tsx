export default function Footer() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Repository Bundakue Makassar";
  return (
    <footer className="mt-auto bg-gray-900 text-gray-300 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <p className="text-white font-medium">{siteName}</p>
          <p className="mt-1 text-gray-400">Sistem repositori dokumen internal Bundakue Makassar</p>
        </div>
        <div className="text-gray-400 sm:text-right">
          <p>&copy; {new Date().getFullYear()} Bundakue Makassar</p>
        </div>
      </div>
    </footer>
  );
}
