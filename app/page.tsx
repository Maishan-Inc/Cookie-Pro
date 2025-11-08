import Link from "next/link";

import { ConsentModal } from "@/components/ConsentModal";

const embedSnippet = `<script
  src="/script.js"
  data-site-key="PUBLIC_SITE_KEY"
  data-policy-version="2025.11.0"
  data-locale="en-US"
  defer
></script>`;

export default function HomePage() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section className="space-y-6">
        <p className="inline-flex rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold tracking-wide text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
          Next.js App Router + Supabase Reference
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-zinc-900 dark:text-white">
          Consent, anonymous telemetry, and install automation in one audited
          blueprint.
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Cookie-Pro implements the AGENTS.md specification end-to-end: Edge
          script, CAPTCHA-gated consent, Supabase persistence, dashboards, and a
          guided installer. Drop the script snippet into your site’s{" "}
          <code className="rounded bg-zinc-100 px-2 py-1 text-sm dark:bg-zinc-800">
            &lt;/body&gt;
          </code>{" "}
          and the modal + telemetry policy springs to life.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/install"
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-900"
          >
            Run installer
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
          >
            View dashboard
          </Link>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            Embed snippet
          </p>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-zinc-100 p-4 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
            <code>{embedSnippet}</code>
          </pre>
          <p className="mt-2 text-xs text-zinc-500">
            Replace <strong>PUBLIC_SITE_KEY</strong> after creating a site via
            the installer.
          </p>
        </div>
      </section>

      <section className="relative">
        <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-br from-amber-200/40 to-violet-200/40 blur-3xl dark:from-amber-500/10 dark:to-violet-500/10" />
        <div className="relative">
          <ConsentModal locale="en-US" />
        </div>
        <div className="mt-6 space-y-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            Telemetry contract
          </p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• Minimal payload: truncated IP, UA, URL, referrer</li>
            <li>• SHA-256 device IDs (FPJS + site salt)</li>
            <li>• Necessary-only events until opt-in</li>
            <li>• First-touch CAPTCHA to block abuse</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
