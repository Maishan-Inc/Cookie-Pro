import { getServiceRoleClient } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

const client = () => getServiceRoleClient();

export async function getSiteByKey(
  siteKey: string,
): Promise<Database["public"]["Tables"]["sites"]["Row"]> {
  const { data, error } = await client()
    .from("sites")
    .select("*")
    .eq("site_key", siteKey)
    .maybeSingle();
  if (error || !data) {
    throw new Error(`Site not found for key ${siteKey}`);
  }
  return data;
}

export async function getDevice(
  siteId: number,
  deviceId: string,
): Promise<Database["public"]["Tables"]["devices"]["Row"] | null> {
  const { data, error } = await client()
    .from("devices")
    .select("*")
    .eq("site_id", siteId)
    .eq("device_id", deviceId)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

export async function upsertDevice(
  siteId: number,
  deviceId: string,
): Promise<void> {
  const now = new Date().toISOString();
  const payload = {
    site_id: siteId,
    device_id: deviceId,
    last_seen_at: now,
  } satisfies Database["public"]["Tables"]["devices"]["Insert"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client().from("devices") as any).upsert(payload, {
    onConflict: "site_id,device_id",
  });
  if (error) throw error;
}

export async function insertConsent({
  siteId,
  deviceId,
  policyVersion,
  choices,
  userAgent,
  ipTruncated,
}: {
  siteId: number;
  deviceId: string;
  policyVersion: string;
  choices: Record<string, boolean>;
  userAgent: string | null;
  ipTruncated: string | null;
}): Promise<void> {
  const payload = {
    site_id: siteId,
    device_id: deviceId,
    policy_version: policyVersion,
    choices,
    user_agent: userAgent,
    ip_truncated: ipTruncated,
  } satisfies Database["public"]["Tables"]["consents"]["Insert"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client().from("consents") as any).upsert(payload, {
    onConflict: "site_id,device_id,policy_version",
  });
  if (error) throw error;
}

export async function latestConsent(
  siteId: number,
  deviceId: string,
): Promise<Database["public"]["Tables"]["consents"]["Row"] | null> {
  const { data, error } = await client()
    .from("consents")
    .select("*")
    .eq("site_id", siteId)
    .eq("device_id", deviceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

export async function insertEvents(
  entries: Array<Database["public"]["Tables"]["events"]["Insert"]>,
): Promise<void> {
  if (!entries.length) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client().from("events") as any).insert(entries);
  if (error) throw error;
}

export async function getDashboard(
  siteKey: string,
): Promise<Database["public"]["Functions"]["get_consent_dashboard"]["Returns"]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client().rpc as any)("get_consent_dashboard", {
    p_site_key: siteKey,
  });
  if (error) throw error;
  return data ?? [];
}
