import { getServiceRoleClient } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

const client = () => getServiceRoleClient();

export async function getSiteByKey(siteKey: string) {
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

export async function getDevice(siteId: number, deviceId: string) {
  const { data, error } = await client()
    .from("devices")
    .select("*")
    .eq("site_id", siteId)
    .eq("device_id", deviceId)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

export async function upsertDevice(siteId: number, deviceId: string) {
  const now = new Date().toISOString();
  const { error } = await client()
    .from("devices")
    .upsert(
      { site_id: siteId, device_id: deviceId, last_seen_at: now },
      { onConflict: "site_id,device_id" },
    );
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
}) {
  const { error } = await client().from("consents").upsert(
    {
      site_id: siteId,
      device_id: deviceId,
      policy_version: policyVersion,
      choices,
      user_agent: userAgent,
      ip_truncated: ipTruncated,
    },
    { onConflict: "site_id,device_id,policy_version" },
  );
  if (error) throw error;
}

export async function latestConsent(siteId: number, deviceId: string) {
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
) {
  if (!entries.length) return;
  const { error } = await client().from("events").insert(entries);
  if (error) throw error;
}

export async function getDashboard(siteKey: string) {
  const { data, error } = await client().rpc("get_consent_dashboard", {
    p_site_key: siteKey,
  });
  if (error) throw error;
  return data;
}
