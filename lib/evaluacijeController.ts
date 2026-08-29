import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { evaluacijaTable, zaposleniTable } from "@/db/schema";
import { isHrEmployee, type SessionUser } from "@/lib/auth";

export async function listEvaluacije(
  session: SessionUser
): Promise<NextResponse> {
  try {
    const data = await db.transaction(async (tx) => {
      if (isHrEmployee(session.uloga)) {
        return tx
          .select({
            evaluacija_id: evaluacijaTable.evaluacija_id,
            sadrzaj: evaluacijaTable.sadrzaj,
            ocena: evaluacijaTable.ocena,
            datum_podnosenja: evaluacijaTable.datum_podnosenja,
            naziv_projekta: evaluacijaTable.naziv_projekta,
            zaposleni_id: evaluacijaTable.zaposleni_id,
            ime: zaposleniTable.ime,
            prezime: zaposleniTable.prezime,
          })
          .from(evaluacijaTable)
          .leftJoin(
            zaposleniTable,
            eq(evaluacijaTable.zaposleni_id, zaposleniTable.zaposleni_id)
          );
      }

      return tx
        .select({
          evaluacija_id: evaluacijaTable.evaluacija_id,
          sadrzaj: evaluacijaTable.sadrzaj,
          ocena: evaluacijaTable.ocena,
          datum_podnosenja: evaluacijaTable.datum_podnosenja,
          naziv_projekta: evaluacijaTable.naziv_projekta,
          zaposleni_id: evaluacijaTable.zaposleni_id,
        })
        .from(evaluacijaTable)
        .where(eq(evaluacijaTable.zaposleni_id, session.zaposleni_id));
    });

    if (data) return NextResponse.json({ message: "Pronađene evaluacije.", data });
    else return NextResponse.json({message: "Ne postoje evaluacije"})
  } catch (e) {
    return NextResponse.json({error: e, status: 500});
    }
}

export async function createEvaluacija(
  session: SessionUser,
  data: { sadrzaj: string; ocena: number; naziv_projekta: string }
): Promise<NextResponse> {
  const datum = new Date().toISOString().slice(0, 10);

  try {
    await db.transaction(async (tx) => {
      await tx.insert(evaluacijaTable).values({
        sadrzaj: String(data.sadrzaj).trim(),
        ocena: Number(data.ocena),
        datum_podnosenja: datum,
        naziv_projekta: String(data.naziv_projekta).trim(),
        zaposleni_id: session.zaposleni_id,
      });
    }
    )
    return NextResponse.json({ message: "Evaluacija je uspešno popunjena." });
  } catch (e) {
    return NextResponse.json(
      {error: e, status: 500});
    }
}
