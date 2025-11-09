import Link from "next/link";

import type { Locale } from "@/lib/i18n/dictionaries";
import { getTranslations } from "@/lib/i18n/server";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations(locale);
  return (
    <footer className="border-t border-zinc-200/80 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 text-sm text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <span>{t.footer.copy}</span>
        <Link
          href="https://github.com/Maishan-Inc/Cookie-Pro"
          target="_blank"
          className="font-medium text-zinc-900 hover:underline dark:text-white"
        >
          {t.footer.github}
        </Link>
      </div>
    </footer>
  );
}
