"use client";

import { useLocale } from "@/components/providers/LocaleProvider";

export function LanguageSwitcher() {
  const { locale, updateLocale, pending } = useLocale();
  return (
    <div className="inline-flex items-center rounded-full border border-zinc-300/70 text-xs font-medium dark:border-zinc-700">
      <button
        type="button"
        onClick={() => updateLocale("en")}
        className={`px-3 py-1 transition ${
          locale === "en"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
        }`}
        disabled={pending}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => updateLocale("zh")}
        className={`px-3 py-1 transition ${
          locale === "zh"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
        }`}
        disabled={pending}
      >
        中文
      </button>
    </div>
  );
}
