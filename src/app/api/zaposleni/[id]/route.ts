import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  deleteEmployee,
  updateEmployee,
} from "@/lib/zaposleniController";
import type { Uloga } from "@/shared/types";

export async function PUT(
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
    const {
      ime,
      prezime,
      pozicija,
      plata,
      datum_dolaska,
      datum_odlaska,
      username,
      password,
      uloga,
    } = body;

    const validUloga = ["ZAPOSLENI", "ZAPOSLENI U HR-u", "MENADZER U HR-u"].includes(uloga);
    if (
      !ime ||
      !prezime ||
      !pozicija ||
      plata == null ||
      !datum_dolaska ||
      !username ||
      !validUloga
    ) {
      return NextResponse.json(
        { error: "Došlo je do greške. Aplikacija ne može da zapamti podatke o zaposlenom." },
        { status: 400 }
      );
    }

    return await updateEmployee(session, {
      ime,
      prezime,
      pozicija,
      plata: Number(plata),
      datum_dolaska,
      datum_odlaska: datum_odlaska || null,
      username,
      // prazna lozinka znači "ne menjaj lozinku" – Drizzle preskače undefined
      password: password || undefined,
      uloga: uloga as Uloga,
      zaposleni_id: id,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Došlo je do greške. Aplikacija ne može da zapamti podatke o zaposlenom." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
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

    return await deleteEmployee(id, session);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Došlo je do greške. Aplikacija ne može da obriše zaposlenog." },
      { status: 500 }
    );
  }
}
