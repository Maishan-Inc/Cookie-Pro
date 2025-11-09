"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { getTemplate } from "@/lib/mail/templates";
import { sendMail } from "@/lib/mail/smtp";
import { generateVerificationCode, storeVerificationCode, consumeVerificationCode } from "@/lib/verification";
import { createUser, findUserByEmail } from "@/lib/users";
import { setUserSession } from "@/lib/security/user-session";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getSystemSettings } from "@/lib/system-settings";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  locale: z.enum(["en", "zh"]),
});

export async function startRegistration(_: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    locale: formData.get("locale") ?? "en",
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }
  const { name, email, password, locale } = parsed.data;
  const systemSettings = await getSystemSettings();
  if (!systemSettings.allow_self_signup) {
    return {
      error:
        locale === "zh"
          ? "管理员已关闭自助注册。"
          : "Self-service registration is disabled.",
    };
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    return { error: "Account already exists. Please login." };
  }

  try {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await storeVerificationCode({
      email,
      code,
      purpose: "register",
      expiresAt,
      metadata: { name, password, locale },
    });

    const template = await getTemplate({
      key: "verification_code",
      locale: locale === "zh" ? "zh" : "en",
    });
    const html = template.body.replace(/{{CODE}}/g, code);

    await sendMail({
      to: email,
      subject: template.subject,
      html,
    });

    return {
      success: true,
      email,
      locale,
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function completeRegistration(_: unknown, formData: FormData) {
  const code = String(formData.get("code") ?? "");
  const email = String(formData.get("email") ?? "");
  const locale = (formData.get("locale") as Locale) ?? "en";
  if (!code || code.length !== 6) {
    return { error: "Invalid code." };
  }

  try {
    const record = await consumeVerificationCode({
      email,
      code,
      purpose: "register",
    });

    const metadata = (record.metadata ?? {}) as { name?: string; password?: string; locale?: Locale };
    if (!metadata.name || !metadata.password) {
      return { error: "Registration metadata missing. Please restart." };
    }

    const passwordHash = await bcrypt.hash(metadata.password, 12);
    const user = await createUser({
      email,
      name: metadata.name,
      passwordHash,
      locale: metadata.locale ?? locale,
    });
    await setUserSession(user);
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
