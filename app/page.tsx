import { Hero } from "@/components/home/Hero";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { ConsentModal } from "@/components/ConsentModal";
import { getServerLocale, getTranslations } from "@/lib/i18n/server";
import { needsInstallation } from "@/lib/install/status";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const locale = await getServerLocale();
  if (await needsInstallation()) {
    redirect("/install");
  }
  const t = await getTranslations(locale);

  return (
    <div className="space-y-8">
      <Hero locale={locale} />
      <FeatureGrid locale={locale} />
      <section className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {t.home.consentTitle}
        </h2>
        <p className="text-sm text-zinc-500">{t.home.consentSubtitle}</p>
        <div className="mt-4">
          <ConsentModal locale={locale === "zh" ? "zh-CN" : "en-US"} />
        </div>
      </section>
      <section className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
          {t.license.heading}
        </h3>
        <p className="mt-2">{t.license.body}</p>
      </section>
    </div>
  );
}
