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
          className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
      </label>
      <label className="text-sm text-zinc-600 dark:text-zinc-300">
        {translations.auth.password}
        <input
          type="password"
          name="password"
          required
          className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
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
