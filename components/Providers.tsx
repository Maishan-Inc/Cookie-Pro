"use client";

import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import type { Locale } from "@/lib/i18n/dictionaries";

export function AppProviders({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider locale={locale}>
      <ThemeProvider>{children}</ThemeProvider>
    </LocaleProvider>
  );
}
