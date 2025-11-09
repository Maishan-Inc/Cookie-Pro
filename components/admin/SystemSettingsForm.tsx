"use client";

import { useActionState, useMemo } from "react";

import { saveSystemSettings } from "@/app/(admin)/admin-dashboard/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { SystemSettingsRow } from "@/lib/system-settings";

type ActionResult = {
  error?: string;
  success?: boolean;
};

const initialState: ActionResult = {};

export function SystemSettingsForm({
  settings,
  translations,
}: {
  settings: SystemSettingsRow;
  translations: Dictionary;
}) {
  const [state, action] = useActionState<ActionResult, FormData>(
    saveSystemSettings,
    initialState,
  );

  const message = useMemo(() => {
    if (state?.error) return state.error;
    if (state?.success) return translations.system.updated;
    return null;
  }, [state, translations.system.updated]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-zinc-600 dark:text-zinc-300">
          {translations.system.productName}
          <input
            name="product_name"
            defaultValue={settings.product_name}
            required
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </label>
        <label className="text-sm text-zinc-600 dark:text-zinc-300">
          {translations.system.supportEmail}
          <input
            type="email"
            name="support_email"
            defaultValue={settings.support_email ?? ""}
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm text-zinc-600 dark:text-zinc-300">
          {translations.system.defaultLocale}
          <select
            name="default_locale"
            defaultValue={settings.default_locale}
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </label>
        <label className="text-sm text-zinc-600 dark:text-zinc-300">
          {translations.system.themePreference}
          <select
            name="theme_preference"
            defaultValue={settings.theme_preference}
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="auto">{translations.system.themeAuto}</option>
            <option value="light">{translations.system.themeLight}</option>
            <option value="dark">{translations.system.themeDark}</option>
          </select>
        </label>
        <label className="text-sm text-zinc-600 dark:text-zinc-300">
          {translations.system.retention}
          <input
            type="number"
            name="telemetry_retention_days"
            min={7}
            max={365}
            defaultValue={settings.telemetry_retention_days}
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </label>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
        <input
          type="checkbox"
          name="allow_self_signup"
          defaultChecked={settings.allow_self_signup}
          className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700"
        />
        {translations.system.allowSignup}
      </label>

      <button
        type="submit"
        className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {translations.system.save}
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
