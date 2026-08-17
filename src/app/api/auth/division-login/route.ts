import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, isValidPin, verifyPin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { divisionId, pin } = await req.json();
    if (!divisionId || !pin) {
      return NextResponse.json({ error: "Divisi dan PIN wajib diisi." }, { status: 400 });
    }
    if (!isValidPin(pin)) {
      return NextResponse.json({ error: "PIN harus 6 digit angka." }, { status: 400 });
    }

    const division = await prisma.division.findUnique({ where: { id: divisionId } });
    if (!division || !verifyPin(pin, division.pinHash)) {
      return NextResponse.json({ error: "Divisi atau PIN salah." }, { status: 401 });
    }

    await createSession({ role: "USER", divisionId: division.id, divisionName: division.name });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}
