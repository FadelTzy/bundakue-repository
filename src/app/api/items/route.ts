import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { slugify } from "@/lib/categories";

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const divisionIdParam = searchParams.get("divisionId") || "";

  const divisionFilter =
    session.role === "USER" ? session.divisionId : divisionIdParam || undefined;

  const items = await prisma.knowledgeItem.findMany({
    where: {
      ...(category ? { category: category as any } : {}),
      ...(divisionFilter ? { divisions: { some: { id: divisionFilter } } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { divisions: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { title, description, category, linkType, url, tags, published, divisionIds } = body;

    if (!title || !category || !linkType || !url) {
      return NextResponse.json(
        { error: "Judul, kategori, jenis link, dan URL wajib diisi." },
        { status: 400 }
      );
    }
    if (!Array.isArray(divisionIds) || divisionIds.length === 0) {
      return NextResponse.json({ error: "Pilih minimal satu divisi." }, { status: 400 });
    }
    if (session.role === "USER" && !divisionIds.includes(session.divisionId)) {
      return NextResponse.json(
        { error: "Dokumen harus menyertakan divisi Anda sendiri." },
        { status: 403 }
      );
    }

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.knowledgeItem.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const item = await prisma.knowledgeItem.create({
      data: {
        title,
        slug,
        description: description || null,
        category,
        linkType,
        url,
        tags: tags || null,
        published: published ?? true,
        divisions: { connect: divisionIds.map((id: string) => ({ id })) },
      },
      include: { divisions: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menyimpan data." },
      { status: 500 }
    );
  }
}
