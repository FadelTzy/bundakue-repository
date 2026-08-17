import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

async function canAccessItem(
  session: Awaited<ReturnType<typeof verifySession>>,
  itemDivisionIds: string[]
) {
  if (!session) return false;
  if (session.role === "ADMIN") return true;
  return itemDivisionIds.includes(session.divisionId);
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const item = await prisma.knowledgeItem.findUnique({
    where: { id: params.id },
    include: { divisions: { select: { id: true, name: true } } },
  });
  if (!item) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  if (!(await canAccessItem(session, item.divisions.map((d) => d.id)))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return NextResponse.json({ item });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const existing = await prisma.knowledgeItem.findUnique({
      where: { id: params.id },
      include: { divisions: { select: { id: true } } },
    });
    if (!existing) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
    if (!(await canAccessItem(session, existing.divisions.map((d) => d.id)))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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

    const item = await prisma.knowledgeItem.update({
      where: { id: params.id },
      data: {
        title,
        description: description || null,
        category,
        linkType,
        url,
        tags: tags || null,
        published: published ?? true,
        divisions: { set: divisionIds.map((id: string) => ({ id })) },
      },
      include: { divisions: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ item });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memperbarui data." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await verifySession();
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.knowledgeItem.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menghapus data." },
      { status: 500 }
    );
  }
}
