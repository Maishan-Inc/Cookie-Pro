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
    <section className="relative isolate overflow-hidden px-6 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 rounded-[44px] border border-white/60 bg-white/85 p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/70 dark:ring-white/10 lg:grid-cols-[0.9fr,1fr]">
        <div className="space-y-5 text-sm text-zinc-600 dark:text-zinc-300">
          <p className="inline-flex items-center rounded-full border border-zinc-200/60 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            {t.nav.login}
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
            {t.auth.loginTitle}
          </h1>
          <p>{t.auth.loginSubtitle}</p>
          <div className="space-y-3 text-sm">
            <div className="rounded-[24px] border border-zinc-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-zinc-500 dark:text-zinc-400">{t.home.consentSubtitle}</p>
            </div>
            <div className="rounded-[24px] border border-emerald-200/50 bg-emerald-50/80 p-4 text-emerald-800 shadow-sm dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {t.alerts.registrationStarted}
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t.auth.registerPrompt}{" "}
            <Link href="/register" className="font-semibold text-zinc-900 underline decoration-zinc-400 underline-offset-4 dark:text-white">
              {t.nav.register}
            </Link>
          </p>
        </div>
        <div className="rounded-[32px] border border-white/60 bg-white/95 p-8 shadow-xl ring-1 ring-black/5 dark:border-white/10 dark:bg-zinc-950/70 dark:ring-white/10">
          <LoginForm translations={t} />
        </div>
      </div>
      <span className="pointer-events-none absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-zinc-200/50 blur-3xl dark:bg-zinc-600/30" />
      <span className="pointer-events-none absolute right-0 top-10 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/20" />
    </section>
  );
}
