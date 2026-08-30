import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { changePassword } from "@/lib/authController";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Morate biti prijavljeni." }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body as {
      oldPassword?: string;
      newPassword?: string;
    };

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Stara i nova lozinka moraju biti unete." },
        { status: 400 }
      );
    }

    return await changePassword(session, oldPassword, newPassword);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Došlo je do greške. Lozinka nije promenjena." },
      { status: 500 }
    );
  }
}
