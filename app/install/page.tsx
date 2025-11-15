import { redirect } from "next/navigation";

import { InstallWizard } from "@/app/install/InstallWizard";
import { getSchemaStatus, testConnection } from "@/app/install/actions";
import { getServerLocale, getTranslations } from "@/lib/i18n/server";
import { needsInstallation } from "@/lib/install/status";

export default async function InstallPage() {
  const locale = await getServerLocale();
  const t = await getTranslations(locale);
  const pendingSetup = await needsInstallation();
  if (!pendingSetup) {
    redirect("/");
  }

  const envStatus = [
    {
      key: "SUPABASE_URL",
      present: Boolean(process.env.SUPABASE_URL),
      required: true,
    },
    {
      key: "SUPABASE_SERVICE_ROLE",
      present: Boolean(process.env.SUPABASE_SERVICE_ROLE),
      required: true,
    },
    {
      key: "ADMIN_SESSION_SECRET",
      present: Boolean(process.env.ADMIN_SESSION_SECRET),
      required: false,
    },
  ];

  const dbResult = await testConnection();
  const dbInfo = {
    version: dbResult.ok ? dbResult.version ?? null : null,
    projectUrl: process.env.SUPABASE_URL ?? null,
    message: dbResult.ok ? null : dbResult.message ?? null,
  };
  const schemaStatus = await getSchemaStatus();

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {t.install.title}
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
          {t.install.title}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {t.install.description}
        </p>
      </div>
      <InstallWizard
        locale={locale}
        translations={t}
        envStatus={envStatus}
        dbInfo={dbInfo}
        schemaStatus={schemaStatus}
      />
    </div>
  );
}
