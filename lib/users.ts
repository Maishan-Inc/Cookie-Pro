import { getServiceRoleClient } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

export async function findUserByEmail(
  email: string,
): Promise<Database["public"]["Tables"]["users"]["Row"] | null> {
  const { data } = await getServiceRoleClient()
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return data ?? null;
}

export async function createUser({
  email,
  name,
  passwordHash,
  locale,
}: {
  email: string;
  name: string;
  passwordHash: string;
  locale: string;
}) {
  const payload: Database["public"]["Tables"]["users"]["Insert"] = {
    email: email.toLowerCase(),
    name,
    password_hash: passwordHash,
    locale,
  };
  const rows: Database["public"]["Tables"]["users"]["Insert"][] = [payload];
  // Supabase types regress to `never` under moduleResolution bundler, so cast for insert.
  const { data, error } = await (getServiceRoleClient().from("users") as any)
    .insert(rows)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export type UserRow = Database["public"]["Tables"]["users"]["Row"];

export async function listUsers(): Promise<UserRow[]> {
  const { data, error } = await getServiceRoleClient()
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as UserRow[]) ?? [];
}

export async function deleteUserById(userId: number) {
  const { error } = await getServiceRoleClient().from("users").delete().eq("id", userId);
  if (error) throw error;
}

export async function updateUserPasswordHash(userId: number, passwordHash: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (getServiceRoleClient().from("users") as any)
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}
