import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createEmployee,
  listEmployees,
} from "@/lib/zaposleniController";
import type { Uloga } from "@/shared/types";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Korisnik nema pristup podacima." },
        { status: 401 }
      );
    }

    const search = request.nextUrl.searchParams.get("search") || "";
    return await listEmployees(session, search);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Došlo je do greške. Aplikacija ne može." },
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
      !password ||
      !validUloga
    ) {
      return NextResponse.json(
        { error: "Došlo je do greške. Zaposleni nije uspešno unet." },
        { status: 400 }
      );
    }

    return await createEmployee(session, {
      ime,
      prezime,
      pozicija,
      plata: Number(plata),
      datum_dolaska,
      datum_odlaska: datum_odlaska || null,
      username,
      password,
      uloga: uloga as Uloga,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Došlo je do greške. Zaposleni nije uspešno unet." },
      { status: 500 }
    );
  }
}
