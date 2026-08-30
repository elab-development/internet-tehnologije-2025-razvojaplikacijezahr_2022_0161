import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/authController";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json(
        { error: "Neispravno korisničko ime i lozinka." },
        { status: 400 }
      );
    }

    return await loginUser(username, password);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Nije moguće otvoriti početnu stranu." },
      { status: 500 }
    );
  }
}
