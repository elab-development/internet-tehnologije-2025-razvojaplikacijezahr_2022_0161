import { arrayContains, eq } from "drizzle-orm";
import { db } from "@/db";
import { NextResponse } from "next/server";
import { izvestajTable, zaposleniTable } from "@/db/schema";
import { isHrManager, type SessionUser } from "@/lib/auth";
import next from "next";


export async function listIzvestaji(session: SessionUser): Promise<NextResponse> {
  try {
    const data =  await db.transaction(async (tx) => {
      return await tx
        .select({
          izvestaj_id: izvestajTable.izvestaj_id,
          sadrzaj: izvestajTable.sadrzaj,
          datum_kreiranja: izvestajTable.datum_kreiranja,
          pomenuti_zaposleni: izvestajTable.pomenuti_zaposleni,
          zaposleni_id: izvestajTable.zaposleni_id,
          ime: zaposleniTable.ime,
          prezime: zaposleniTable.prezime,
        })
        .from(izvestajTable)
        .leftJoin(
          zaposleniTable,
          eq(izvestajTable.zaposleni_id, zaposleniTable.zaposleni_id)
        )
        .where(arrayContains(izvestajTable.pomenuti_zaposleni, [session.zaposleni_id]))
    })
    if(data) return NextResponse.json({message: "Pronadjeni izveštaji", data})
    else return NextResponse.json({message: "Ne postoje izveštaji"})
   }
  catch (e) {
    return NextResponse.json({ error: e, status: 500 });
  }
}

export async function createIzvestaji(
  session: SessionUser,
  data: {sadrzaj: string, pomenuti_zaposleni: number[]}
): Promise<NextResponse> {
  if (!isHrManager(session.uloga)) {
    return NextResponse.json({message:"Samo menadžer HR-a može generisati izveštaj.", status: 403 });
  }

  const datum = new Date().toISOString().slice(0, 10);

  try {
    await db.transaction(async (tx) => {
      await tx.insert(izvestajTable).values({
        sadrzaj: data.sadrzaj,
        datum_kreiranja: datum,
        pomenuti_zaposleni: data.pomenuti_zaposleni,
        zaposleni_id: session.zaposleni_id
      });
    })
    return NextResponse.json({message: "Izveštaj je uspešno kreiran"})
  }
  catch (e) {
    return NextResponse.json({error: e, status: 500})
  }
}
