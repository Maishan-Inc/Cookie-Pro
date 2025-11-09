import type { Locale } from "@/lib/i18n/dictionaries";

const featuresEn = [
  {
    title: "Edge Script & Telemetry",
    body: "Edge-hosted consent UI, CAPTCHA gating, and minimal telemetry routed directly into Supabase.",
  },
  {
    title: "A-Quan Security Guard",
    body: "“A-Quan” policies enforce admin-alias checks, install hardening, and CAPTCHA anti-abuse for enterprise audits.",
  },
  {
    title: "Install & Admin Experience",
    body: "License-aware wizard, environment diagnostics, and admin capabilities ready for SMTP + user management.",
  },
];

const featuresZh = [
  {
    title: "Edge 脚本与遥测",
    body: "在边缘托管同意 UI + CAPTCHA，最小化遥测字段并直接写入 Supabase。",
  },
  {
    title: "阿全 · 安全守卫",
    body: "内置“阿全”策略：管理员别名校验、安装加固、防滥用 CAPTCHA，满足企业级审计需求。",
  },
  {
    title: "安装与后台体验",
    body: "多步骤安装向导、环境诊断，以及可扩展的后台能力（邮件模板、用户管理）。",
  },
];

export async function FeatureGrid({ locale }: { locale: Locale }) {
  const list = locale === "zh" ? featuresZh : featuresEn;
  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-6 py-12 md:grid-cols-3">
      {list.map((feature) => (
        <div
          key={feature.title}
          className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-base font-semibold text-zinc-900 dark:text-white">
            {feature.title}
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {feature.body}
          </p>
        </div>
      ))}
    </section>
  );
}
