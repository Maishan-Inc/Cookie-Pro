import { randomBytes } from "node:crypto";

import { sha256 } from "@/lib/crypto";
import { getServiceRoleClient } from "@/lib/supabase";
import type { Database, Json } from "@/types/supabase";

export function generateVerificationCode() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    const idx = randomBytes(1)[0] % alphabet.length;
    code += alphabet[idx];
  }
  return code;
}

export async function storeVerificationCode({
  email,
  code,
  purpose,
  expiresAt,
  metadata,
}: {
  email: string;
  code: string;
  purpose: string;
  expiresAt: Date;
  metadata?: Json;
}) {
  const client = getServiceRoleClient();
  const payload: Database["public"]["Tables"]["verification_codes"]["Insert"] = {
    email,
    code_hash: sha256(code),
    purpose,
    expires_at: expiresAt.toISOString(),
    metadata,
  };
  const rows: Database["public"]["Tables"]["verification_codes"]["Insert"][] = [
    payload,
  ];
  const { error, data } = await (client.from("verification_codes") as any)
    .insert(rows)
    .select("id")
    .single();
  if (error) throw error;
  return data.id as number;
}

export async function consumeVerificationCode({
  email,
  code,
  purpose,
}: {
  email: string;
  code: string;
  purpose: string;
}): Promise<Database["public"]["Tables"]["verification_codes"]["Row"]> {
  const client = getServiceRoleClient();
  const hash = sha256(code);
  const { data, error } = await client
    .from("verification_codes")
    .select("*")
    .eq("email", email)
    .eq("purpose", purpose)
    .eq("code_hash", hash)
    .eq("consumed", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) {
    throw new Error("Invalid or expired verification code.");
  }
  const record = data as Database["public"]["Tables"]["verification_codes"]["Row"];
  const { error: updateError } = await (client.from("verification_codes") as any)
    .update({ consumed: true })
    .eq("id", record.id);
  if (updateError) throw updateError;
  return record;
}
