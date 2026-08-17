import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin, isValidPin, verifySession } from "@/lib/auth";
import { slugify } from "@/lib/categories";

export async function GET() {
  const divisions = await prisma.division.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return NextResponse.json({ divisions });
}

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name, pin } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Nama divisi wajib diisi." }, { status: 400 });
    }
    if (!isValidPin(pin)) {
      return NextResponse.json({ error: "PIN harus 6 digit angka." }, { status: 400 });
    }

    const existing = await prisma.division.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json({ error: "Nama divisi sudah digunakan." }, { status: 400 });
    }

    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.division.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const division = await prisma.division.create({
      data: { name: name.trim(), slug, pinHash: hashPin(pin) },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json({ division }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menyimpan divisi." },
      { status: 500 }
    );
  }
}
