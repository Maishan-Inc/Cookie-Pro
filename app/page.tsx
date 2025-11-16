import Link from "next/link";
import { redirect } from "next/navigation";

import { ConsentModal } from "@/components/ConsentModal";
import { AuthShowcase } from "@/components/home/AuthShowcase";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { getServerLocale, getTranslations } from "@/lib/i18n/server";
import { needsInstallation } from "@/lib/install/status";

export default async function HomePage() {
  const locale = await getServerLocale();
  if (await needsInstallation()) {
    redirect("/install");
  }
  const t = await getTranslations(locale);
  const aliasPreview = locale === "zh" ? "admin-entry" : "admin-alias";

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border surface-card p-8 shadow-sm transition">
          <p className="inline-flex items-center rounded-full border surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-300">
            {t.hero.eyebrow}
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-zinc-900 dark:text-white">
            {t.hero.title}
          </h1>
          <p className="mt-4 text-sm text-zinc-900 dark:text-zinc-200">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-zinc-900 dark:text-white">
            <Link
              href="/login"
              className="btn-press inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2.5 text-white transition hover:bg-zinc-800 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              className="btn-press inline-flex items-center justify-center rounded-full border surface-muted px-4 py-2.5 text-zinc-900 transition hover:border-zinc-900 dark:border-zinc-700 dark:text-white dark:hover:border-white"
            >
              {t.nav.register}
            </Link>
            <Link
              href="/user"
              className="btn-press inline-flex items-center justify-center rounded-full border border-emerald-500/60 px-4 py-2.5 text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-400/60 dark:text-emerald-200 dark:hover:bg-transparent"
            >
              {t.nav.console}
            </Link>
          </div>
          <dl className="mt-8 grid gap-4 text-sm text-zinc-900 dark:text-zinc-200 sm:grid-cols-2">
            <div className="rounded-2xl border surface-muted p-4 text-zinc-900 dark:text-zinc-200">
              <dt className="text-xs uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
                {t.admin.aliasLabel}
              </dt>
              <dd className="mt-2 text-xl font-semibold text-zinc-900 dark:text-white">
                /{aliasPreview}
              </dd>
              <p className="mt-1 text-xs">{t.auth.entryRequired}</p>
            </div>
            <div className="rounded-2xl border surface-muted p-4 text-zinc-900 dark:text-zinc-200">
              <dt className="text-xs uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
                {t.hero.cardTitle}
              </dt>
              <dd className="mt-2 text-base font-semibold text-zinc-900 dark:text-white">
                {t.hero.cardBody}
              </dd>
            </div>
          </dl>
        </div>
        <AuthShowcase locale={locale} translations={t} />
      </section>

      <section className="rounded-3xl border surface-card p-6 shadow-sm transition">
        <FeatureGrid locale={locale} />
      </section>

      <section className="rounded-3xl border surface-card p-6 shadow-sm transition">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {t.home.consentTitle}
        </h2>
        <p className="text-sm text-zinc-900 dark:text-zinc-200">{t.home.consentSubtitle}</p>
        <div className="mt-4 rounded-2xl border surface-muted p-4">
          <ConsentModal locale={locale === "zh" ? "zh-CN" : "en-US"} />
        </div>
      </section>

      <section className="rounded-3xl border surface-card p-6 text-sm text-zinc-900 shadow-sm transition dark:text-zinc-200">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
          {t.license.heading}
        </h3>
        <p className="mt-2 leading-relaxed">{t.license.body}</p>
      </section>
    </div>
  );
}
