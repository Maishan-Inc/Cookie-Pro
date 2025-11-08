import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";
import { getServerEnv } from "@/lib/env";

let client: SupabaseClient<Database> | null = null;

function withTimeout(fetchImpl: typeof fetch, timeoutMs = 5000) {
  return (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const requestInit = { ...(init ?? {}), signal: controller.signal };

    return fetchImpl(input, requestInit)
      .finally(() => clearTimeout(id));
  };
}

export function getServiceRoleClient(): SupabaseClient<Database> {
  if (client) return client;
  const env = getServerEnv();

  client = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "X-Client-Info": "cookie-pro/0.1.0",
      },
      fetch: withTimeout(fetch),
    },
  });

  return client;
}
