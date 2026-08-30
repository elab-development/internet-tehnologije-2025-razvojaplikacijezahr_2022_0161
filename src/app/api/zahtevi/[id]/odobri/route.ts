import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { odobriZahtev } from "@/lib/zahteviController";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Morate biti prijavljeni." }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Neispravan ID." }, { status: 400 });
    }

    const body = await request.json();
    const odobren = body.odobren === true ? "DA" : "NE";
    const komentar = body.komentar != null ? String(body.komentar) : "";

    return await odobriZahtev(session, { zahtev_id: id, komentar, odobren });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Došlo je do greške. Zahtev nije uspešno zapamćen" },
      { status: 500 }
    );
  }
}
