"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { DEFAULT_POLICY_VERSION } from "@/lib/constants";
import { generateSiteSalt } from "@/lib/crypto";
import { upsertAdminSettings } from "@/lib/admin-settings";
import { getServiceRoleClient } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { needsInstallation } from "@/lib/install/status";
import { setAdminSession } from "@/lib/security/admin-session";
import { ensureSystemSettings } from "@/lib/system-settings";

type TableName = keyof Database["public"]["Tables"];

const requiredTables: TableName[] = [
  "sites",
  "devices",
  "consents",
  "events",
  "admin_settings",
  "system_settings",
  "users",
  "smtp_settings",
  "email_templates",
  "verification_codes",
];

export type SchemaStatus = {
  name: TableName;
  ok: boolean;
  message?: string | null;
};

export async function testConnection() {
  try {
    const client = getServiceRoleClient();
    const versionResult = await client.rpc("pg_version_text");
    if (versionResult.error && versionResult.error.code !== "42883") {
      throw versionResult.error;
    }
    return {
      ok: true,
      version:
        (versionResult.data as string | null) ??
        "Upgrade required to expose version",
    };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

export async function getSchemaStatus(): Promise<SchemaStatus[]> {
  try {
    const client = getServiceRoleClient();
    const checks = await Promise.all(
      requiredTables.map(async (name) => {
        const { error } = await client
          .from(name)
          .select("id", { head: true, count: "exact" });
        if (error) {
          const message =
            error.code === "42P01"
              ? "Table missing. Run sql/01_init.sql."
              : error.message;
          return { name, ok: false, message };
        }
        return { name, ok: true };
      }),
    );
    return checks;
  } catch (error) {
    const fallback = (error as Error).message;
    return requiredTables.map((name) => ({
      name,
      ok: false,
      message: fallback,
    }));
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

  const client = getServiceRoleClient();
  const payload = {
    name,
    site_key: siteKey,
    site_salt: siteSalt,
    policy_version: policy,
    origin_whitelist: origins,
    captcha_provider: providerValue,
    captcha_site_key: captchaSiteKey,
    captcha_secret: captchaSecret,
  } satisfies Database["public"]["Tables"]["sites"]["Insert"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (client.from("sites") as any).insert([payload]);

  revalidatePath("/install");
}

const adminSchema = z.object({
  adminName: z.string().min(2),
  password: z.string().min(8),
  adminPath: z
    .string()
    .min(6)
    .regex(/^\/[a-zA-Z0-9\-]+$/, "Path must start with / and contain only URL-safe characters"),
});

export async function completeInstallation(input: {
  adminName: string;
  password: string;
  adminPath: string;
}) {
  if (!(await needsInstallation())) {
    throw new Error("Installation already completed.");
  }
  const payload = adminSchema.parse(input);
  const adminPath = payload.adminPath.replace(/^\//, "");
  const passwordHash = await bcrypt.hash(payload.password, 12);

  await upsertAdminSettings({
    admin_name: payload.adminName,
    admin_password_hash: passwordHash,
    admin_path: adminPath,
    install_complete: true,
  });

  await ensureSystemSettings();

  await setAdminSession(passwordHash);

  revalidatePath("/");
  revalidatePath("/install");
}
