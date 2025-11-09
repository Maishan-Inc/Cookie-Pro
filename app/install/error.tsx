"use client";

import { useEffect } from "react";

export default function InstallError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("/install crashed", error);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-16 text-sm text-zinc-600 dark:text-zinc-300">
      <div className="space-y-2 rounded-3xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/40 dark:bg-amber-500/10">
        <h1 className="text-xl font-semibold text-amber-900 dark:text-amber-200">
          Install guide / 安装提示
        </h1>
        <p>
          Something prevented the installer from rendering. Double-check the checklist below then select “retry”. 错误详情：
          <code className="ml-1 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-500/20 dark:text-amber-100">
            {error?.message ?? error?.digest ?? "unknown"}
          </code>
        </p>
      </div>
      <div className="space-y-2 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-semibold text-zinc-900 dark:text-white">Checklist · 排查步骤</p>
        <ul className="list-decimal space-y-2 pl-5">
          <li>Confirm <strong>SUPABASE_URL</strong> & <strong>SUPABASE_SERVICE_ROLE</strong> exist in your environment (Production + Preview)。</li>
          <li>在 Supabase → SQL Editor 中执行 <code>sql/01_init.sql</code>，确保数据表与函数已创建。</li>
          <li>Allow your current IP/location under Supabase Project Settings → API 并保持 Service Role 未过期。</li>
          <li>Deploy again or restart <code>npm run dev</code> 后重新访问 <code>/install</code>。</li>
        </ul>
      </div>
      <button
        type="button"
        onClick={reset}
        className="btn-press rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Retry / 重试
      </button>
    </section>
  );
}
