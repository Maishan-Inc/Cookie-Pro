import { cookies } from "next/headers";

import { sha256 } from "@/lib/crypto";

const SESSION_COOKIE = "admin_session";

function getSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE ?? ""
  );
}

export async function setAdminSession(passwordHash: string) {
  const token = sha256(passwordHash + getSecret());
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function verifyAdminSession(passwordHash: string) {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (!existing) return false;
  const token = sha256(passwordHash + getSecret());
  return existing === token;
}

export async function requireAdminSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    throw new Error("Admin session missing.");
  }
}
