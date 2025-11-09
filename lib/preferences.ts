"use server";

import { revalidatePath } from "next/cache";

import type { Locale } from "@/lib/i18n/dictionaries";
import { setServerLocale } from "@/lib/i18n/server";

export async function setLocalePreference(locale: Locale) {
  await setServerLocale(locale);
  revalidatePath("/", "layout");
}
