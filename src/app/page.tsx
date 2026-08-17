import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-brand-700 to-brand-600 text-white">
          <div className="max-w-3xl mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold">Repository Bundakue Makassar</h1>
            <p className="mt-3 text-brand-100 max-w-xl mx-auto">
              Pusat dokumen Panduan, SOP, dan Peraturan / Dokumen internal Bundakue Makassar.
              Masuk sesuai peran Anda untuk mengakses repository divisi.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 -mt-10 pb-16">
          <div className="grid sm:grid-cols-2 gap-5">
            <Link
              href="/login"
              className="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-3 hover:border-brand-400 hover:shadow-md transition"
            >
              <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition text-xl">
                🔑
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Login Divisi</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Pilih divisi Anda lalu masukkan PIN 6 digit untuk membuka repository divisi.
                </p>
              </div>
            </Link>
            <Link
              href="/admin/login"
              className="group bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-3 hover:border-brand-400 hover:shadow-md transition"
            >
              <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition text-xl">
                🛠️
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Login Admin</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Masuk dengan username &amp; password admin untuk mengelola seluruh repository
                  dan divisi.
                </p>
              </div>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
