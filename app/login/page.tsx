import { redirect } from "next/navigation";

import Link from "next/link";

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
    <section className="mx-auto max-w-xl space-y-6 px-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
          {t.auth.loginTitle}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t.auth.loginSubtitle}</p>
      </div>
      <LoginForm translations={t} />
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        {t.auth.registerPrompt}{" "}
        <Link href="/register" className="text-zinc-900 underline dark:text-white">
          {t.nav.register}
        </Link>
      </p>
    </section>
  );
}
