"use client";

import { useState } from "react";

import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

type Mode = "login" | "register";

type Props = {
  locale: Locale;
  translations: Dictionary;
};

export function AuthShowcase({ locale, translations }: Props) {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div className="flex flex-col gap-4 rounded-3xl border surface-card p-4 shadow-sm transition">
      <div className="flex gap-2 rounded-2xl border surface-muted p-1 text-sm font-semibold text-zinc-500 dark:text-zinc-300">
        {(["login", "register"] satisfies Mode[]).map((tab) => {
          const active = mode === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setMode(tab)}
              className={`flex-1 rounded-2xl px-3 py-2 transition ${active ? "bg-white text-zinc-900 shadow-sm dark:bg-white/90 dark:text-zinc-900" : "hover:text-zinc-900 dark:hover:text-white"}`}
              aria-pressed={active}
            >
              {tab === "login" ? translations.nav.login : translations.nav.register}
            </button>
          );
        })}
      </div>
      <div className="rounded-2xl border surface-card p-4">
        <div key={mode} className="animate-step space-y-5">
          {mode === "login" ? (
            <>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  {translations.hero.cardTitle}
                </p>
                <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                  {translations.auth.loginTitle}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {translations.auth.loginSubtitle}
                </p>
              </div>
              <LoginForm translations={translations} />
            </>
          ) : (
            <>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  {translations.register.title}
                </p>
                <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                  {translations.register.subtitle}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {translations.register.subtitle}
                </p>
              </div>
              <RegisterForm locale={locale} translations={translations} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
