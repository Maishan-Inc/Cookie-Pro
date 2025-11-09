import { getServiceRoleClient } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

export type SystemSettingsRow =
  Database["public"]["Tables"]["system_settings"]["Row"];

export const DEFAULT_SYSTEM_SETTINGS: Database["public"]["Tables"]["system_settings"]["Insert"] =
  {
    product_name: "Cookie-Pro",
    default_locale: "zh",
    theme_preference: "auto",
    allow_self_signup: true,
    support_email: null,
    telemetry_retention_days: 90,
  };

const table = () => getServiceRoleClient().from("system_settings");

export async function getSystemSettings(): Promise<SystemSettingsRow> {
  const { data, error } = await table().select("*").limit(1).maybeSingle();
  if (error && error.code !== "PGRST116") {
    throw error;
  }
  if (data) {
    return data;
  }
  return {
    id: 0,
    product_name: DEFAULT_SYSTEM_SETTINGS.product_name ?? "Cookie-Pro",
    default_locale: DEFAULT_SYSTEM_SETTINGS.default_locale ?? "zh",
    theme_preference: DEFAULT_SYSTEM_SETTINGS.theme_preference ?? "auto",
    allow_self_signup: DEFAULT_SYSTEM_SETTINGS.allow_self_signup ?? true,
    support_email: DEFAULT_SYSTEM_SETTINGS.support_email ?? null,
    telemetry_retention_days:
      DEFAULT_SYSTEM_SETTINGS.telemetry_retention_days ?? 90,
    updated_at: new Date(0).toISOString(),
  };
}

export async function ensureSystemSettings() {
  const { data } = await table().select("id").limit(1).maybeSingle();
  if (data) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (table() as any).insert([
    {
      ...DEFAULT_SYSTEM_SETTINGS,
    },
  ]);
  if (error) throw error;
}

export async function upsertSystemSettings(
  input: Database["public"]["Tables"]["system_settings"]["Insert"],
) {
  const payload = {
    ...DEFAULT_SYSTEM_SETTINGS,
    ...input,
    updated_at: new Date().toISOString(),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (table() as any).upsert(payload, {
    onConflict: "id",
  });
  if (error) throw error;
}
