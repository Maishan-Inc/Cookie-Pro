"use client";

import { createContext, useContext, useTransition } from "react";

import type { Locale } from "@/lib/i18n/dictionaries";
import { setLocalePreference } from "@/lib/preferences";

type LocaleContextValue = {
  locale: Locale;
  updateLocale: (locale: Locale) => void;
  pending: boolean;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  const updateLocale = (next: Locale) => {
    if (next === locale) return;
    startTransition(async () => {
      await setLocalePreference(next);
    });
  };

  return (
    <LocaleContext.Provider
      value={{ locale, updateLocale, pending: isPending }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
