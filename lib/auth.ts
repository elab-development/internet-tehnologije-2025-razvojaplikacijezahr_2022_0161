import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { SessionUserDto, Uloga } from "../shared/types";

export const SESSION_COOKIE = "hr_session";

export type SessionUser = SessionUserDto;

export function cookieOpts(): {
  httpOnly: boolean;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  };
}

export function setSessionCookie(response: NextResponse, user: SessionUser): void {
  response.cookies.set(
    SESSION_COOKIE,
    encodeURIComponent(JSON.stringify(user)),
    cookieOpts()
  );
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", { maxAge: 0 });
}

export async function getSession(): Promise<SessionUser | null> {
  const c = await cookies();
  const raw = c.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as SessionUser;
  } catch {
    return null;
  }
}

export function isHrEmployee(uloga: Uloga): boolean {
  return uloga === "ZAPOSLENI U HR-u" || uloga === "MENADZER U HR-u";
}

export function isHrManager(uloga: Uloga): boolean {
  return uloga === "MENADZER U HR-u";
}

export function canApproveRequest(uloga: Uloga): boolean {
  return isHrManager(uloga);
}

export function toSessionUser(row: {
  zaposleni_id: number;
  ime: string;
  prezime: string;
  uloga: string;
  username: string;
}): SessionUser {
  return {
    zaposleni_id: row.zaposleni_id,
    ime: row.ime,
    prezime: row.prezime,
    uloga: row.uloga as Uloga,
    username: row.username,
  };
}
