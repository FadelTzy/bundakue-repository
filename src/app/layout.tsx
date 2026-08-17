import type { Metadata } from "next";
import "./globals.css";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Repository Bundakue Makassar";

export const metadata: Metadata = {
  title: siteName,
  description: "Repository dokumen internal Bundakue Makassar: panduan, SOP, dan peraturan / dokumen per divisi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
