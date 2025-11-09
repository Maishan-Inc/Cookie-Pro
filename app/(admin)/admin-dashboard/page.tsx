import { redirect } from "next/navigation";

import { fetchAdminSettings } from "@/lib/admin-settings";
import { getServerLocale, getTranslations } from "@/lib/i18n/server";
import { verifyAdminSession } from "@/lib/security/admin-session";
import { getSmtpSettings } from "@/lib/mail/smtp";
import { getTemplate } from "@/lib/mail/templates";
import { getSystemSettings } from "@/lib/system-settings";
import { getUsageBySite, getUsageOverview } from "@/lib/usage";
import { listUsers } from "@/lib/users";
import { SmtpForm } from "@/components/admin/SmtpForm";
import { TemplateForm } from "@/components/admin/TemplateForm";
import { SystemSettingsForm } from "@/components/admin/SystemSettingsForm";
import { UsageOverviewCard } from "@/components/admin/UsageOverviewCard";
import { UserManagementPanel } from "@/components/admin/UserManagementPanel";

export default async function AdminDashboardPage() {
  const locale = await getServerLocale();
  const t = await getTranslations(locale);
  const settings = await fetchAdminSettings();
  if (!settings) {
    redirect("/install");
  }
  if (!(await verifyAdminSession(settings.admin_password_hash))) {
    redirect("/admin-login?error=unauthorized");
  }

  const smtpSettings = await getSmtpSettings();
  const templateEn = await getTemplate({ key: "verification_code", locale: "en" });
  const templateZh = await getTemplate({ key: "verification_code", locale: "zh" });
  const systemSettings = await getSystemSettings();
  const usageOverview = await getUsageOverview();
  const usageBySite = await getUsageBySite(6);
  const users = await listUsers();

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-6 py-16">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">{t.admin.heading}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t.alerts.installLocked}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <p className="text-xs uppercase text-zinc-500">{t.admin.aliasLabel}</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-white">/{settings.admin_path}</p>
          </div>
          <div className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <p className="text-xs uppercase text-zinc-500">{t.admin.adminLabel}</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-white">{settings.admin_name}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <UsageOverviewCard overview={usageOverview} sites={usageBySite} locale={locale} translations={t} />
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <SystemSettingsForm settings={systemSettings} translations={t} />
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t.smtp.title}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t.smtp.description}</p>
        <div className="mt-4">
          <SmtpForm initialSettings={smtpSettings} translations={t} />
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t.templates.title}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t.templates.description}</p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {t.templates.locale}: EN
            </p>
            <TemplateForm
              locale="en"
              defaultSubject={templateEn.subject}
              defaultBody={templateEn.body}
              translations={t}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {t.templates.locale}: 中文
            </p>
            <TemplateForm
              locale="zh"
              defaultSubject={templateZh.subject}
              defaultBody={templateZh.body}
              translations={t}
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <UserManagementPanel users={users} translations={t} />
      </div>
    </section>
  );
}
