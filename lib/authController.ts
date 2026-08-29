import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "../db";
import { zaposleniTable } from "@/db/schema";
import {
  isHrEmployee,
  setSessionCookie,
  toSessionUser,
  type SessionUser,
} from "./auth";
import type { Uloga } from "../shared/types";

export async function loginUser(
  username: string,
  password: string
): Promise<NextResponse> {
  try {
    const data = await db.transaction(async (tx) => {
      return await tx
        .select({
          zaposleni_id: zaposleniTable.zaposleni_id,
          ime: zaposleniTable.ime,
          prezime: zaposleniTable.prezime,
          uloga: zaposleniTable.uloga,
          username: zaposleniTable.username,
        })
        .from(zaposleniTable)
        .where(
          and(
            eq(zaposleniTable.username, username),
            eq(zaposleniTable.password, password)
          )
        );
    });

    if (!data) {
      return NextResponse.json(
        { error: "Neispravno korisničko ime i lozinka." },
        { status: 401 }
      );
    }
  
    const user = toSessionUser(data[0]);
    const response = NextResponse.json({
      message: "Ispravno korisničko ime i lozinka.",
      user,
    });
    setSessionCookie(response, user);
    return response;
  }
  catch (e) {
    return NextResponse.json({error: e, status: 500});
  }
}

export async function registerEmployee(
  session: SessionUser,
  data: {
    ime: string;
    prezime: string;
    pozicija: string;
    plata: number;
    datum_dolaska: string;
    datum_odlaska: string | null;
    username: string;
    password: string;
    uloga: Uloga;
  }
): Promise<NextResponse> {
  if (!isHrEmployee(session.uloga)) {
    return NextResponse.json(
      { error: "Samo HR može dodavati nove zaposlene." },
      { status: 403 }
    );
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(zaposleniTable).values({
        ime: data.ime,
        prezime: data.prezime,
        pozicija: data.pozicija,
        plata: String(data.plata),
        datum_dolaska: data.datum_dolaska,
        datum_odlaska: data.datum_odlaska,
        username: data.username,
        password: data.password,
        uloga: data.uloga,
      });
    });
  } catch (e)  {
    return NextResponse.json({error: e, status: 500});
  }

  return NextResponse.json({ message: "Zaposleni je uspešno dodat." });
}

export async function changePassword(
  session: SessionUser,
  oldPassword: string,
  newPassword: string
): Promise<NextResponse> {
  let updated: boolean;
  try {
    updated = await db.transaction(async (tx) => {
      const data = await tx
        .select({ zaposleni_id: zaposleniTable.zaposleni_id })
        .from(zaposleniTable)
        .where(
          and(
            eq(zaposleniTable.zaposleni_id, session.zaposleni_id),
            eq(zaposleniTable.password, oldPassword)
          )
        );

      if (!data) return false;

      await tx
        .update(zaposleniTable)
        .set({ password: newPassword })
        .where(eq(zaposleniTable.zaposleni_id, session.zaposleni_id));

      return true;
    });
  } catch (e) {
    return NextResponse.json({error: e, status: 500});
  }

  if (!updated) {
    return NextResponse.json(
      { error: "Stara lozinka nije ispravna." },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "Lozinka je uspešno promenjena." });
}
