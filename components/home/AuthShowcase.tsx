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
    <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 p-1 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl transition dark:border-white/10 dark:bg-zinc-900/70 dark:ring-white/10">
      <div className="flex gap-2 rounded-[30px] bg-zinc-100/70 p-1 text-sm font-semibold text-zinc-500 dark:bg-white/5 dark:text-zinc-300">
        {(["login", "register"] satisfies Mode[]).map((tab) => {
          const active = mode === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setMode(tab)}
              className={`flex-1 rounded-[24px] px-4 py-2 transition ${active ? "bg-white text-zinc-900 shadow dark:bg-white/90 dark:text-zinc-900" : "hover:text-zinc-900 dark:hover:text-white"}`}
              aria-pressed={active}
            >
              {tab === "login" ? translations.nav.login : translations.nav.register}
            </button>
          );
        })}
      </div>
      <div className="relative mt-6 min-h-[430px] rounded-[30px] bg-white/95 p-6 shadow-xl transition dark:bg-zinc-950/80">
        <div key={mode} className="animate-step">
          {mode === "login" ? (
            <>
              <div className="mb-6 space-y-1">
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
              <div className="mb-6 space-y-1">
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
      <span className="pointer-events-none absolute -left-12 top-8 h-64 w-64 rounded-full bg-gradient-to-br from-zinc-200/60 to-transparent blur-3xl dark:from-white/10" />
      <span className="pointer-events-none absolute -right-8 bottom-4 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-200/80 to-transparent blur-3xl dark:from-emerald-400/20" />
    </div>
  );
}
