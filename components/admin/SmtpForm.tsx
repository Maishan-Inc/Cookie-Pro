"use client";

import { useActionState, useMemo } from "react";

import { saveSmtpSettings } from "@/app/(admin)/admin-dashboard/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { SmtpSettings } from "@/lib/mail/smtp";

type ActionResult = {
  error?: string;
  success?: boolean;
};

const initial: ActionResult = {};

export function SmtpForm({
  initialSettings,
  translations,
}: {
  initialSettings: SmtpSettings;
  translations: Dictionary;
}) {
  const [state, action] = useActionState<ActionResult, FormData>(saveSmtpSettings, initial);

  const message = useMemo(() => {
    if (state?.error) return state.error as string;
    if (state?.success) return translations.smtp.updated;
    return null;
  }, [state, translations.smtp.updated]);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-zinc-600 dark:text-zinc-300">
          {translations.smtp.host}
          <input
            name="host"
            defaultValue={initialSettings?.host ?? ""}
            required
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </label>
        <label className="text-sm text-zinc-600 dark:text-zinc-300">
          {translations.smtp.port}
          <input
            type="number"
            name="port"
            defaultValue={initialSettings?.port ?? 587}
            required
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </label>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
        <input
          type="checkbox"
          name="secure"
          defaultChecked={initialSettings?.secure}
          className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700"
        />
        {translations.smtp.secure}
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-zinc-600 dark:text-zinc-300">
          {translations.smtp.username}
          <input
            name="username"
            defaultValue={initialSettings?.username ?? ""}
            required
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </label>
        <label className="text-sm text-zinc-600 dark:text-zinc-300">
          {translations.smtp.password}
          <input
            type="password"
            name="password"
            placeholder={initialSettings ? "••••••••" : ""}
            required={!initialSettings}
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-zinc-600 dark:text-zinc-300">
          {translations.smtp.fromName}
          <input
            name="from_name"
            defaultValue={initialSettings?.from_name ?? ""}
            required
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </label>
        <label className="text-sm text-zinc-600 dark:text-zinc-300">
          {translations.smtp.fromEmail}
          <input
            type="email"
            name="from_email"
            defaultValue={initialSettings?.from_email ?? ""}
            required
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </label>
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {translations.smtp.save}
      </button>
      {message && (
        <p
          className={`text-sm ${
            state?.error ? "text-rose-500 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
