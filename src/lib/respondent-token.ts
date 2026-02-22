import { cookies } from "next/headers";
import { nanoid } from "nanoid";

const COOKIE_NAME = "pq_respondent";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function getOrCreateRespondentToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME);
  if (existing?.value) return existing.value;

  const token = nanoid(32);
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
  return token;
}

export async function getRespondentToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}
