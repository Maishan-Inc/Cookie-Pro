"use client";

import { useMemo, useState } from "react";

import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { completeInstallation } from "@/app/install/actions";

type EnvStatus = {
  key: string;
  present: boolean;
  required: boolean;
};

type InstallWizardProps = {
  locale: Locale;
  translations: Dictionary;
  envStatus: EnvStatus[];
  dbInfo: {
    version: string | null;
    projectUrl: string | null;
    message?: string | null;
  };
};

export function InstallWizard({
  locale,
  translations: t,
  envStatus,
  dbInfo,
}: InstallWizardProps) {
  const steps = useMemo(
    () => ["license", "env", "db", "admin"] as const,
    [],
  );
  const [current, setCurrent] = useState<(typeof steps)[number]>("license");
  const [agreed, setAgreed] = useState(false);
  const [formState, setFormState] = useState({
    adminName: "",
    password: "",
    confirmPassword: "",
    adminPath: "/admin-secure",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const requiredEnvOk = envStatus
    .filter((item) => item.required)
    .every((item) => item.present);

  const canProceed =
    (current === "license" && agreed) ||
    (current === "env" && requiredEnvOk) ||
    current === "db";

  const nextStep = () => {
    const index = steps.indexOf(current);
    if (index < steps.length - 1) {
      setCurrent(steps[index + 1]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    if (formState.password !== formState.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await completeInstallation({
        adminName: formState.adminName,
        password: formState.password,
        adminPath: formState.adminPath,
      });
      setStatus(t.install.successRedirect);
      setTimeout(() => {
        const search = new URLSearchParams({
          entry: formState.adminPath.replace(/^\//, ""),
        });
        window.location.href = `/admin-login?${search.toString()}`;
      }, 1200);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (current) {
      case "license":
        return (
          <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {t.install.licenseTitle}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {t.install.licenseAgreement}
            </p>
            <label className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700"
              />
              {t.install.licenseCta}
            </label>
          </div>
        );
      case "env":
        return (
          <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {t.install.envTitle}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {t.install.envHelp}
            </p>
            <ul className="space-y-3">
              {envStatus.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center justify-between rounded-2xl border border-zinc-100 px-4 py-2 text-sm dark:border-zinc-800"
                >
                  <span>
                    {item.key}{" "}
                    {!item.required && (
                      <em className="text-xs text-zinc-400">
                        {locale === "zh" ? "（可选）" : "(optional)"}
                      </em>
                    )}
                  </span>
                  <span
                    className={
                      item.present ? "text-emerald-600" : "text-rose-500"
                    }
                  >
                    {item.present ? "OK" : "Missing"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      case "db":
        return (
          <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {t.install.dbTitle}
            </h2>
            {dbInfo.message && (
              <p className="text-sm text-rose-500">
                {locale === "zh"
                  ? "数据库诊断不可用，请确认 Supabase 连接。"
                  : "Database diagnostics unavailable. Please verify your Supabase connection."}
                {dbInfo.message ? ` (${dbInfo.message})` : null}
              </p>
            )}
            <dl className="text-sm text-zinc-600 dark:text-zinc-300">
              <div className="flex justify-between border-b border-zinc-100 py-2 dark:border-zinc-800">
                <dt>{t.install.dbVersion}</dt>
                <dd>{dbInfo.version ?? t.install.pgUnknown}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt>Supabase URL</dt>
                <dd>{dbInfo.projectUrl ?? "N/A"}</dd>
              </div>
            </dl>
          </div>
        );
      case "admin":
        return (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {t.install.adminTitle}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {t.install.adminDescription}
            </p>
            <label className="text-sm text-zinc-600 dark:text-zinc-300">
              {t.install.adminPathLabel}
              <input
                type="text"
                value={formState.adminPath}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    adminPath: event.target.value,
                  }))
                }
                required
                className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </label>
            <label className="text-sm text-zinc-600 dark:text-zinc-300">
              {t.install.adminNameLabel}
              <input
                type="text"
                value={formState.adminName}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    adminName: event.target.value,
                  }))
                }
                required
                className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </label>
            <label className="text-sm text-zinc-600 dark:text-zinc-300">
              {t.install.passwordLabel}
              <input
                type="password"
                value={formState.password}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                required
                className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </label>
            <label className="text-sm text-zinc-600 dark:text-zinc-300">
              {t.install.confirmPasswordLabel}
              <input
                type="password"
                value={formState.confirmPassword}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                required
                className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </label>
            {error && (
              <p className="text-sm text-rose-500 dark:text-rose-400">{error}</p>
            )}
            {status && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {status}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-700 disabled:opacity-70 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {submitting ? "..." : t.install.submit}
            </button>
          </form>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {steps.map((step, index) => (
          <span
            key={step}
            className={`rounded-full px-3 py-1 ${
              steps.indexOf(current) >= index
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {index + 1}
          </span>
        ))}
      </div>
      {renderStep()}
      {current !== "admin" && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={nextStep}
            disabled={!canProceed}
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t.install.next}
          </button>
        </div>
      )}
    </div>
  );
}
