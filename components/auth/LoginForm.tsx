"use client";

import { useActionState, useEffect, useMemo } from "react";

import { loginAction } from "@/app/login/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ActionResult = {
  error?: string;
  success?: boolean;
};

const initialState: ActionResult = {};

export function LoginForm({ translations }: { translations: Dictionary }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    loginAction,
    initialState,
  );

  const message = useMemo(() => {
    if (state?.error) return state.error as string;
    if (state?.success) return translations.alerts.loginSuccess;
    return null;
  }, [state, translations.alerts.loginSuccess]);

  useEffect(() => {
    if (state?.success) {
      const redirectTimer = setTimeout(() => {
        window.location.href = "/user";
      }, 1000);
      return () => clearTimeout(redirectTimer);
    }
    return undefined;
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <label className="text-sm text-zinc-600 dark:text-zinc-300">
        {translations.auth.email}
        <input
          type="email"
          name="email"
          required
          className="mt-2 w-full rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-3 text-base text-zinc-900 shadow-inner focus:border-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-900/60 dark:text-white dark:focus:border-white dark:focus:ring-white/10"
        />
      </label>
      <label className="text-sm text-zinc-600 dark:text-zinc-300">
        {translations.auth.password}
        <input
          type="password"
          name="password"
          required
          className="mt-2 w-full rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-3 text-base text-zinc-900 shadow-inner focus:border-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-900/60 dark:text-white dark:focus:border-white dark:focus:ring-white/10"
        />
      </label>
      <button
        type="submit"
        className="btn-press w-full rounded-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-900/30 transition hover:-translate-y-0.5 hover:brightness-110 dark:from-white dark:via-white dark:to-zinc-200 dark:text-zinc-900"
      >
        {translations.auth.submit}
      </button>
      {message && (
        <p
          className={`text-sm ${state?.error ? "text-rose-500 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
