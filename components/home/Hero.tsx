import Link from "next/link";

import type { Locale } from "@/lib/i18n/dictionaries";
import { getTranslations } from "@/lib/i18n/server";

export async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations(locale);
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 text-zinc-900 dark:text-white">
      <div className="space-y-6">
        <p className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          {t.hero.eyebrow}
        </p>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
          {t.hero.title}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-300">
          {t.hero.subtitle}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/install"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t.hero.primaryCta}
          </Link>
          <Link
            href="/user"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-white dark:hover:border-white"
          >
            {t.hero.secondaryCta}
          </Link>
        </div>
      </div>
      <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
          {t.hero.cardTitle}
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          {t.hero.cardBody}
        </p>
      </div>
    </section>
  );
}
