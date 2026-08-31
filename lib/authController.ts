import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "../db";
import { zaposleniTable } from "@/db/schema";
import {
  isHrEmployee,
  setSessionCookie,
  toSessionUser,
  type SessionUser,
} from "./auth";
import { hashPassword, verifyPassword } from "./password";
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
          password: zaposleniTable.password,
        })
        .from(zaposleniTable)
        .where(eq(zaposleniTable.username, username));
    });

    const row = data[0];
    if (!row || !(await verifyPassword(password, row.password))) {
      return NextResponse.json(
        { error: "Neispravno korisničko ime i lozinka." },
        { status: 401 }
      );
    }

    const user = toSessionUser(row);
    const response = NextResponse.json({
      message: "Ispravno korisničko ime i lozinka.",
      user,
    });
    setSessionCookie(response, user);
    return response;
  }
  catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Greška prilikom prijave." },
      { status: 500 }
    );
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
        password: await hashPassword(data.password),
        uloga: data.uloga,
      });
    });
  } catch (e)  {
    console.error(e);
    return NextResponse.json(
      { error: "Greška prilikom dodavanja zaposlenog." },
      { status: 500 }
    );
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
        .select({ password: zaposleniTable.password })
        .from(zaposleniTable)
        .where(eq(zaposleniTable.zaposleni_id, session.zaposleni_id));

      const row = data[0];
      if (!row || !(await verifyPassword(oldPassword, row.password))) return false;

      await tx
        .update(zaposleniTable)
        .set({ password: await hashPassword(newPassword) })
        .where(eq(zaposleniTable.zaposleni_id, session.zaposleni_id));

      return true;
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Greška prilikom promene lozinke." },
      { status: 500 }
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: "Stara lozinka nije ispravna." },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "Lozinka je uspešno promenjena." });
}
