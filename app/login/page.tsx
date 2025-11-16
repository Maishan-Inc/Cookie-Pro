import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { getServerLocale, getTranslations } from "@/lib/i18n/server";
import { needsInstallation } from "@/lib/install/status";
import { getCurrentUser } from "@/lib/security/user-session";

export default async function LoginPlaceholder() {
  const locale = await getServerLocale();
  if (await needsInstallation()) {
    redirect("/install");
  }
  if (await getCurrentUser()) {
    redirect("/user");
  }
  const t = await getTranslations(locale);
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border surface-card p-6 shadow-sm text-zinc-900 dark:text-zinc-200">
          <p className="inline-flex items-center rounded-full border surface-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-300">
            {t.nav.login}
          </p>
          <h1 className="mt-4 text-3xl font-semibold">
            {t.auth.loginTitle}
          </h1>
          <p className="mt-2 text-sm">{t.auth.loginSubtitle}</p>
          <div className="mt-6 space-y-3 text-sm">
            <div className="rounded-2xl border surface-muted p-4">
              {t.home.consentSubtitle}
            </div>
            <div className="rounded-2xl border surface-muted p-4 text-emerald-700 dark:text-emerald-300">
              {t.alerts.registrationStarted}
            </div>
          </div>
          <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            {t.auth.registerPrompt}{" "}
            <Link href="/register" className="font-semibold text-zinc-900 underline underline-offset-4 dark:text-white">
              {t.nav.register}
            </Link>
          </p>
        </div>
        <div className="rounded-3xl border surface-card p-6 shadow-sm">
          <LoginForm translations={t} />
        </div>
      </div>
    </section>
  );
}
