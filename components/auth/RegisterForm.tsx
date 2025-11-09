"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import { completeRegistration, startRegistration } from "@/app/register/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

type RegisterState = {
  success?: boolean;
  error?: string;
  email?: string;
  locale?: Locale;
};

const initialState: RegisterState = {};

export function RegisterForm({ locale, translations }: { locale: Locale; translations: Dictionary }) {
  const [pendingState, startAction] = useActionState<RegisterState, FormData>(startRegistration, initialState);
  const [verifyState, verifyAction] = useActionState<RegisterState, FormData>(completeRegistration, initialState);
  const [code, setCode] = useState(Array(6).fill(""));
  const message = useMemo(() => {
    if (verifyState.success) return translations.register.success;
    if (verifyState.error) {
      const err = verifyState.error as string;
      if (err?.includes("SMTP settings not configured")) {
        return translations.alerts.smtpMissing;
      }
      return translations.alerts.verificationFailed;
    }
    if (pendingState.success) return translations.alerts.registrationStarted;
    if (pendingState.error) {
      const err = pendingState.error as string;
      if (err?.includes("SMTP settings not configured")) {
        return translations.alerts.smtpMissing;
      }
      return err;
    }
    return null;
  }, [pendingState, verifyState, translations]);

  useEffect(() => {
    if (verifyState.success) {
      const timer = setTimeout(() => {
        window.location.href = "/user";
      }, 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [verifyState.success]);

  const showVerification = pendingState.success && pendingState.email;

  const inputs = useMemo(() => new Array(6).fill(0), []);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^[A-Za-z0-9]?$/.test(value)) return;
    setCode((prev) => {
      const next = [...prev];
      next[index] = value.toUpperCase();
      return next;
    });
    if (value) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  return (
    <div className="space-y-6">
      {!showVerification && (
        <form action={startAction} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="text-sm text-zinc-600 dark:text-zinc-300">
            {translations.register.name}
            <input
              name="name"
              required
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </label>
          <label className="text-sm text-zinc-600 dark:text-zinc-300">
            {translations.register.email}
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </label>
          <label className="text-sm text-zinc-600 dark:text-zinc-300">
            {translations.register.password}
            <input
              type="password"
              name="password"
              required
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </label>
          <button
            type="submit"
            className="btn-press w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {translations.register.submit}
          </button>
        </form>
      )}

      {showVerification && (
        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="email" value={pendingState.email} />
          <input
            type="hidden"
            name="locale"
            value={pendingState.locale ?? locale}
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {translations.register.codeSubtitle} ({pendingState.email})
          </p>
          <div className="flex items-center justify-between gap-2">
            {inputs.map((_, index) => (
              <input
                key={`code-${index}`}
                id={`code-${index}`}
                maxLength={1}
                value={code[index] ?? ""}
                onChange={(event) => handleCodeChange(index, event.target.value)}
                className="h-12 w-12 rounded-2xl border border-zinc-300 text-center text-lg font-semibold tracking-widest text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && !code[index] && index > 0) {
                    const prev = document.getElementById(`code-${index - 1}`);
                    prev?.focus();
                  }
                }}
              />
            ))}
          </div>
          <input type="hidden" name="code" value={code.join("")} />
          <button
            type="submit"
            className="btn-press w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {translations.register.verify}
          </button>
        </form>
      )}

      {message && (
        <p
          className={`text-sm ${
            pendingState.error || verifyState.error
              ? "text-rose-500 dark:text-rose-400"
              : "text-emerald-600 dark:text-emerald-400"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  );
}
