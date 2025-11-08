"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

import { CONSENT_CATEGORIES } from "@/lib/constants";
import { getStrings } from "@/lib/i18n";
import type { ConsentChoices } from "@/lib/validation";

type Props = {
  locale?: string | null;
  initialChoices?: ConsentChoices;
  onSubmit?(choices: ConsentChoices): void;
  className?: string;
};

export function ConsentModal({
  locale = "en-US",
  initialChoices,
  onSubmit,
  className,
}: Props) {
  const strings = useMemo(() => getStrings(locale), [locale]);
  const [choices, setChoices] = useState<ConsentChoices>(() => ({
    necessary: true,
    ads: false,
    other: false,
    ...initialChoices,
  }));

  const toggle = (category: string, value: boolean) => {
    if (category === "necessary") return;
    setChoices((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit?.(choices);
  };

  const setAll = (value: boolean) => {
    const updates: ConsentChoices = { ...choices };
    CONSENT_CATEGORIES.forEach((category) => {
      if (category === "necessary") return;
      updates[category] = value;
    });
    setChoices(updates);
    onSubmit?.(updates);
  };

  return (
    <div
      className={clsx(
        "rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-label={strings.title}
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          {strings.title}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {strings.description}
        </p>
      </div>
      <ul className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
        {CONSENT_CATEGORIES.map((category) => (
          <li key={category} className="flex items-center justify-between py-3">
            <label
              className="flex items-center gap-3 text-sm font-medium text-zinc-900 dark:text-white"
              htmlFor={`cmp-${category}`}
            >
              <input
                type="checkbox"
                id={`cmp-${category}`}
                checked={Boolean(choices[category])}
                disabled={category === "necessary"}
                onChange={(event) => toggle(category, event.target.checked)}
                className="size-4 rounded border-zinc-300 text-black focus:ring-black disabled:cursor-not-allowed"
              />
              <span className="capitalize">{strings.categories[category]}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-900"
          onClick={() => setAll(true)}
        >
          {strings.acceptAll}
        </button>
        <button
          type="button"
          className="rounded-full border border-zinc-300 px-6 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
          onClick={() => setAll(false)}
        >
          {strings.rejectAll}
        </button>
        <button
          type="button"
          className="rounded-full border border-transparent px-6 py-2 text-sm font-semibold text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white"
          onClick={handleSubmit}
        >
          {strings.save}
        </button>
      </div>
    </div>
  );
}
