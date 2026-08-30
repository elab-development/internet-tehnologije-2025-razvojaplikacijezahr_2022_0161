import { and, arrayContains, eq, gt, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "../db";
import { izvestajTable, zaposleniTable } from "@/db/schema";
import { isHrEmployee, type SessionUser } from "./auth";
import { hashPassword } from "./password";
import type { Uloga } from "../shared/types";
import { NextResponse } from "next/server";

export async function listEmployees(session: SessionUser, search: string): Promise<NextResponse> {
  const danas = new Date().toISOString().slice(0, 10);
  // bivši zaposleni (oni kojima je datum odlaska prošao) ne ulaze u spisak
  const aktivan = or(
    isNull(zaposleniTable.datum_odlaska),
    gt(zaposleniTable.datum_odlaska, danas)
  );

  const data = await db.transaction(async (tx) => {
    if (isHrEmployee(session.uloga)) {
      if (search.trim()) {
        const pattern = `%${search.trim()}%`;
        return await tx
          .select({
            zaposleni_id: zaposleniTable.zaposleni_id,
            ime: zaposleniTable.ime,
            prezime: zaposleniTable.prezime,
            pozicija: zaposleniTable.pozicija,
            plata: zaposleniTable.plata,
            datum_dolaska: zaposleniTable.datum_dolaska,
            datum_odlaska: zaposleniTable.datum_odlaska,
            username: zaposleniTable.username,
            uloga: zaposleniTable.uloga
          })
          .from(zaposleniTable)
          .where(
            and(
              aktivan,
              or(
                ilike(zaposleniTable.ime, pattern),
                ilike(zaposleniTable.prezime, pattern),
              )
            )
          )
      }
      return await tx
        .select({
          zaposleni_id: zaposleniTable.zaposleni_id,
          ime: zaposleniTable.ime,
          prezime: zaposleniTable.prezime,
          pozicija: zaposleniTable.pozicija,
          plata: zaposleniTable.plata,
          datum_dolaska: zaposleniTable.datum_dolaska,
          datum_odlaska: zaposleniTable.datum_odlaska,
          username: zaposleniTable.username,
          uloga: zaposleniTable.uloga
        })
        .from(zaposleniTable)
        .where(aktivan)
    }

    if (search.trim()) {
      const pattern = `%${search.trim()}%`;
      return await tx
        .select({
          zaposleni_id: zaposleniTable.zaposleni_id,
          ime: zaposleniTable.ime,
          prezime: zaposleniTable.prezime,
          pozicija: zaposleniTable.pozicija,
          plata: zaposleniTable.plata,
          datum_dolaska: zaposleniTable.datum_dolaska,
          datum_odlaska: zaposleniTable.datum_odlaska,
          username: zaposleniTable.username,
          uloga: zaposleniTable.uloga
        })
        .from(zaposleniTable)
        .where(
          or(
            ilike(zaposleniTable.ime, pattern),
            ilike(zaposleniTable.prezime, pattern)
          )
        )
    }

    return await tx
      .select({
        zaposleni_id: zaposleniTable.zaposleni_id,
        ime: zaposleniTable.ime,
        prezime: zaposleniTable.prezime,
        pozicija: zaposleniTable.pozicija,
        plata: zaposleniTable.plata,
        datum_dolaska: zaposleniTable.datum_dolaska,
        datum_odlaska: zaposleniTable.datum_odlaska,
        username: zaposleniTable.username,
        uloga: zaposleniTable.uloga
      })
      .from(zaposleniTable)
      .where(eq(zaposleniTable.zaposleni_id, session.zaposleni_id))
  })

  if (data.length) return NextResponse.json({message: "Pronađeni zaposleni", data})
  else return NextResponse.json({message: "Ne postoje zaposleni", data: []})
}

export async function createEmployee(
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
    return NextResponse.json({ error: "Korisnik nema pristup podacima." }, { status: 403 });
  }

  const password = await hashPassword(data.password);

  await db.transaction(async (tx) => {
    await tx.insert(zaposleniTable).values({
      ime: data.ime,
      prezime: data.prezime,
      pozicija: data.pozicija,
      plata: String(data.plata),
      datum_dolaska: data.datum_dolaska,
      datum_odlaska: data.datum_odlaska,
      username: data.username,
      password,
      uloga: data.uloga,
    });
  });

  return NextResponse.json({message: "Zaposleni je uspešno dodat."})
}

export async function updateEmployee(
  session: SessionUser,
  data: {
    ime: string;
    prezime: string;
    pozicija: string;
    plata: number;
    datum_dolaska: string;
    datum_odlaska: string | null;
    username: string;
    password?: string;
    uloga: Uloga;
    zaposleni_id: number
  }
): Promise<NextResponse> {
  if (!isHrEmployee(session.uloga)) {
    return NextResponse.json(
      { error: "Samo HR može da menja podatke o zaposlenima" },
      { status: 403 }
    );
  }

  // bez nove lozinke ostaje undefined, a Drizzle takva polja izostavlja iz UPDATE-a
  const password = data.password ? await hashPassword(data.password) : undefined;

  await db.transaction(async (tx) => {
    await tx
      .update(zaposleniTable)
      .set({
        ime: data.ime,
        prezime: data.prezime,
        pozicija: data.pozicija,
        plata: String(data.plata),
        datum_dolaska: data.datum_dolaska,
        datum_odlaska: data.datum_odlaska,
        username: data.username,
        uloga: data.uloga,
        password
      })
      .where(eq(zaposleniTable.zaposleni_id, data.zaposleni_id));
  });

  return NextResponse.json({message: "Zaposleni je uspešno promenjen"})
}

export async function deleteEmployee(zaposleni_id: number, session: SessionUser) {
  if (!isHrEmployee(session.uloga)) {
    return NextResponse.json({ error: "Korisnik nema pristup." }, { status: 403 });
  }

  const datum = new Date().toISOString().slice(0, 10);

  await db.transaction(async (tx) => {
    // red se ne briše iz baze, nego se evidentira datum odlaska, da bi zahtevi,
    // evaluacije i izveštaji ostali povezani sa osobom koja ih je kreirala
    await tx
      .update(zaposleniTable)
      .set({ datum_odlaska: datum })
      .where(eq(zaposleniTable.zaposleni_id, zaposleni_id));

    // Postgres ne može da drži strani ključ nad elementima niza, pa se id
    // ručno uklanja iz svih izveštaja u kojima je zaposleni pomenut
    await tx
      .update(izvestajTable)
      .set({
        pomenuti_zaposleni: sql`array_remove(${izvestajTable.pomenuti_zaposleni}, ${zaposleni_id}::integer)`,
      })
      .where(arrayContains(izvestajTable.pomenuti_zaposleni, [zaposleni_id]));
  });

  return NextResponse.json({message: "Zaposleni je evidentiran kao bivši zaposleni."})
}
