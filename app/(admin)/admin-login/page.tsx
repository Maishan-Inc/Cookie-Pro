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
      <section className="relative isolate px-6 py-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-[36px] border border-dashed border-rose-200/70 bg-white/90 p-10 text-center text-sm text-rose-600 shadow-2xl ring-1 ring-rose-200/70 dark:border-rose-400/40 dark:bg-rose-950/30 dark:text-rose-100 dark:ring-rose-500/40">
          <p className="text-lg font-semibold text-rose-700 dark:text-rose-200">{t.auth.entryRequired}</p>
          <p className="text-base text-rose-500 dark:text-rose-100">
            /{settings.admin_path}
          </p>
          <p className="text-sm text-rose-500/80 dark:text-rose-100/80">
            {t.alerts.installLocked}
          </p>
        </div>
        <span className="pointer-events-none absolute left-8 top-8 h-40 w-40 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-500/20" />
        <span className="pointer-events-none absolute bottom-0 right-12 h-44 w-44 rounded-full bg-orange-100/50 blur-3xl dark:bg-orange-500/20" />
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
    <section className="relative isolate overflow-hidden px-6 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-12 rounded-[44px] border border-white/60 bg-white/85 p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/70 dark:ring-white/10 lg:grid-cols-[1fr,0.9fr]">
        <div className="space-y-5 text-sm text-zinc-600 dark:text-zinc-300">
          <p className="inline-flex items-center rounded-full border border-zinc-200/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            Admin
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
            {t.auth.loginTitle}
          </h1>
          <p>{t.auth.loginSubtitle}</p>
          <div className="rounded-[28px] border border-zinc-200/70 bg-zinc-50/70 p-5 text-sm shadow-inner dark:border-white/10 dark:bg-white/5">
            <p className="font-medium text-zinc-900 dark:text-white">{t.admin.aliasLabel}</p>
            <p className="text-zinc-600 dark:text-zinc-300">/{settings.admin_path}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
              {t.admin.adminLabel}
            </p>
            <p className="text-base font-semibold text-zinc-900 dark:text-white">{settings.admin_name}</p>
          </div>
        </div>
        <div className="relative rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-xl ring-1 ring-black/5 dark:border-white/10 dark:bg-zinc-950/60 dark:ring-white/10">
          {searchParams.error && (
            <p className="mb-4 rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-2 text-sm text-amber-800 shadow-inner dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
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
                className="mt-2 rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-3 text-base text-zinc-900 shadow-inner focus:border-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-900/60 dark:text-white dark:focus:border-white dark:focus:ring-white/10"
              />
            </label>
            <button
              type="submit"
              className="btn-press w-full rounded-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-900/30 transition hover:-translate-y-0.5 hover:brightness-110 dark:from-white dark:to-zinc-200 dark:text-zinc-900"
            >
              {t.auth.submit}
            </button>
          </form>
        </div>
      </div>
      <span className="pointer-events-none absolute -left-10 top-0 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-500/20" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-500/20" />
    </section>
  );
}
