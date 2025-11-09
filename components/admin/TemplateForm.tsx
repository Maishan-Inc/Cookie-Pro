"use client";

import { useActionState, useMemo } from "react";

import { saveTemplate } from "@/app/(admin)/admin-dashboard/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ActionResult = {
  error?: string;
  success?: boolean;
};

const initial: ActionResult = {};

export function TemplateForm({
  locale,
  defaultSubject,
  defaultBody,
  translations,
}: {
  locale: "en" | "zh";
  defaultSubject: string;
  defaultBody: string;
  translations: Dictionary;
}) {
  const [state, action] = useActionState<ActionResult, FormData>(saveTemplate, initial);

  const message = useMemo(() => {
    if (state?.error) return state.error as string;
    if (state?.success) return translations.templates.updated;
    return null;
  }, [state, translations.templates.updated]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="template_key" value="verification_code" />
      <input type="hidden" name="locale" value={locale} />
      <label className="text-sm text-zinc-600 dark:text-zinc-300">
        {translations.templates.subject}
        <input
          name="subject"
          defaultValue={defaultSubject}
          className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
      </label>
      <label className="text-sm text-zinc-600 dark:text-zinc-300">
        {translations.templates.body}
        <textarea
          name="body"
          rows={6}
          defaultValue={defaultBody}
          className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {translations.templates.save}
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
