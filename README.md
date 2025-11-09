# Cookie-Pro 使用指南（中文）

> 基于 **Next.js App Router + Supabase** 的「同意管理 + 最小遥测」参考实现，完整遵循 `AGENTS.md` 规范。

## 功能亮点

- Edge Runtime `/script.js` 嵌入脚本：内置 FPJS + Web Crypto 降级指纹、CAPTCHA 首访校验、Shadow DOM 弹窗、i18n 文案与本地缓存。
- 安全后端：`/api/consent/status`、`/api/consent`、`/api/collect` 全量 Zod 校验、RLS + Supabase Service Role 持久化、起源白名单与速率限制。
- 安装/升级向导 + 仪表盘：一键执行 `sql/01_init.sql`、创建站点、展示数据看板、触发 `02_update.sql`。
- 工具链：Vitest 覆盖核心库、Playwright 预留 e2e、Prettier/ESLint/Instrumentation 一应俱全。

## 前置条件

- Node.js 20+
- 一个 Supabase 项目（获取 `SUPABASE_URL` 与 `SUPABASE_SERVICE_ROLE`）
- （可选）Turnstile / hCaptcha / reCAPTCHA 的密钥，用于站点级 CAPTCHA

## 本地开发

```bash
npm install
npm run lint
npm run test
npm run dev
```

访问 `http://localhost:3000/install`，按向导执行 `sql/01_init.sql` 并创建站点，获取 `site_key`。

### 环境变量（`.env.local`）

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE=<service-role-key>
NEXT_PUBLIC_FPJS_KEY=<可选，用于 FPJS CDN>
CAPTCHA_RECAPTCHA_SECRET=<可选>
HCAPTCHA_SECRET=<可选>
TURNSTILE_SECRET=<可选>
```

每个站点的 CAPTCHA site key、Origin allowlist 可在安装向导界面配置。

## 使用 Vercel 部署（推荐）

1. **准备代码**：将仓库推送到 GitHub。
2. **Vercel 导入**：
   - 登录 Vercel，点击 *Add New → Project*，选择对应的 GitHub 仓库。
   - 框架会自动识别为 Next.js。
3. **配置环境变量**：
   - 在 “Environment Variables” 中新增上表所列的变量；注意 `SUPABASE_SERVICE_ROLE` 仅供服务端使用。
4. **首轮部署**：点击 *Deploy*。
5. **初始化数据库**：
   - 登录 Supabase → SQL Editor，将 `sql/01_init.sql` 原样执行一次。
   - 如后续迭代需要 schema 变更，可在后台「升级卡片」或 Supabase 控制台中执行 `sql/02_update.sql`。
6. **运行安装向导**：
   - 打开 `https://<your-vercel-domain>/install`。
   - 填写站点名称、策略版本、Origin 白名单、CAPTCHA 站点密钥等信息，提交后获得 `site_key` 与嵌入片段。
7. **切换正式域名（可选）**：
   - 在 Vercel 「Domains」中添加自定义域名。
   - Edge 脚本即托管于 `https://<your-domain>/script.js`，内置 `Cache-Control: public, max-age=86400, immutable`，如更新脚本需在 Vercel 触发重新部署。

### 生产检查清单

- ✅ Vercel 环境变量已包含 `SUPABASE_*`、CAPTCHA 密钥、`NEXT_PUBLIC_FPJS_KEY`（若使用）。
- ✅ Supabase 已执行 `01_init.sql`，并启用日志告警。
- ✅ 安装向导中设置了站点 `site_key`、Origin 白名单与 CAPTCHA。
- ✅ `/dashboard` 能够查询指标、`/install` 的「升级」卡片可执行 `02_update.sql`。
- ✅ 客户页脚嵌入 `<script src="https://<domain>/script.js" ...></script>`，并在策略更新后同步 `data-policy-version`。

## 嵌入脚本示例

```html
<script
  src="https://<your-domain>/script.js"
  data-site-key="PUBLIC_SITE_KEY"
  data-policy-version="2025.11.0"
  data-locale="zh-CN"
  defer
></script>
```

脚本会根据 `policy_version` 与服务器状态决定是否弹窗；在获得非必要类目同意前，所有广告/画像事件均被屏蔽。

---

# Cookie-Pro Guide (English)

> Consent + minimal telemetry MVP on **Next.js App Router + Supabase**, aligned with the AGENTS.md spec.

## Highlights

- Edge `/script.js` embed with FPJS + Web Crypto fallback, CAPTCHA gating, shadow-modal UI, i18n strings, and local caching.
- Hardened APIs (`/api/consent/status`, `/api/consent`, `/api/collect`) with Zod validation, RLS-backed Supabase writes, origin allowlists, and rate limiting.
- Installer/Dashboard flows to run migrations, provision sites, monitor consent KPIs, and trigger schema upgrades.
- Tooling includes Vitest suites for all critical helpers, Playwright placeholders, ESLint/Prettier, and instrumentation hooks.

## Prerequisites

- Node.js 20+
- Supabase project (Postgres) + Service Role key
- Optional CAPTCHA credentials per site (Turnstile / hCaptcha / reCAPTCHA)

## Local Development

```bash
npm install
npm run lint
npm run test
npm run dev
```

Browse to `http://localhost:3000/install` to run the setup wizard, apply `sql/01_init.sql`, and mint a `site_key`.

### Environment Variables (`.env.local`)

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE=<service-role-key>
NEXT_PUBLIC_FPJS_KEY=<optional>
CAPTCHA_RECAPTCHA_SECRET=<optional>
HCAPTCHA_SECRET=<optional>
TURNSTILE_SECRET=<optional>
```

Use the installer UI to configure per-site CAPTCHA site keys and origin allowlists.

## Deploying to Vercel (Detailed)

1. **Connect repo** – push to GitHub and import via Vercel → *Add New Project*. The Next.js preset is auto-selected.
2. **Set env vars** – replicate `.env.local` entries inside the Vercel dashboard (Production + Preview). Only `NEXT_PUBLIC_*` values are exposed to the client.
3. **Initial deploy** – hit *Deploy*; Vercel builds Next.js with the Edge script.
4. **Run SQL migrations** – in Supabase, execute `sql/01_init.sql` once. Keep `sql/02_update.sql` handy for future upgrades (the installer exposes an Upgrade card that executes it inside an advisory lock).
5. **Finish setup** – open `https://<vercel-domain>/install`, complete the wizard to create a site, and copy the embed snippet.
6. **Custom domains** – add domains under Vercel → Domains; `script.js` automatically serves from the new origin with long-term caching.
7. **Monitoring** – visit `/dashboard` to confirm metrics flow, and configure Supabase log drains/alerts for policy or RLS failures.

## Production Checklist

- ✅ `SUPABASE_*` and CAPTCHA secrets configured in Vercel.
- ✅ `sql/01_init.sql` executed; `02_update.sql` available for upgrades.
- ✅ Site created via installer, snippet deployed to the customer site (before `</body>`).
- ✅ Origin whitelist/CAPTCHA enabled per site to block abuse.
- ✅ `/dashboard` shows consent/ads trends; telemetry is accepted via `/api/collect`.

## Embed Snippet

```html
<script
  src="https://<your-domain>/script.js"
  data-site-key="PUBLIC_SITE_KEY"
  data-policy-version="2025.11.0"
  data-locale="en-US"
  defer
></script>
```

The modal re-appears when the policy version changes or consent is missing; non-essential telemetry stays disabled until the relevant categories are accepted.
