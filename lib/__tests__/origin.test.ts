import { describe, expect, it } from "vitest";
import { isOriginAllowed } from "@/lib/origin";
import type { Database } from "@/types/supabase";

const site: Database["public"]["Tables"]["sites"]["Row"] = {
  id: 1,
  name: "Test",
  site_key: "site_key",
  site_salt: "salt",
  policy_version: "v1",
  captcha_provider: null,
  captcha_site_key: null,
  captcha_secret: null,
  origin_whitelist: ["https://allowed.test"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("origin allow list", () => {
  it("accepts matching origin", () => {
    const allowed = isOriginAllowed({
      originHeader: "https://allowed.test",
      refererHeader: null,
      site,
    });
    expect(allowed).toBe(true);
  });

  it("rejects when no header matches", () => {
    const allowed = isOriginAllowed({
      originHeader: "https://evil.test",
      refererHeader: null,
      site,
    });
    expect(allowed).toBe(false);
  });
});
