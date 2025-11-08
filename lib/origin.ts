import type { Database } from "@/types/supabase";

export function isOriginAllowed({
  originHeader,
  refererHeader,
  site,
}: {
  originHeader: string | null;
  refererHeader: string | null;
  site: Database["public"]["Tables"]["sites"]["Row"];
}): boolean {
  const whitelist = site.origin_whitelist;
  if (!whitelist.length) return true;

  const candidates = [originHeader, refererHeader]
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value as string).origin;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as string[];

  if (!candidates.length) return false;

  return candidates.some((origin) => whitelist.includes(origin));
}
