import Link from "next/link";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getTranslations } from "@/lib/i18n/server";
import { getCurrentUser } from "@/lib/security/user-session";
import { logoutUser } from "@/app/actions/logout";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations(locale);
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-zinc-900 dark:text-white">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Cookie-Pro
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link href="/" className="hover:text-zinc-600 dark:hover:text-zinc-300">
            {t.nav.home}
          </Link>
          {!user && (
            <>
              <Link href="/login" className="hover:text-zinc-600 dark:hover:text-zinc-300">
                {t.nav.login}
              </Link>
              <Link href="/register" className="hover:text-zinc-600 dark:hover:text-zinc-300">
                {t.nav.register}
              </Link>
            </>
          )}
          {user && (
            <>
              <Link
                href="/user"
                className="rounded-full bg-zinc-900 px-3 py-1 text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {t.nav.console}
              </Link>
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="text-sm underline-offset-4 hover:text-zinc-600 hover:underline dark:hover:text-zinc-300"
                >
                  {t.nav.logout}
                </button>
              </form>
            </>
          )}
          <ThemeToggle />
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
