"use server";

import { cookies } from "next/headers";

import { sha256 } from "@/lib/crypto";
import { getServiceRoleClient } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

const USER_COOKIE = "cp_user";

function getSecret() {
  return (
    process.env.USER_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE ?? ""
  );
}

export async function setUserSession(user: Database["public"]["Tables"]["users"]["Row"]) {
  const token = sha256(`${user.id}:${user.password_hash}:${getSecret()}`);
  const store = await cookies();
  store.set(USER_COOKIE, `${user.id}.${token}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearUserSession() {
  const store = await cookies();
  store.delete(USER_COOKIE);
}

export async function getCurrentUser(): Promise<Database["public"]["Tables"]["users"]["Row"] | null> {
  const store = await cookies();
  const value = store.get(USER_COOKIE)?.value;
  if (!value) return null;
  const [idRaw, token] = value.split(".");
  if (!idRaw || !token) return null;
  const userId = Number(idRaw);
  if (Number.isNaN(userId)) return null;
  const client = getServiceRoleClient();
  const { data } = await client.from("users").select("*").eq("id", userId).maybeSingle();
  const user = data as Database["public"]["Tables"]["users"]["Row"] | null;
  if (!user) return null;
  const expected = sha256(`${user.id}:${user.password_hash}:${getSecret()}`);
  if (expected !== token) return null;
  return user;
}
