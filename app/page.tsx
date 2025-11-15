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
    <div className="space-y-12">
      <section className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-[40px] border border-white/70 bg-white/90 p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl transition dark:border-white/10 dark:bg-zinc-900/70 dark:text-white dark:ring-white/10">
          <p className="inline-flex items-center rounded-full border border-zinc-200/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:border-white/20 dark:text-zinc-300">
            {t.hero.eyebrow}
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-zinc-900 dark:text-white md:text-5xl">
            {t.hero.title}
          </h1>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-300">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              href="/login"
              className="btn-press inline-flex items-center justify-center rounded-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 px-6 py-3 text-white shadow-lg shadow-zinc-900/20 transition hover:-translate-y-0.5 dark:from-white dark:via-white dark:to-zinc-100 dark:text-zinc-900"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              className="btn-press inline-flex items-center justify-center rounded-full border border-zinc-300/70 bg-white/60 px-6 py-3 text-zinc-900 shadow-sm shadow-black/5 transition hover:-translate-y-0.5 hover:border-zinc-900 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:border-white"
            >
              {t.nav.register}
            </Link>
            <Link
              href="/user"
              className="btn-press inline-flex items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-emerald-700 shadow-sm shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-500/20 dark:border-emerald-400/50 dark:text-emerald-300"
            >
              {t.nav.console}
            </Link>
          </div>
          <dl className="mt-8 grid gap-4 text-sm text-zinc-600 dark:text-zinc-300 sm:grid-cols-2">
            <div className="rounded-[24px] border border-zinc-200/70 bg-white/80 p-4 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5">
              <dt className="text-xs uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                {t.admin.aliasLabel}
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">
                /{aliasPreview}
              </dd>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t.auth.entryRequired}</p>
            </div>
            <div className="rounded-[24px] border border-zinc-100 bg-gradient-to-br from-zinc-50 to-white p-4 shadow-sm shadow-black/5 dark:border-white/5 dark:bg-white/5">
              <dt className="text-xs uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                {t.hero.cardTitle}
              </dt>
              <dd className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">
                {t.hero.cardBody}
              </dd>
            </div>
          </dl>
        </div>
        <AuthShowcase locale={locale} translations={t} />
        <span className="pointer-events-none absolute -left-16 top-6 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-400/20" />
        <span className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-400/10" />
      </section>

      <section className="rounded-[36px] border border-white/60 bg-white/80 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/70 dark:ring-white/10">
        <FeatureGrid locale={locale} />
      </section>

      <section className="rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/70 dark:ring-white/10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {t.home.consentTitle}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-300">{t.home.consentSubtitle}</p>
        <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-zinc-50/80 p-4 shadow-inner dark:border-white/10 dark:bg-zinc-950/40">
          <ConsentModal locale={locale === "zh" ? "zh-CN" : "en-US"} />
        </div>
      </section>

      <section className="rounded-[36px] border border-white/70 bg-white/85 p-6 text-sm text-zinc-600 shadow-xl ring-1 ring-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-300 dark:ring-white/10">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
          {t.license.heading}
        </h3>
        <p className="mt-2 leading-relaxed">{t.license.body}</p>
      </section>
    </div>
  );
}
