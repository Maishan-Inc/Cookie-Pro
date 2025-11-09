"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fetchAdminSettings } from "@/lib/admin-settings";
import { getSmtpSettings, upsertSmtpSettings } from "@/lib/mail/smtp";
import { upsertTemplate } from "@/lib/mail/templates";
import { verifyAdminSession } from "@/lib/security/admin-session";
import { upsertSystemSettings } from "@/lib/system-settings";
import {
  createUser,
  deleteUserById,
  findUserByEmail,
  updateUserPasswordHash,
} from "@/lib/users";

type ActionResult = {
  error?: string;
  success?: boolean;
};

async function ensureAdminAuth() {
  const settings = await fetchAdminSettings();
  if (!settings) return null;
  if (!(await verifyAdminSession(settings.admin_password_hash))) {
    return null;
  }
  return settings;
}

const smtpSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().min(1),
  secure: z.string().optional(),
  username: z.string().min(1),
  password: z.string().optional(),
  from_name: z.string().min(1),
  from_email: z.string().email(),
});

export async function saveSmtpSettings(_: unknown, formData: FormData): Promise<ActionResult> {
  const settings = await ensureAdminAuth();
  if (!settings) {
    return { error: "Unauthorized." };
  }
  const smtpSettings = await getSmtpSettings();

  const parsed = smtpSchema.safeParse({
    host: formData.get("host"),
    port: formData.get("port"),
    secure: formData.get("secure"),
    username: formData.get("username"),
    password: formData.get("password"),
    from_name: formData.get("from_name"),
    from_email: formData.get("from_email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }
  const password =
    parsed.data.password && parsed.data.password.length > 0
      ? parsed.data.password
      : smtpSettings?.password ?? "";
  if (!password) {
    return { error: "Password required." };
  }

  await upsertSmtpSettings({
    host: parsed.data.host,
    port: parsed.data.port,
    secure: Boolean(parsed.data.secure),
    username: parsed.data.username,
    password,
    from_name: parsed.data.from_name,
    from_email: parsed.data.from_email,
  });
  revalidatePath("/admin-dashboard");
  return { success: true };
}

const systemSchema = z.object({
  product_name: z.string().min(2),
  support_email: z.string().email().optional(),
  default_locale: z.enum(["en", "zh"]),
  theme_preference: z.enum(["auto", "light", "dark"]),
  allow_self_signup: z.boolean(),
  telemetry_retention_days: z.coerce.number().min(7).max(365),
});

export async function saveSystemSettings(_: unknown, formData: FormData): Promise<ActionResult> {
  const settings = await ensureAdminAuth();
  if (!settings) {
    return { error: "Unauthorized." };
  }
  const supportRaw = formData.get("support_email")?.toString().trim();
  const parsed = systemSchema.safeParse({
    product_name: formData.get("product_name"),
    support_email: supportRaw ? supportRaw : undefined,
    default_locale: formData.get("default_locale"),
    theme_preference: formData.get("theme_preference"),
    allow_self_signup: formData.get("allow_self_signup") === "on",
    telemetry_retention_days: formData.get("telemetry_retention_days"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }
  await upsertSystemSettings({
    product_name: parsed.data.product_name,
    support_email: parsed.data.support_email ?? null,
    default_locale: parsed.data.default_locale,
    theme_preference: parsed.data.theme_preference,
    allow_self_signup: parsed.data.allow_self_signup,
    telemetry_retention_days: parsed.data.telemetry_retention_days,
  });
  revalidatePath("/admin-dashboard");
  return { success: true };
}

const templateSchema = z.object({
  template_key: z.literal("verification_code"),
  locale: z.enum(["en", "zh"]),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export async function saveTemplate(_: unknown, formData: FormData): Promise<ActionResult> {
  const settings = await ensureAdminAuth();
  if (!settings) {
    return { error: "Unauthorized." };
  }
  const parsed = templateSchema.safeParse({
    template_key: formData.get("template_key") ?? "verification_code",
    locale: formData.get("locale"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }
  await upsertTemplate({
    key: parsed.data.template_key,
    locale: parsed.data.locale,
    subject: parsed.data.subject,
    body: parsed.data.body,
  });
  revalidatePath("/admin-dashboard");
  return { success: true };
}

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  locale: z.enum(["en", "zh"]),
});

export async function createUserAdmin(_: unknown, formData: FormData): Promise<ActionResult> {
  const settings = await ensureAdminAuth();
  if (!settings) {
    return { error: "Unauthorized." };
  }
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }
  const existing = await findUserByEmail(parsed.data.email);
  if (existing) {
    return { error: "User already exists." };
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await createUser({
    email: parsed.data.email,
    name: parsed.data.name,
    passwordHash,
    locale: parsed.data.locale,
  });
  revalidatePath("/admin-dashboard");
  return { success: true };
}

const resetSchema = z.object({
  user_id: z.coerce.number().min(1),
  password: z.string().min(8),
});

export async function resetUserPassword(_: unknown, formData: FormData): Promise<ActionResult> {
  const settings = await ensureAdminAuth();
  if (!settings) {
    return { error: "Unauthorized." };
  }
  const parsed = resetSchema.safeParse({
    user_id: formData.get("user_id"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await updateUserPasswordHash(parsed.data.user_id, passwordHash);
  revalidatePath("/admin-dashboard");
  return { success: true };
}

const deleteSchema = z.object({
  user_id: z.coerce.number().min(1),
});

export async function deleteUser(_: unknown, formData: FormData): Promise<ActionResult> {
  const settings = await ensureAdminAuth();
  if (!settings) {
    return { error: "Unauthorized." };
  }
  const parsed = deleteSchema.safeParse({
    user_id: formData.get("user_id"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }
  await deleteUserById(parsed.data.user_id);
  revalidatePath("/admin-dashboard");
  return { success: true };
}
