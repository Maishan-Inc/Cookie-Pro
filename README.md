# Cookie-Pro 使用指南（中文）

> 基于 **Next.js 16 App Router + Supabase** 的「同意管理 + 最小遥测」解决方案，实现方式完全遵循 `AGENTS.md`。

## 核心特性
- **Edge `/script.js` 嵌入脚本**：按需加载 FPJS，站点盐 + SHA-256 生成匿名 `device_id`，Shadow DOM 弹窗支持深浅色主题与中英文文案，并在必要类同意前阻断广告/画像事件。
- **安全 API 层**：`/api/consent/status`、`/api/consent`、`/api/collect` 采用 Zod 校验、CAPTCHA 抽象、Origin 白名单、速率限制与结构化日志；所有写入通过 Supabase Service Role + RLS。
- **安装 & 管理后台**：首访强制进入 `/install`，依次确认许可证、检测环境变量/数据库、创建管理员路径与账户；安装完成后可登录管理员后台，配置 SMTP、邮件模板、系统设置与用户管理。
- **用户体系与 i18n**：提供 `/login`、`/register`、`/user` 控制台，注册需 6 位大写验证码（多语言模板 + SMTP），全站组件均支持 zh-CN / en-US 与暗/亮主题切换。

## 环境要求
- Node.js 20+
- Supabase 项目（Postgres）以及 *Service Role* Key
- 可选 CAPTCHA 密钥（Turnstile / hCaptcha / reCAPTCHA）
- SMTP 凭据（通过管理员后台保存）

## 必填环境变量（`.env.local` 或 Vercel 项目设置）
| 变量 | 说明 |
| --- | --- |
| `SUPABASE_URL` | Supabase 项目 URL（https://xxx.supabase.co） |
| `SUPABASE_SERVICE_ROLE` | Supabase Service Role Key，仅服务器可用 |
| `NEXT_PUBLIC_FPJS_KEY` | （可选）FPJS 浏览器 Key，用于 CDN 加速 |
| `CAPTCHA_RECAPTCHA_SECRET` / `HCAPTCHA_SECRET` / `TURNSTILE_SECRET` | （可选）对应提供商服务端密钥，用于站点首访人机验证 |
| `ADMIN_SESSION_SECRET` | 安装向导与管理员会话加密密钥 |
| `USER_SESSION_SECRET` | 普通用户登录会话加密密钥 |

> 站点级 CAPTCHA site key、Origin 白名单、SMTP/邮件模板等由安装/管理员后台维护，无需写入环境变量。

## 本地开发流程
1. `npm install`
2. `npm run lint && npm run test`
3. `npm run dev`
4. 首次访问 `http://localhost:3000/install`：
   - 第一步：确认 Maishan, Inc. 开源软件协议。
   - 第二步：检测环境变量、数据库连通性、Supabase 版本。
   - 第三步：创建管理员名称、密码、以及专属后台路径（例如 `/admin-max12345`，安装完成后会将 `/admin-login` 绑定到该路径）。
   - 第四步：自动执行 `sql/01_init.sql`，写入站点及默认配置。
5. 完成后会跳转到管理员后台，随后可创建站点、配置 SMTP，并生成用户控制台入口。

## Vercel 部署指引（推荐）
1. **导入仓库**：将项目推送到 GitHub/GitLab，登录 Vercel 点击 *Add New Project* 选择仓库，框架自动识别为 Next.js。
2. **配置环境变量**：在 Vercel 的 *Environment Variables* 分别为 Production/Preview 填入上表变量；`SUPABASE_SERVICE_ROLE`、`ADMIN_SESSION_SECRET`、`USER_SESSION_SECRET` 勿暴露给客户端（默认只在服务器可见）。
3. **执行 `sql/01_init.sql`**：
   - 登录 Supabase → SQL Editor → 复制 `sql/01_init.sql` 全文执行一次。
   - 升级时在管理员后台「数据库升级」卡片触发 `sql/02_update.sql`（内部会申请 `pg_advisory_lock(9876501)` 并在失败时回滚）。
4. **首次部署**：回到 Vercel 点击 *Deploy*，观察 `next build` 通过后自动生成预览链接。
5. **运行安装向导**：访问 `https://<vercel-domain>/install`，按向导完成许可证 → 环境检测 → 数据库检查 → 管理员创建，安装成功后即刻跳转到自定义的管理员路径。
6. **配置 SMTP 与邮件模板**：登录管理员后台，进入「系统设置 > 邮件」填写 SMTP 主机、端口、账号、发件人，并为多语言验证码模板提供主题/正文。
7. **创建站点 & 嵌入脚本**：在后台创建站点获取 `site_key`、策略版本、Origin 白名单与 CAPTCHA site key，并将以下脚本放在客户站点 `</body>` 前：

```html
<script
  src="https://<your-domain>/script.js"
  data-site-key="PUBLIC_SITE_KEY"
  data-policy-version="2025.11.0"
  data-locale="zh-CN"
  defer
></script>
```

### 上线前检查清单
- Vercel Production/Preview 环境变量完整（含 Service Role 与会话密钥）。
- Supabase 已执行 `01_init.sql` 并配置日志告警；如有 schema 变更，可在后台执行 `02_update.sql`。
- 安装向导完成且 `/install` 会自动跳转至站点首页；管理员自定义路径可正常访问，直接访问 `/admin-login` 会提示错误。
- 管理员后台中 SMTP 配置可连通，并成功保存中英文邮件模板。
- 用户注册/登录流程（含 6 位验证码输入组件）在 `/register`、`/login`、`/user` 运行正常，UI 可根据系统或用户偏好切换深浅色及语言。
- Dashboard 能读取 `get_consent_dashboard` 数据，`/api/collect` 写入最小遥测且受同意门控。

---

# Cookie-Pro Guide (English)

> Consent + minimal telemetry stack built on **Next.js 16 App Router** and **Supabase**, fully compliant with `AGENTS.md`.

## Highlights
- **Edge embed** with FPJS fallback, site-salted SHA-256 device IDs, CAPTCHA gate, themed modal, local caching, and locale-aware copy.
- **Hardened APIs** for consent status/write/collect with Zod validation, origin allowlists, rate limiting, CAPTCHA adapters, and Supabase Service Role writes behind RLS.
- **Installer & Admin UX** forcing newcomers onto `/install`, verifying license/env/DB, creating a custom admin path + credentials, then exposing dashboards, SMTP + template management, system settings, and user management.
- **End-user auth** delivering `/register`, `/login`, `/user` console, 6-character uppercase verification codes via SMTP templates, plus full dark/light + zh/en i18n coverage.

## Requirements
- Node.js 20+
- Supabase project (Postgres) with Service Role key
- Optional CAPTCHA secrets (Turnstile / hCaptcha / reCAPTCHA)
- SMTP credentials stored through the admin UI

## Environment Variables
| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE` | Service Role key (server-only) |
| `NEXT_PUBLIC_FPJS_KEY` | Optional FPJS browser key |
| `CAPTCHA_RECAPTCHA_SECRET` / `HCAPTCHA_SECRET` / `TURNSTILE_SECRET` | Optional provider secrets to validate CAPTCHA tokens server-side |
| `ADMIN_SESSION_SECRET` | Secret for admin-session cookies (installer + admin login) |
| `USER_SESSION_SECRET` | Secret for end-user sessions |

Site-specific CAPTCHA keys, SMTP settings, and mail templates live in the database and are editable from the admin console, so they are not part of the env file.

## Local Development
1. `npm install`
2. `npm run lint && npm run test`
3. `npm run dev`
4. Open `http://localhost:3000/install` and follow the wizard:
   - Accept the Maishan, Inc. OSS license.
   - Run environment + Supabase connectivity checks (shows Postgres version / project URL).
   - Provide admin name/password (with confirmation) and a unique admin route (e.g., `/admin-max12345`). Direct hits to `/admin-login` remain blocked until the alias is supplied.
   - Apply `sql/01_init.sql`, seed default site config, and issue the first admin session.
5. After the redirect to the admin path, configure SMTP/templates and create sites or customer users as needed.

## Deploying on Vercel
1. **Import repo** → push to GitHub/GitLab and connect via *Add New Project*.
2. **Set env vars** → mirror the variables above for Production/Preview (only `NEXT_PUBLIC_*` leak to the browser).
3. **Run baseline SQL** → execute `sql/01_init.sql` once inside Supabase. Future migrations go through the "Database Upgrade" card (internally wraps `sql/02_update.sql` in an advisory lock).
4. **Deploy** → click *Deploy*; verify `next build` succeeds (the instrumentation warning is informational only).
5. **Installer** → hit `https://<vercel-domain>/install` and finish the wizard. Once complete, `/install` redirects to the main site and the custom admin path becomes the only entrypoint for `/admin-login`.
6. **Configure SMTP & templates** → from the admin console, fill in host/port/secure/user/password + from fields, then edit zh/en verification-code templates.
7. **Provision sites & embed** → create at least one site to obtain the `site_key`, policy version, origin whitelist, and CAPTCHA site key. Embed the script before `</body>` on the customer property:

```html
<script
  src="https://<your-domain>/script.js"
  data-site-key="PUBLIC_SITE_KEY"
  data-policy-version="2025.11.0"
  data-locale="en-US"
  defer
></script>
```

### Production Checklist
- Vercel env vars include Supabase keys, session secrets, and optional CAPTCHA secrets.
- Supabase migrations (`01_init.sql` + optional `02_update.sql`) executed; log drains/alerts enabled.
- Installer completed successfully; admin alias enforced; `/install` no longer exposed.
- SMTP settings validated and multilingual templates saved; verification e-mails render correctly.
- User auth flows (register/login/dashboard) verified alongside locale + theme toggles.
- Dashboard reads from `get_consent_dashboard`; `/api/collect` stores events gated by consent; rate limits behave as expected.

## Troubleshooting
- **Build errors** → run `npm run build`; if TypeScript complains about Supabase inserts, ensure `types/supabase.ts` matches the latest schema.
- **Installer redirect loop** → confirm `admin_settings.install_complete` is `true` and your session cookies are present; otherwise rerun the wizard.
- **CAPTCHA failures** → verify the site’s provider + site key match the server-side secret set in env vars.
- **E-mail delivery** → use the "Send test message" action inside the SMTP panel; check your provider for TLS/port requirements.
