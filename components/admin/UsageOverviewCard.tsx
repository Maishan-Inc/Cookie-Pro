import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import type { UsageBySiteRow, UsageOverviewRow } from "@/lib/usage";

function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(locale: Locale, iso: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function UsageOverviewCard({
  overview,
  sites,
  locale,
  translations,
}: {
  overview: UsageOverviewRow;
  sites: UsageBySiteRow[];
  locale: Locale;
  translations: Dictionary;
}) {
  const stats = [
    { label: translations.usage.sites, value: overview.sites },
    { label: translations.usage.devices, value: overview.devices },
    { label: translations.usage.consents, value: overview.consents },
    { label: translations.usage.events, value: overview.events },
    { label: translations.usage.events24, value: overview.events_24h },
    { label: translations.usage.consents24, value: overview.consents_24h },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{translations.usage.title}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{translations.usage.description}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40"
          >
            <p className="text-xs uppercase tracking-wide text-zinc-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">
              {formatNumber(locale, stat.value ?? 0)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <p className="text-xs uppercase text-zinc-500">{translations.usage.lastEvent}</p>
          <p className="mt-1 text-sm text-zinc-900 dark:text-white">
            {formatDate(locale, overview.last_event)}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <p className="text-xs uppercase text-zinc-500">{translations.usage.lastConsent}</p>
          <p className="mt-1 text-sm text-zinc-900 dark:text-white">
            {formatDate(locale, overview.last_consent)}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{translations.usage.perSite}</p>
        {sites.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{translations.usage.perSiteEmpty}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-zinc-500">
                  <th className="py-2 pr-3 font-medium">{translations.dashboard.siteLabel}</th>
                  <th className="py-2 pr-3 font-medium">{translations.usage.events24}</th>
                  <th className="py-2 pr-3 font-medium">{translations.usage.consents24}</th>
                  <th className="py-2 pr-3 font-medium">{translations.usage.lastEvent}</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.site_id} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-3 text-zinc-900 dark:text-zinc-100">
                      <div className="font-medium">{site.site_name}</div>
                      <div className="text-xs text-zinc-500">{site.site_key}</div>
                    </td>
                    <td className="py-2 pr-3 text-zinc-700 dark:text-zinc-200">
                      {formatNumber(locale, site.events_24h ?? 0)}
                    </td>
                    <td className="py-2 pr-3 text-zinc-700 dark:text-zinc-200">
                      {formatNumber(locale, site.consents_24h ?? 0)}
                    </td>
                    <td className="py-2 pr-3 text-zinc-700 dark:text-zinc-200">
                      {formatDate(locale, site.last_event)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
