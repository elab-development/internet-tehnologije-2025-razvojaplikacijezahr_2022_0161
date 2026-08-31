import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createIzvestaji,
  listIzvestaji,
} from "@/lib/izvestajiController";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Morate biti prijavljeni." }, { status: 401 });
    }

    // kontroler sam vraća samo izveštaje u kojima je prijavljeni korisnik pomenut
    return await listIzvestaji(session);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Došlo je do greške. Izveštaj nije generisan." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Morate biti prijavljeni." }, { status: 401 });
    }

    const body = await request.json();
    const sadrzaj = body?.sadrzaj != null ? String(body.sadrzaj) : "";
    // autor izveštaja ne može da pomene samog sebe
    const pomenutiZaposleni = Array.isArray(body?.pomenuti_zaposleni)
      ? (body.pomenuti_zaposleni as unknown[])
          .map((v) => Number(v))
          .filter((v) => !Number.isNaN(v) && v !== session.zaposleni_id)
      : [];

    if (!sadrzaj.trim()) {
      return NextResponse.json(
        { error: "Sadržaj izveštaja mora biti popunjen." },
        { status: 400 }
      );
    }

    if (!pomenutiZaposleni.length) {
      return NextResponse.json(
        { error: "Morate izabrati bar jednog zaposlenog za izveštaj." },
        { status: 400 }
      );
    }

    return await createIzvestaji(session, {
      sadrzaj,
      pomenuti_zaposleni: pomenutiZaposleni,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Došlo je do greške. Izveštaj nije generisan." },
      { status: 500 }
    );
  }
}
