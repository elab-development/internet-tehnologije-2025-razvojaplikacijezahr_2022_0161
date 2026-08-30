import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createEvaluacija,
  listEvaluacije,
} from "@/lib/evaluacijeController";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Zaposleni nema pristup evaluaciji." },
        { status: 401 }
      );
    }

    return await listEvaluacije(session);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Došlo je do greške. Evaluacija nije popunjena." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Zaposleni nema pristup evaluaciji." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sadrzaj, ocena, naziv_projekta } = body;
    if (sadrzaj == null || ocena == null || naziv_projekta == null) {
      return NextResponse.json(
        { error: "Došlo je do greške. Evaluacija nije popunjena." },
        { status: 400 }
      );
    }

    return await createEvaluacija(session, {
      sadrzaj: String(sadrzaj),
      ocena: Number(ocena),
      naziv_projekta: String(naziv_projekta),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Došlo je do greške. Evaluacija nije popunjena." },
      { status: 500 }
    );
  }
}
