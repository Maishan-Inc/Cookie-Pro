"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-zinc-300/70 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-white"
    >
      {theme === "light" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
