import Link from "next/link";

import { ConsentModal } from "@/components/ConsentModal";
import {
  ConsentSummaryCards,
  ConsentTrendChart,
  type ConsentSummaryPoint,
} from "@/components/Charts";
import { Captcha, type CaptchaProvider } from "@/components/Captcha";
import { getServerLocale, getTranslations } from "@/lib/i18n/server";
import { getDashboard, getSiteByKey } from "@/lib/repositories";
import { getServiceRoleClient } from "@/lib/supabase";
import { needsInstallation } from "@/lib/install/status";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/security/user-session";

type Props = {
  searchParams: {
    site?: string;
  };
};

export default async function UserConsolePage({ searchParams }: Props) {
  const locale = await getServerLocale();
  const t = await getTranslations(locale);
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }
  const user = currentUser!;
  if (await needsInstallation()) {
    redirect("/install");
  }

  let siteOptions:
    | Array<{
        site_key: string;
        name: string;
        captcha_provider: string | null;
        captcha_site_key: string | null;
        policy_version: string;
      }>
    | null = null;
  let site = null;
  let points: ConsentSummaryPoint[] = [];

  try {
    const supabase = getServiceRoleClient();
    const { data } = await supabase
      .from("sites")
      .select("site_key,name,captcha_provider,captcha_site_key,policy_version")
      .order("created_at", { ascending: true });
    siteOptions = data ?? null;
  } catch (error) {
    console.error("Failed to load site list", error);
  }

  const activeSiteKey =
    searchParams.site || siteOptions?.[0]?.site_key || undefined;

  if (activeSiteKey) {
    try {
      site = await getSiteByKey(activeSiteKey);
      const series = await getDashboard(activeSiteKey);
      points = series.map((row) => ({
        date: row.d,
        total: row.total,
        necessary: row.necessary_ok,
        ads: row.ads_ok,
      }));
    } catch (error) {
      console.error("dashboard load failed", error);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {t.dashboard.heading}
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
            {t.userConsole.greeting}, {user.name}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {t.dashboard.subheading}
          </p>
        </div>
        <form className="flex items-center gap-3 md:justify-end">
          <label className="text-xs font-semibold text-zinc-500">
            {t.dashboard.siteLabel}
          </label>
          <select
            name="site"
            defaultValue={activeSiteKey}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          >
            {siteOptions?.map((option) => (
              <option key={option.site_key} value={option.site_key}>
                {option.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-zinc-900"
          >
            {t.dashboard.load}
          </button>
        </form>
      </div>

      {site ? (
        <div className="space-y-6">
          <ConsentSummaryCards points={points} />
          <ConsentTrendChart points={points} />
        </div>
      ) : (
        <p className="rounded-3xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">
          No site found yet. Create one via the{" "}
          <Link href="/install" className="underline">
            installer
          </Link>
          .
        </p>
      )}

      {site && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Consent preview ({site.policy_version})
            </h2>
            <p className="text-sm text-zinc-500">
              Locale follows data-locale attribute.
            </p>
            <div className="mt-4">
              <ConsentModal locale={locale === "zh" ? "zh-CN" : "en-US"} />
            </div>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              CAPTCHA configuration
            </h2>
            <Captcha
              provider={site.captcha_provider as CaptchaProvider | null}
              siteKey={site.captcha_site_key}
            />
          </div>
        </div>
      )}
    </div>
  );
}
