import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin, isValidPin, verifySession } from "@/lib/auth";

async function requireAdmin() {
  const session = await verifySession();
  return session?.role === "ADMIN";
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name, pin } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Nama divisi wajib diisi." }, { status: 400 });
    }
    if (pin && !isValidPin(pin)) {
      return NextResponse.json({ error: "PIN harus 6 digit angka." }, { status: 400 });
    }

    const duplicate = await prisma.division.findFirst({
      where: { name: name.trim(), NOT: { id: params.id } },
    });
    if (duplicate) {
      return NextResponse.json({ error: "Nama divisi sudah digunakan." }, { status: 400 });
    }

    const division = await prisma.division.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        ...(pin ? { pinHash: hashPin(pin) } : {}),
      },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json({ division });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memperbarui divisi." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.division.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menghapus divisi." },
      { status: 500 }
    );
  }
}
