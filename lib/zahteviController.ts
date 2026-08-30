import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "../db";
import {
  obradaZahtevaTable,
  odobravanjeZahtevaTable,
  zahtevTable,
  zaposleniTable,
} from "@/db/schema";
import {
  isHrEmployee,
  isHrManager,
  type SessionUser,
} from "./auth";
import { NextResponse } from "next/server"
import type { ZahtevStatus, ZahtevTip } from "../shared/types";

export async function listZahtevi(session: SessionUser, search: string): Promise<NextResponse> {
  const data = await db.transaction(async (tx) => {
    if (isHrEmployee(session.uloga)) {
      if (search.trim()) {
        const pattern = `%${search.trim()}%`;
        return await tx
          .select({
            zahtev_id: zahtevTable.zahtev_id,
            tip: zahtevTable.tip,
            opis: zahtevTable.opis,
            status: zahtevTable.status,
            datum_kreiranja: zahtevTable.datum_kreiranja,
            zaposleni_id: zahtevTable.zaposleni_id,
            ime: zaposleniTable.ime,
            prezime: zaposleniTable.prezime,
          })
          .from(zahtevTable)
          .leftJoin(
            zaposleniTable,
            eq(zahtevTable.zaposleni_id, zaposleniTable.zaposleni_id)
          )
          .where(
            or(
              ilike(zahtevTable.tip, pattern),
              ilike(zahtevTable.status, pattern),
            )
          )
      }
      return await tx
        .select({
          zahtev_id: zahtevTable.zahtev_id,
          tip: zahtevTable.tip,
          opis: zahtevTable.opis,
          status: zahtevTable.status,
          datum_kreiranja: zahtevTable.datum_kreiranja,
          zaposleni_id: zahtevTable.zaposleni_id,
          ime: zaposleniTable.ime,
          prezime: zaposleniTable.prezime,
        })
        .from(zahtevTable)
        .leftJoin(
          zaposleniTable,
          eq(zahtevTable.zaposleni_id, zaposleniTable.zaposleni_id)
        )
    }

    if (search.trim()) {
      const pattern = `%${search.trim()}%`;
      return await tx
        .select({
          zahtev_id: zahtevTable.zahtev_id,
          tip: zahtevTable.tip,
          opis: zahtevTable.opis,
          status: zahtevTable.status,
          datum_kreiranja: zahtevTable.datum_kreiranja,
          zaposleni_id: zahtevTable.zaposleni_id,
        })
        .from(zahtevTable)
        .where(
          and(
            eq(zahtevTable.zaposleni_id, session.zaposleni_id),
            or(
              ilike(zahtevTable.tip, pattern),
              ilike(zahtevTable.status, pattern)
            )
          )
        )
    }

    return await tx
      .select({
        zahtev_id: zahtevTable.zahtev_id,
        tip: zahtevTable.tip,
        opis: zahtevTable.opis,
        status: zahtevTable.status,
        datum_kreiranja: zahtevTable.datum_kreiranja,
        zaposleni_id: zahtevTable.zaposleni_id,
      })
      .from(zahtevTable)
      .where(eq(zahtevTable.zaposleni_id, session.zaposleni_id))
  })

  if (data.length) return NextResponse.json({message: "Pronađeni zahtevi", data})
  else return NextResponse.json({message: "Ne postoje zahtevi", data: []})
}

export async function createZahtev(
  session: SessionUser,
  data: {tip: ZahtevTip, opis: string, status: ZahtevStatus}
): Promise<NextResponse> {

  const datum = new Date().toISOString().slice(0, 10);

  await db.transaction(async (tx) => {
    await tx.insert(zahtevTable).values({
      tip: data.tip,
      opis: data.opis,
      status: data.status,
      datum_kreiranja: datum,
      zaposleni_id: session.zaposleni_id
    });
  })

  return NextResponse.json({message: "Zahtev je uspešno kreiran"})
}

export async function obradiZahtev(session: SessionUser, data: {zahtev_id: number, komentar: string}
): Promise<NextResponse> {
  if (!isHrEmployee(session.uloga)) {
    return NextResponse.json({ error: "Samo HR može obraditi zahtev." }, { status: 403 });
  }

  const datum = new Date().toISOString().slice(0, 10);

  await db.transaction(async (tx) => {
    await tx.insert(obradaZahtevaTable).values({
      zaposleni_id: session.zaposleni_id,
      zahtev_id: data.zahtev_id,
      komentar: data.komentar,
      obradjen: "DA",
      datum_obrade: datum,
    });

    await tx
      .update(zahtevTable)
      .set({ status: "CEKA ODOBRENJE" })
      .where(eq(zahtevTable.zahtev_id, data.zahtev_id));
  });

  return NextResponse.json({message: "Zahtev uspešno obrađen"})
}

export async function odobriZahtev(
  session: SessionUser,
  data: {zahtev_id: number, komentar: string, odobren: "DA" | "NE"}
): Promise<NextResponse> {
  if (!isHrManager(session.uloga)) {
    return NextResponse.json(
      { error: "Samo menadžer HR-a može odobriti zahtev." },
      { status: 403 }
    );
  }

  const datum = new Date().toISOString().slice(0, 10);
  const status = data.odobren == "DA" ? "ODOBREN": "ODBIJEN"

  await db.transaction(async (tx) => {
    await tx.insert(odobravanjeZahtevaTable).values({
      zaposleni_id: session.zaposleni_id,
      zahtev_id: data.zahtev_id,
      komentar: data.komentar,
      odobren: data.odobren,
      datum_odobravanja: datum,
    });

    await tx
      .update(zahtevTable)
      .set({ status:  status})
      .where(eq(zahtevTable.zahtev_id, data.zahtev_id));
  });

  return NextResponse.json({message: "Zahtev uspešno odobren"})
}
