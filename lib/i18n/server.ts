"use server";

import { cookies } from "next/headers";

import type { Locale } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSystemSettings } from "@/lib/system-settings";

const COOKIE_KEY = "cp_locale";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(COOKIE_KEY)?.value as Locale | undefined;
  if (stored === "en" || stored === "zh") {
    return stored;
  }
  try {
    const settings = await getSystemSettings();
    if (settings.default_locale === "zh") {
      return "zh";
    }
  } catch {
    // ignore failures and fall through to default
  }
  return "en";
}

export async function setServerLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_KEY, locale, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 31536000,
  });
}

export async function getTranslations(locale: Locale) {
  return getDictionary(locale);
}
