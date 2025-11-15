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
    <section className="relative isolate overflow-hidden px-6 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 rounded-[44px] border border-white/60 bg-white/85 p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/70 dark:ring-white/10 lg:grid-cols-[1fr,1fr]">
        <div className="space-y-5 text-sm text-zinc-600 dark:text-zinc-300">
          <p className="inline-flex items-center rounded-full border border-zinc-200/60 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            {t.nav.register}
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
            {t.register.title}
          </h1>
          <p>{t.register.subtitle}</p>
          <ul className="space-y-3 text-sm">
            <li className="rounded-[24px] border border-zinc-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              - {t.alerts.registrationStarted}
            </li>
            <li className="rounded-[24px] border border-zinc-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              - {t.alerts.verificationFailed}
            </li>
          </ul>
        </div>
        <div className="rounded-[32px] border border-white/60 bg-white/95 p-8 shadow-xl ring-1 ring-black/5 dark:border-white/10 dark:bg-zinc-950/70 dark:ring-white/10">
          <RegisterForm locale={locale} translations={t} />
        </div>
      </div>
      <span className="pointer-events-none absolute -right-12 top-0 h-72 w-72 rounded-full bg-rose-100/60 blur-3xl dark:bg-rose-500/20" />
      <span className="pointer-events-none absolute left-12 bottom-0 h-64 w-64 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-500/20" />
    </section>
  );
}
