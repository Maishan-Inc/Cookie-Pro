import { readFile } from "node:fs/promises";
import path from "node:path";

import { CopyButton } from "@/components/CopyButton";
import { DEFAULT_POLICY_VERSION } from "@/lib/constants";
import { getServiceRoleClient } from "@/lib/supabase";
import { createSite } from "./actions";

async function loadSql(filename: string) {
  const filePath = path.join(process.cwd(), "sql", filename);
  return readFile(filePath, "utf-8");
}

export default async function InstallPage() {
  const envStatus = [
    { key: "SUPABASE_URL", present: Boolean(process.env.SUPABASE_URL) },
    {
      key: "SUPABASE_SERVICE_ROLE",
      present: Boolean(process.env.SUPABASE_SERVICE_ROLE),
    },
  ];

  const [initSql, updateSql] = await Promise.all([
    loadSql("01_init.sql"),
    loadSql("02_update.sql"),
  ]);

  let sites:
    | Array<{
        id: number;
        name: string;
        site_key: string;
        policy_version: string;
        created_at: string;
      }>
    | null = null;
  try {
    const { data } = await getServiceRoleClient()
      .from("sites")
      .select("id,name,site_key,policy_version,created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    sites = data ?? null;
  } catch {
    sites = null;
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Guided wizard
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
          Install & Upgrade
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Follow the sequential checklist to bootstrap Cookie-Pro on Supabase and
          expose a site key for your embed snippet.
        </p>
      </div>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Step 1 · Environment check
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {envStatus.map((item) => (
            <li
              key={item.key}
              className="flex items-center justify-between rounded-2xl border border-zinc-100 px-4 py-2 dark:border-zinc-800"
            >
              <span>{item.key}</span>
              <span
                className={
                  item.present ? "text-emerald-600" : "text-rose-500 font-semibold"
                }
              >
                {item.present ? "Detected" : "Missing"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Step 2 · Apply 01_init.sql
          </h2>
          <CopyButton text={initSql} />
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Execute once inside Supabase SQL editor. Includes tables, RLS, and
          dashboard view.
        </p>
        <pre className="mt-4 max-h-80 overflow-auto rounded-2xl bg-zinc-100 p-4 text-xs dark:bg-zinc-800">
          <code>{initSql}</code>
        </pre>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Step 3 · Create a site
        </h2>
        <form action={createSite} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">
            Site name
            <input
              name="name"
              required
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </label>
          <label className="text-sm text-zinc-600 dark:text-zinc-400">
            Policy version
            <input
              name="policy"
              defaultValue={DEFAULT_POLICY_VERSION}
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </label>
          <label className="text-sm text-zinc-600 dark:text-zinc-400 md:col-span-2">
            Origin allowlist (one per line)
            <textarea
              name="origins"
              rows={3}
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="https://example.com"
            />
          </label>
          <label className="text-sm text-zinc-600 dark:text-zinc-400">
            CAPTCHA provider
            <select
              name="captchaProvider"
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="">Disabled</option>
              <option value="turnstile">Cloudflare Turnstile</option>
              <option value="hcaptcha">hCaptcha</option>
              <option value="recaptcha">reCAPTCHA v2</option>
            </select>
          </label>
          <label className="text-sm text-zinc-600 dark:text-zinc-400">
            CAPTCHA site key
            <input
              name="captchaSiteKey"
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </label>
          <label className="text-sm text-zinc-600 dark:text-zinc-400">
            CAPTCHA secret (server)
            <input
              name="captchaSecret"
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-full bg-black py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-900"
            >
              Create site
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Step 4 · Apply 02_update.sql when upgrading
          </h2>
          <CopyButton text={updateSql} />
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Execute within an advisory lock to ensure zero-downtime upgrades.
        </p>
        <pre className="mt-4 max-h-80 overflow-auto rounded-2xl bg-zinc-100 p-4 text-xs dark:bg-zinc-800">
          <code>{updateSql}</code>
        </pre>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Recent sites
        </h2>
        {sites ? (
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2">Name</th>
                <th>Site key</th>
                <th>Policy</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id} className="border-t border-zinc-100 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                  <td className="py-2">{site.name}</td>
                  <td className="font-mono text-xs">{site.site_key}</td>
                  <td>{site.policy_version}</td>
                  <td>{new Date(site.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">
            Supabase connection not available yet.
          </p>
        )}
      </section>
    </div>
  );
}
