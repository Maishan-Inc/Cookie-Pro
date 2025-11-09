import { getServiceRoleClient } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

export type UsageOverviewRow =
  Database["public"]["Functions"]["get_usage_overview"]["Returns"][number];

export type UsageBySiteRow =
  Database["public"]["Functions"]["get_usage_by_site"]["Returns"][number];

export type UsageOverview = UsageOverviewRow;
export type UsageBySite = UsageBySiteRow;

const defaultOverview: UsageOverviewRow = {
  sites: 0,
  devices: 0,
  consents: 0,
  events: 0,
  events_24h: 0,
  consents_24h: 0,
  last_event: null,
  last_consent: null,
};

export async function getUsageOverview(): Promise<UsageOverviewRow> {
  const client = getServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client.rpc as any)("get_usage_overview");
  if (error) throw error;
  if (!data || data.length === 0) return defaultOverview;
  return data[0];
}

export async function getUsageBySite(limit = 5): Promise<UsageBySiteRow[]> {
  const client = getServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client.rpc as any)("get_usage_by_site", {
    p_limit: limit,
  });
  if (error) throw error;
  return data ?? [];
}
