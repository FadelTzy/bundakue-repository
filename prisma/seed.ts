import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "crypto";

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function hashPin(pin: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const divisionSeeds = [
    { name: "Produksi", pin: "111111" },
    { name: "Pemasaran", pin: "222222" },
    { name: "Keuangan", pin: "333333" },
  ];

  const divisions = [];
  for (const d of divisionSeeds) {
    const division = await prisma.division.upsert({
      where: { name: d.name },
      update: {},
      create: { name: d.name, slug: slugify(d.name), pinHash: hashPin(d.pin) },
    });
    divisions.push(division);
  }
  const [produksi, pemasaran, keuangan] = divisions;

  const items = [
    {
      title: "Panduan Penggunaan Sistem Kasir",
      description: "Panduan langkah demi langkah penggunaan sistem kasir untuk transaksi harian.",
      category: "PANDUAN" as const,
      linkType: "DRIVE" as const,
      url: "https://drive.google.com/drive/folders/contoh-panduan-kasir",
      tags: "kasir,panduan,operasional",
      divisionIds: [pemasaran.id],
    },
    {
      title: "SOP Produksi Kue Harian",
      description: "Standar operasional prosedur produksi kue harian di dapur pusat.",
      category: "SOP" as const,
      linkType: "DRIVE" as const,
      url: "https://drive.google.com/file/d/contoh-sop-produksi/view",
      tags: "sop,produksi,dapur",
      divisionIds: [produksi.id],
    },
    {
      title: "SOP Pengajuan Reimbursement",
      description: "Standar operasional prosedur pengajuan reimbursement bagi seluruh divisi.",
      category: "SOP" as const,
      linkType: "DRIVE" as const,
      url: "https://drive.google.com/file/d/contoh-sop-reimburse/view",
      tags: "sop,keuangan,reimbursement",
      divisionIds: [keuangan.id, produksi.id, pemasaran.id],
    },
    {
      title: "Peraturan Jam Kerja dan Cuti Karyawan",
      description: "Dokumen resmi mengenai jam kerja, izin, dan cuti karyawan Bundakue Makassar.",
      category: "PERATURAN" as const,
      linkType: "DRIVE" as const,
      url: "https://drive.google.com/file/d/contoh-peraturan-jam-kerja/view",
      tags: "peraturan,kepegawaian",
      divisionIds: [produksi.id, pemasaran.id, keuangan.id],
    },
  ];

  for (const item of items) {
    const slug = slugify(item.title);
    const { divisionIds, ...data } = item;
    await prisma.knowledgeItem.upsert({
      where: { slug },
      update: {},
      create: {
        ...data,
        slug,
        divisions: { connect: divisionIds.map((id) => ({ id })) },
      },
    });
  }

  console.log(`Seeded ${divisions.length} divisi dan ${items.length} contoh dokumen.`);
  console.log("PIN divisi contoh:", divisionSeeds.map((d) => `${d.name}=${d.pin}`).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
