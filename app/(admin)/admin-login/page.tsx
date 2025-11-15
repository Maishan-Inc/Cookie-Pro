import { redirect } from "next/navigation";

import { authenticateAdmin } from "@/app/(admin)/admin-login/actions";
import { fetchAdminSettings } from "@/lib/admin-settings";
import { getServerLocale, getTranslations } from "@/lib/i18n/server";
import { verifyAdminSession } from "@/lib/security/admin-session";

type Props = {
  searchParams: {
    entry?: string;
    error?: string;
  };
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const locale = await getServerLocale();
  const t = await getTranslations(locale);
  const settings = await fetchAdminSettings();
  if (!settings) {
    redirect("/install");
  }

  const entry = searchParams.entry ?? "";
  if (!entry || entry !== settings.admin_path) {
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-dashed border-rose-200 bg-white p-8 text-center text-sm text-rose-600 shadow-sm dark:border-rose-400/60 dark:bg-rose-950/30 dark:text-rose-100">
          <p className="text-lg font-semibold text-rose-700 dark:text-rose-100">{t.auth.entryRequired}</p>
          <p className="mt-2 text-base">/{settings.admin_path}</p>
          <p className="mt-1 text-xs text-rose-500/80 dark:text-rose-200/80">{t.alerts.installLocked}</p>
        </div>
      </section>
    );
  }

  if (await verifyAdminSession(settings.admin_password_hash)) {
    redirect("/admin-dashboard");
  }

  async function loginAction(formData: FormData) {
    "use server";
    const password = String(formData.get("password") ?? "");
    try {
      await authenticateAdmin({ password, entry });
    } catch {
      redirect(`/admin-login?entry=${entry}&error=unauthorized`);
    }
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border surface-card p-6 shadow-sm">
          <p className="inline-flex items-center rounded-full border surface-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-300">
            Admin
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-zinc-900 dark:text-white">
            {t.auth.loginTitle}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{t.auth.loginSubtitle}</p>
          <div className="mt-6 rounded-2xl border surface-muted p-4 text-sm text-zinc-600 dark:text-zinc-300">
            <p className="font-medium text-zinc-900 dark:text-white">{t.admin.aliasLabel}</p>
            <p>/{settings.admin_path}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
              {t.admin.adminLabel}
            </p>
            <p className="text-base font-semibold text-zinc-900 dark:text-white">{settings.admin_name}</p>
          </div>
        </div>
        <div className="rounded-3xl border surface-card p-6 shadow-sm">
          {searchParams.error && (
            <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
              {t.auth.unauthorized}
            </p>
          )}
          <form action={loginAction} className="space-y-5">
            <label className="flex flex-col text-sm text-zinc-500 dark:text-zinc-300">
              {t.auth.password}
              <input
                type="password"
                name="password"
                required
                className="mt-2 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] px-4 py-2.5 text-sm text-[color:var(--foreground)] focus:outline-none focus:ring-4 focus:ring-[color:var(--ring-color)]"
              />
            </label>
            <button
              type="submit"
              className="btn-press w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {t.auth.submit}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
