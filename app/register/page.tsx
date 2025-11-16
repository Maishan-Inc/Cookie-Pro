import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { getServerLocale, getTranslations } from "@/lib/i18n/server";
import { needsInstallation } from "@/lib/install/status";
import { getCurrentUser } from "@/lib/security/user-session";

export default async function RegisterPage() {
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
            {t.nav.register}
          </p>
          <h1 className="mt-4 text-3xl font-semibold">
            {t.register.title}
          </h1>
          <p className="mt-2 text-sm">{t.register.subtitle}</p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="rounded-2xl border surface-muted p-4">- {t.alerts.registrationStarted}</li>
            <li className="rounded-2xl border surface-muted p-4">- {t.alerts.verificationFailed}</li>
          </ul>
        </div>
        <div className="rounded-3xl border surface-card p-6 shadow-sm">
          <RegisterForm locale={locale} translations={t} />
        </div>
      </div>
    </section>
  );
}
