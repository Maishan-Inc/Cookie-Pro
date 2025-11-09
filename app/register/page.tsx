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
    <section className="mx-auto max-w-xl space-y-6 px-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
          {t.register.title}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t.register.subtitle}</p>
      </div>
      <RegisterForm locale={locale} translations={t} />
    </section>
  );
}
