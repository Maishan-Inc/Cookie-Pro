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
      <section className="mx-auto flex max-w-md flex-col gap-4 px-6 py-20 text-center text-sm text-zinc-600 dark:text-zinc-300">
        <p>{t.auth.entryRequired}</p>
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
    <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
          {t.auth.loginTitle}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {t.auth.loginSubtitle}
        </p>
        {searchParams.error && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-400/50 dark:bg-amber-400/10 dark:text-amber-300">
            {t.auth.unauthorized}
          </p>
        )}
        <form action={loginAction} className="mt-6 space-y-4">
          <label className="text-sm text-zinc-600 dark:text-zinc-300">
            {t.auth.password}
            <input
              type="password"
              name="password"
              required
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </label>
          <button
            type="submit"
            className="btn-press w-full rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t.auth.submit}
          </button>
        </form>
      </div>
    </section>
  );
}
