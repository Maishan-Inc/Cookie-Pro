"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { generateSiteSalt } from "@/lib/crypto";
import { getServiceRoleClient } from "@/lib/supabase";
import { DEFAULT_POLICY_VERSION } from "@/lib/constants";
import type { Database } from "@/types/supabase";

export async function testConnection() {
  try {
    const { error } = await getServiceRoleClient()
      .from("sites")
      .select("id")
      .limit(1)
      .single();
    if (error && error.code !== "PGRST116") {
      throw error;
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

export async function createSite(formData: FormData) {
  const name = formData.get("name")?.toString() ?? "Default site";
  const origins = formData
    .get("origins")
    ?.toString()
    .split("\n")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];
  const policy = formData.get("policy")?.toString() ?? DEFAULT_POLICY_VERSION;
  const captchaProvider = formData.get("captchaProvider")?.toString() || null;
  const captchaSiteKey = formData.get("captchaSiteKey")?.toString() || null;
  const captchaSecret = formData.get("captchaSecret")?.toString() || null;
  const providerValue =
    (captchaProvider as Database["public"]["Tables"]["sites"]["Row"]["captcha_provider"]) ??
    null;

  const siteKey = `site_${randomUUID().replace(/-/g, "")}`;
  const siteSalt = generateSiteSalt();

  await getServiceRoleClient().from("sites").insert({
    name,
    site_key: siteKey,
    site_salt: siteSalt,
    policy_version: policy,
    origin_whitelist: origins,
    captcha_provider: providerValue,
    captcha_site_key: captchaSiteKey,
    captcha_secret: captchaSecret,
  });

  revalidatePath("/install");
  return { siteKey, policyVersion: policy };
}
