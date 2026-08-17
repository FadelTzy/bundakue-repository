# Repository Bundakue Makassar

Aplikasi Repository Dokumen internal untuk Bundakue Makassar. Berisi 3 kategori dokumen:
**Panduan, SOP, dan Peraturan / Dokumen**, masing-masing bisa ditandai ke satu atau beberapa
**Divisi**.

Ada dua peran:

- **Admin** — login dengan username & password (dari environment variable). Bisa melihat dan
  mengelola seluruh dokumen dari semua divisi, serta mengelola daftar Divisi (tambah/ubah/hapus,
  termasuk mengatur PIN).
- **Divisi (role user)** — login dengan memilih nama Divisi lalu memasukkan **PIN 6 digit**. Setelah
  PIN benar, akan tampil dashboard repository berisi Panduan/SOP/Peraturan yang terhubung dengan
  divisi tersebut. Akun Divisi bisa menambah dan mengubah dokumen, tapi **tidak bisa menghapus**.

Baik Admin maupun Divisi **tidak perlu mengunggah file** — cukup tempel link (Google Drive, website,
atau YouTube), dan aplikasi akan otomatis mendeteksi jenis sumbernya serta menampilkan preview
(embed) untuk YouTube dan Google Drive.

## Tumpukan Teknologi (Tech Stack)

- **Next.js 14** (App Router) + TypeScript — di-deploy ke Vercel
- **Tailwind CSS** — styling
- **Prisma ORM** + **PostgreSQL** — database (bisa pakai Vercel Postgres / Neon / Supabase, semua ada tier gratis)
- Autentikasi berbasis session cookie (JWT via `jose`), PIN divisi di-hash dengan `scrypt` bawaan Node.js

## Struktur Fitur

- **`/`** — halaman publik berisi pintu masuk ke Login Divisi atau Login Admin.
- **`/login`** — login Divisi: pilih nama divisi, masukkan PIN 6 digit.
- **`/dashboard`** (role Divisi) — repository Panduan / SOP / Peraturan-Dokumen yang terhubung ke
  divisi yang sedang login. Bisa tambah & ubah dokumen, tidak bisa hapus.
- **`/admin/login`** — login Admin (username & password dari environment variable).
- **`/admin`** (role Admin) — repository Panduan / SOP / Peraturan-Dokumen untuk semua divisi
  (dengan filter per divisi), plus menu **Divisi** untuk kelola divisi & PIN. Admin bisa
  tambah, ubah, hapus, dan terbitkan/sembunyikan dokumen.
- **`/item/[id]`** — detail dokumen (embed video YouTube / preview Google Drive bila tersedia),
  bisa diakses Admin atau Divisi yang terhubung dengan dokumen tersebut.

## 1. Menjalankan di Lokal

```bash
npm install
cp .env.example .env
```

Edit `.env` dan isi minimal:

```
DATABASE_URL="postgresql://..."   # lihat langkah 2 di bawah
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="password-anda"
AUTH_SECRET="string-acak-panjang-minimal-32-karakter"
```

Lalu buat tabel di database dan (opsional) isi contoh data (3 divisi contoh + beberapa dokumen):

```bash
npx prisma db push
npm run db:seed   # opsional, isi contoh divisi & dokumen
npm run dev
```

Buka `http://localhost:3000`:

- Login Divisi lewat `/login` (jika pakai data seed: Produksi/111111, Pemasaran/222222,
  Keuangan/333333).
- Login Admin lewat `/admin/login` dengan `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

## 2. Menyiapkan Database (gratis, cukup 5 menit)

Pilih salah satu (semua kompatibel dengan Prisma + Vercel):

- **Vercel Postgres** — dari dashboard proyek Vercel: Storage → Create Database → Postgres.
  `DATABASE_URL` akan otomatis tersedia sebagai environment variable.
- **Neon** (https://neon.tech) — buat project baru, salin connection string (yang mode
  "pooled"/"pgbouncer" jika tersedia) ke `DATABASE_URL`.
- **Supabase** (https://supabase.com) — buat project, ambil connection string dari
  Project Settings → Database.

Setelah `DATABASE_URL` didapat, jalankan `npx prisma db push` sekali untuk membuat tabel.

## 3. Deploy ke Vercel

### Opsi A — lewat GitHub (disarankan)

1. Push folder ini ke repository GitHub baru.
2. Buka https://vercel.com/new, import repository tersebut.
3. Saat konfigurasi proyek, isi **Environment Variables**:
   - `DATABASE_URL`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_SITE_NAME` (opsional)
4. Klik **Deploy**. Vercel otomatis menjalankan `npm install` (yang men-generate Prisma Client)
   lalu `npm run build`.
5. Setelah deploy pertama sukses, jalankan migrasi skema database sekali dari komputer lokal
   Anda (arahkan `DATABASE_URL` di `.env` lokal ke database produksi), lalu:
   ```bash
   npx prisma db push
   npm run db:seed   # opsional
   ```

### Opsi B — lewat Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel env add DATABASE_URL
vercel env add ADMIN_USERNAME
vercel env add ADMIN_PASSWORD
vercel env add AUTH_SECRET
vercel --prod
```

## 4. Login & Alur Akses

**Admin** — buka `/admin/login`, masuk dengan `ADMIN_USERNAME` / `ADMIN_PASSWORD`. Dari sana Admin bisa:

- Melihat & mengelola dokumen Panduan / SOP / Peraturan-Dokumen dari **semua divisi**
- Menambah, mengubah, menghapus, dan menerbitkan/menyembunyikan dokumen
- Menambah/mengubah/menghapus **Divisi**, termasuk mengatur PIN 6 digit tiap divisi (menu **Divisi**)

**Divisi** — buka `/login`, pilih nama divisi, masukkan PIN 6 digit yang diberikan Admin. Setelah PIN
benar, akan tampil dashboard repository berisi dokumen yang terhubung ke divisi tersebut. Dari sana
akun Divisi bisa:

- Melihat dokumen Panduan / SOP / Peraturan-Dokumen milik divisinya
- Menambah dokumen baru (bisa ditandai ke divisinya sendiri dan/atau divisi lain sekaligus)
- Mengubah dokumen yang terhubung dengan divisinya
- **Tidak bisa menghapus dokumen** (tombol hapus hanya muncul untuk Admin)

> Catatan keamanan: kredensial Admin adalah satu akun bersama (shared account) yang diatur lewat
> environment variable. PIN Divisi disimpan ter-hash (scrypt) di database, bukan plaintext. Untuk
> multi-admin dengan akun terpisah, tambahkan tabel `User` + hashing password sebagai pengembangan
> lanjutan.

## 5. Menyesuaikan Kategori / Divisi / Tampilan

- Daftar kategori & ikon ada di `src/lib/categories.ts` (saat ini: Panduan, SOP, Peraturan / Dokumen).
- Daftar Divisi dikelola lewat UI Admin (`/admin/divisi`), tersimpan di tabel `Division`.
- Warna tema (hijau) ada di `tailwind.config.ts` (`colors.brand`) — ganti sesuai identitas visual
  Bundakue Makassar jika perlu.
- Nama situs diatur lewat `NEXT_PUBLIC_SITE_NAME`.

## Struktur Folder Penting

```
prisma/schema.prisma          # skema database (KnowledgeItem, Division)
prisma/seed.ts                 # contoh divisi & dokumen
src/lib/categories.ts          # daftar kategori, deteksi jenis link, helper embed
src/lib/auth.ts                 # session (JWT cookie) + hashing PIN divisi
src/middleware.ts               # proteksi rute /admin (role ADMIN) dan /dashboard, /item (role ADMIN/USER)
src/app/page.tsx                # halaman publik: pintu masuk Login Divisi / Login Admin
src/app/login/                  # login Divisi (pilih divisi + PIN)
src/app/admin/login/            # login Admin (username/password)
src/app/admin/{panduan,sop,peraturan}/  # repository per kategori untuk Admin (semua divisi)
src/app/admin/divisi/           # kelola Divisi & PIN (Admin only)
src/app/dashboard/{panduan,sop,peraturan}/  # repository per kategori untuk Divisi (sesuai divisinya)
src/app/item/[id]/              # detail dokumen + embed
src/app/api/items/              # API CRUD dokumen (role-aware: filter & otorisasi per divisi)
src/app/api/divisions/          # API kelola Divisi (Admin only untuk create/update/delete)
src/app/api/auth/                # API login/logout Admin & Divisi
```
