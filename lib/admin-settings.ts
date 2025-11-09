import { getServiceRoleClient } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

export type AdminSettings =
  Database["public"]["Tables"]["admin_settings"]["Row"];

const table = () => getServiceRoleClient().from("admin_settings");

export async function fetchAdminSettings(): Promise<AdminSettings | null> {
  const { data, error } = await table().select("*").limit(1).maybeSingle();
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    if (error.details?.includes("relation") || error.code === "42P01") {
      return null;
    }
    throw error;
  }
  return data ?? null;
}

export async function upsertAdminSettings(
  payload: Database["public"]["Tables"]["admin_settings"]["Insert"],
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (table() as any).upsert(payload, { onConflict: "id" });
  if (error) throw error;
}
