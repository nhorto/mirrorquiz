import { initAuth } from "./auth";
import { headers } from "next/headers";

export async function getSession() {
  const auth = await initAuth();
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
