import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createZahtev, listZahtevi } from "@/lib/zahteviController";
import type { ZahtevTip } from "@/shared/types";

const TIPOVI: ZahtevTip[] = ["PLATA", "ODSUSTVO", "OTKAZ", "TIMBILDING"];

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Korisnik nema pristup zahtevu." },
        { status: 401 }
      );
    }

    const search = request.nextUrl.searchParams.get("search") || "";
    return await listZahtevi(session, search);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Došlo je do greške. Aplikacija ne može da pronađe traženi zahtev." },
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
    const tip = body?.tip as ZahtevTip;
    const opis = body?.opis != null ? String(body.opis) : "";

    if (!TIPOVI.includes(tip) || !opis.trim()) {
      return NextResponse.json(
        { error: "Zahtev nije ispravno podnet." },
        { status: 400 }
      );
    }

    // status novog zahteva uvek postavlja server, ne klijent
    return await createZahtev(session, { tip, opis, status: "PODNET" });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Došlo je do greške. Zahtev nije zapamćen." },
      { status: 500 }
    );
  }
}
