"use client";

import { useMemo, useState } from "react";

import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { completeInstallation } from "@/app/install/actions";

type EnvStatus = {
  key: string;
  present: boolean;
  required: boolean;
};

type SchemaStatus = {
  name: string;
  ok: boolean;
  message?: string | null;
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
  schemaStatus: SchemaStatus[];
};

export function InstallWizard({
  locale,
  translations: t,
  envStatus,
  dbInfo,
  schemaStatus,
}: InstallWizardProps) {
  const steps = useMemo(() => ["license", "checks", "admin"] as const, []);
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
  const stepIndex = steps.indexOf(current);

  const requiredEnvOk = envStatus
    .filter((item) => item.required)
    .every((item) => item.present);

  const canProceed =
    (current === "license" && agreed) ||
    (current === "checks" && requiredEnvOk);

  const nextStep = () => {
    const index = steps.indexOf(current);
    if (index < steps.length - 1) {
      setCurrent(steps[index + 1]);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setCurrent(steps[stepIndex - 1]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    if (formState.password !== formState.confirmPassword) {
      setError(t.install.passwordMismatch);
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
      setError(`${t.install.errorDetails}: ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (current) {
      case "license":
        return (
          <div className="space-y-6 rounded-3xl border surface-card p-6 shadow-sm transition-colors">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {t.install.licenseTitle}
            </h2>
            <p className="text-sm text-zinc-900 dark:text-zinc-200">
              {t.install.licenseAgreement}
            </p>
            <label className="flex items-center gap-3 text-sm text-zinc-900 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="size-4 rounded border border-[color:var(--border-color)] text-[color:var(--foreground)] focus:ring-[color:var(--ring-color)]"
              />
              {t.install.licenseCta}
            </label>
          </div>
        );
      case "checks":
        return (
          <div className="space-y-6 rounded-3xl border surface-card p-6 shadow-sm transition-colors">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {t.install.checksTitle}
              </h2>
              <p className="text-sm text-zinc-900 dark:text-zinc-200">
                {t.install.checksDescription}
              </p>
              <div className="rounded-2xl border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-4 text-sm text-zinc-900 dark:text-zinc-200 transition-colors">
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {t.install.instructionsTitle}
                </p>
                <p className="mt-1">{t.install.instructionsDescription}</p>
                <ul className="mt-3 list-decimal space-y-2 pl-5">
                  {t.install.instructionsList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3 rounded-2xl border surface-card p-4 transition-colors">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {t.install.envTitle}
                </h3>
                <p className="text-xs text-zinc-900 dark:text-zinc-300">{t.install.envHelp}</p>
                <ul className="space-y-2 text-sm">
                  {envStatus.map((item) => (
                    <li
                      key={item.key}
                      className="flex flex-col gap-1 rounded-xl border surface-muted px-3 py-2 transition-colors text-zinc-900 dark:text-zinc-200"
                    >
                      <span className="font-medium">
                        {item.key}{" "}
                        {!item.required && (
                          <em className="text-xs text-zinc-500 dark:text-zinc-400">
                            {t.install.optionalLabel}
                          </em>
                        )}
                      </span>
                      <span
                        className={
                          item.present
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-500 dark:text-rose-400"
                        }
                      >
                        {item.present ? t.install.checkOk : t.install.checkMissing}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3 rounded-2xl border surface-card p-4 transition-colors">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {t.install.dbTitle}
                </h3>
                <p className="text-xs text-zinc-900 dark:text-zinc-300">{t.install.connectionHelp}</p>
                <div className="space-y-3 text-sm">
                  <div className="rounded-2xl border surface-muted p-3 text-zinc-900 dark:text-white">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                      {t.install.dbVersion}
                    </p>
                    <p className="break-words">{dbInfo.version ?? t.install.pgUnknown}</p>
                  </div>
                  <div className="rounded-2xl border surface-muted p-3 text-zinc-900 dark:text-white">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                      Supabase URL
                    </p>
                    <p className="break-words">{dbInfo.projectUrl ?? "N/A"}</p>
                  </div>
                  {dbInfo.message && (
                    <div className="rounded-2xl border surface-muted p-3 text-rose-600 dark:text-rose-400">
                      {dbInfo.message}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3 rounded-2xl border surface-card p-4 transition-colors">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {t.install.schemaTitle}
                </h3>
                <p className="text-xs text-zinc-900 dark:text-zinc-300">{t.install.schemaHelp}</p>
                <ul className="space-y-2 text-sm">
                  {schemaStatus.map((table) => (
                    <li
                      key={table.name}
                      className="flex items-center justify-between rounded-xl border surface-muted px-3 py-2 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{table.name}</p>
                        {!table.ok && table.message && (
                          <p className="text-xs text-rose-500 dark:text-rose-300">{table.message}</p>
                        )}
                      </div>
                      <span
                        className={
                          table.ok
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-500 dark:text-rose-400"
                        }
                      >
                        {table.ok ? t.install.checkOk : t.install.checkMissing}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      case "admin":
        return (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-3xl border surface-card p-6 shadow-sm transition-colors"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {t.install.adminTitle}
            </h2>
            <p className="text-sm text-zinc-900 dark:text-zinc-200">
              {t.install.adminDescription}
            </p>
            <label className="text-sm text-zinc-900 dark:text-zinc-200">
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
                className="mt-2 w-full rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--foreground)] focus:outline-none focus:ring-4 focus:ring-[color:var(--ring-color)]"
              />
            </label>
            <label className="text-sm text-zinc-900 dark:text-zinc-200">
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
                className="mt-2 w-full rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--foreground)] focus:outline-none focus:ring-4 focus:ring-[color:var(--ring-color)]"
              />
            </label>
            <label className="text-sm text-zinc-900 dark:text-zinc-200">
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
                className="mt-2 w-full rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--foreground)] focus:outline-none focus:ring-4 focus:ring-[color:var(--ring-color)]"
              />
            </label>
            <label className="text-sm text-zinc-900 dark:text-zinc-200">
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
                className="mt-2 w-full rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--foreground)] focus:outline-none focus:ring-4 focus:ring-[color:var(--ring-color)]"
              />
            </label>
            {error && (
              <p className="text-sm text-rose-500 dark:text-rose-400" role="alert">
                {error}
              </p>
            )}
            {status && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
                {status}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-press w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-zinc-700 disabled:opacity-70 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {submitting ? "..." : t.install.submit}
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {steps.map((step, index) => (
          <span
            key={step}
            className={`rounded-full px-3 py-1 ${
              stepIndex >= index
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {index + 1}
          </span>
        ))}
      </div>
      <div key={current} className="animate-step">
        {renderStep()}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={prevStep}
            className="btn-press rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:-translate-y-0.5 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-white dark:hover:text-white"
          >
            {t.install.back}
          </button>
        )}
        {current !== "admin" && (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canProceed}
            className="btn-press rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t.install.next}
          </button>
        )}
      </div>
    </div>
  );
}
