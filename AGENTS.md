# AGENTS.md（同意管理与最小遥测 · 规范与实现蓝图）

> 面向 AI 编码代理与人类协作者的**单一事实来源（SSOT）**：用最少的上下文在 **Next.js（App Router）+ Supabase** 上实现「同意管理 + 匿名遥测」MVP，并确保可部署、可观测、可演进。

---

## 0. 目标与非目标

**目标（MVP）**
- 首访弹出同意弹窗（「必要 / 广告 / 其他自定义类目」）。
- 记录访客选择（与**站点**、**政策版本**、**时间**绑定）。
- 生成匿名访客 ID（**指纹 + 站点盐** → `SHA-256` 哈希，避免跨站点关联）。
- 收集**最小必要**遥测：`IP*`（建议截断或哈希）、`User-Agent`、`URL`、`Referrer`。
- 客户以一段 `<script ...>` 嵌入站点底部（`</body>` 前）即可接入。
- 后台可按站点查看：**同意率 / 拒绝率**、**类目分布**、**近期趋势**。
- 默认在**未获非必要同意**前，不进行广告 / 画像类采集。

**非目标**
- 不做跨站点跟踪与重识别。
- 不落地任何直接个人身份信息（PII）。
- 不在浏览器三方上下文写入可被第三方复用的标识符（如三方 Cookie）。

---

## 1. 架构总览

- **前端应用**：Next.js 14+（App Router，TypeScript，Server Actions + Route Handlers）。
- **嵌入脚本**：`/script.js`（Edge Runtime，可 CDN/Edge 缓存）。
- **服务端端点**：
  - `POST /api/consent`：写入/更新同意记录。
  - `POST /api/collect`：接收最小遥测事件。
  - `GET  /api/consent/status`：查询当前设备/站点的同意状态与政策版本。
- **指纹生成**：优先 `@fingerprintjs/fingerprintjs`（开源版），或降级为自研轻量指纹；与**站点级盐**拼接后 `SHA-256` 哈希得到 `device_id`。
- **数据层**：Supabase / Postgres（表：`sites`、`consents`、`events`、`devices`）。
  - 开启 **RLS**；仅 **Service Role** 可写（防滥用）。
  - 仅读接口通过**安全定义函数**（Security Definer）或**物化视图**聚合数据。
- **部署**：Vercel（Next 原生）+ Supabase（DB/鉴权/存储）。
  - `script.js` 强缓存：`Cache-Control: public, max-age=86400`。
- **安装器**：内置可视化 **安装/升级向导**：
  - **数据库 SQL 仅两份**：`01_init.sql`（初始）与 `02_update.sql`（增量），首次只需 `01_init`；之后通过后台一键应用 `02_update`（可演进为多版本）。
  - Vercel 通过 GitHub 自动部署；Supabase 在后台**手动点击**即可执行数据库更新（事务 + 顾问锁，保证可用性）。
- **滥用防护**：
  - `device_id` 首见写入前需**人机验证（CAPTCHA）**；管理员可在站点维度配置；至少支持 **reCAPTCHA v3 / hCaptcha / Cloudflare Turnstile** 三个平台。
  - 仅在**完成 CAPTCHA + 完成同意弹窗选择**后才落库。

---

## 2. 术语 & 数据契约

- **站点（site）**：客户在本系统中注册的一个一方站点/应用，拥有 `site_key`（公开）与 `site_salt`（私有）。
- **政策版本（policy_version）**：同意文案与类目的语义版本号（如 `2025.11.0`）。
- **设备（device）**：站点内的匿名访客实体（`device_id`），在该站点维度唯一。
- **同意（consent）**：某 `device_id` 在某 `policy_version` 下的类目选择快照。

### 2.1 客户嵌入片段（示例）

```html
<script
  src="https://cdn.your-consent.com/script.js"
  data-site-key="<PUBLIC_SITE_KEY>"
  data-policy-version="2025.11.0"
  data-locale="zh-CN"
  defer
></script>
```

**要求**
- 片段放在 `</body>` 前。
- 仅暴露 `data-site-key`；`site_salt` 与 Service Role 等私密信息绝不下发到浏览器。

### 2.2 嵌入脚本行为（状态机）

1. **加载配置**：读取 `data-*` 属性；并 `GET /api/consent/status?site_key=...` 以确定是否需弹窗。
2. **生成设备 ID**：
   - 优先加载 `@fingerprintjs/fingerprintjs`，获取 `visitorId`；
   - 若失败，降级：结合 UA、语言、硬件并做轻量 hash；
   - `device_id = sha256(visitorId + site_salt)`（服务端完成最终计算，浏览器仅回传 `visitorId` 避免泄漏 `site_salt`）。
3. **首见 CAPTCHA**（若站点启用且 DB 未见该设备）：渲染站点所选提供商的组件，拿到 `captcha_token`。
4. **弹出同意**：展示「必要 / 广告 / …」复选；必要类不可取消。
5. **提交**：`POST /api/consent`，携带 `site_key`、`policy_version`、`choices`、`captcha_token?`、`visitorId`。
6. **最小遥测**：在「必要已同意」前，仅发送**必要类**事件；广告/画像类事件需明确同意后才启用。
7. **短路缓存**：同意快照在浏览器 `localStorage` 保存（本域名），用于**下次加载本脚本时**优先渲染 UI；最终以服务端状态为准。

---

## 3. API 设计（Route Handlers）

### 3.1 `GET /api/consent/status`
- **Query**：`site_key`（必填），`visitorId`（可选）。
- **返回**：
```json
{
  "needCaptcha": true,
  "needConsent": true,
  "policyVersion": "2025.11.0",
  "deviceSeen": false,
  "choices": null
}
```

### 3.2 `POST /api/consent`
- **入参（JSON）**：
```json
{
  "site_key": "...",
  "policy_version": "2025.11.0",
  "choices": {"necessary": true, "ads": false},
  "visitorId": "from-fpjs-or-fallback",
  "captcha": {"provider": "turnstile", "token": "..."}
}
```
- **校验**：
  - 必要类必须为 `true`；
  - 首见设备且站点启用 CAPTCHA 时，必须携带有效 `captcha.token`；
  - 服务端以 `sha256(visitorId + site_salt)` 计算 `device_id`。
- **返回**：`201 Created` + `{ deviceId, storedAt }`。

### 3.3 `POST /api/collect`
- **入参（JSON）**：
```json
{
  "site_key": "...",
  "visitorId": "...",
  "events": [
    {
      "type": "page_view",
      "url": "https://example.com/x",
      "referrer": "https://...",
      "ua": "...",
      "ip": "auto", // 服务端读取
      "ts": 1731043200000
    }
  ]
}
```
- **约束**：在**未获广告/画像同意前**，仅允许最小必要事件类型（`page_view_minimal` 等）。
- **返回**：`202 Accepted`。

**统一错误**：
```json
{ "error": { "code": "BAD_REQUEST", "message": "..." } }
```

---

## 4. 指纹与隐私

- **强制**：`device_id` 必须为 `sha256(visitorId + site_salt)`，其中 `site_salt` 仅存在于服务端；
- **IP 处理**：默认**截断**（/24 或 /48）或**单向哈希**（带站点盐）；
- **数据最小化**：只收集所列字段；
- **类目门控**：未获同意不得采集广告/画像类；
- **数据保留**：默认 90 天（可站点级配置）。

---

## 5. 数据库模型（Postgres / Supabase）

> **仅两份 SQL**：`01_init.sql`（初始）与 `02_update.sql`（增量）。

### 5.1 `01_init.sql`（示例）

```sql
begin;

create extension if not exists pgcrypto; -- sha256
create extension if not exists pg_stat_statements; -- 可观测（可选）

-- 站点表
create table if not exists public.sites (
  id            bigint generated always as identity primary key,
  name          text not null,
  site_key      text not null unique,         -- 给前端
  site_salt     text not null,                -- 仅服务端使用
  policy_version text not null default '2025.11.0',
  captcha_provider text check (captcha_provider in ('recaptcha','hcaptcha','turnstile')),
  captcha_site_key text,
  captcha_secret  text,
  origin_whitelist text[] default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 设备表（站点内唯一）
create table if not exists public.devices (
  id           bigint generated always as identity primary key,
  site_id      bigint not null references public.sites(id) on delete cascade,
  device_id    text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  unique(site_id, device_id)
);
create index on public.devices(site_id, last_seen_at desc);

-- 同意记录（快照，按版本）
create table if not exists public.consents (
  id            bigint generated always as identity primary key,
  site_id       bigint not null references public.sites(id) on delete cascade,
  device_id     text not null,
  policy_version text not null,
  choices       jsonb not null,
  user_agent    text,
  ip_truncated  text,
  created_at    timestamptz not null default now(),
  unique(site_id, device_id, policy_version)
);
create index on public.consents(site_id, created_at desc);

-- 最小遥测事件
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  site_id     bigint not null references public.sites(id) on delete cascade,
  device_id   text not null,
  type        text not null,
  url         text,
  referrer    text,
  ua          text,
  ip_truncated text,
  ts          timestamptz not null default now()
);
create index on public.events(site_id, ts desc);

-- 只读视图：站点汇总
create view public.site_consent_summary as
select site_id,
       date_trunc('day', created_at) as d,
       count(*)                                             as total,
       count(*) filter (where (choices->>'necessary')::boolean is true) as necessary_ok,
       count(*) filter (where (choices->>'ads')::boolean is true)       as ads_ok
from public.consents
group by 1,2;

-- RLS 策略：默认拒绝
alter table public.sites   enable row level security;
alter table public.devices enable row level security;
alter table public.consents enable row level security;
alter table public.events  enable row level security;

-- 仅服务角色可写
create policy srv_sites_w on public.sites   for insert to anon using (false) with check (false);
create policy srv_dev_w   on public.devices for insert to anon using (false) with check (false);
create policy srv_con_w   on public.consents for insert to anon using (false) with check (false);
create policy srv_evt_w   on public.events  for insert to anon using (false) with check (false);

-- 只读聚合：通过安全定义函数暴露
create or replace function public.get_consent_dashboard(p_site_key text)
returns table(
  d date,
  total bigint,
  necessary_ok bigint,
  ads_ok bigint
) security definer as $$
  select d::date, total, necessary_ok, ads_ok
  from public.site_consent_summary scs
  join public.sites s on s.id = scs.site_id
  where s.site_key = p_site_key
  order by d desc
  limit 60;
$$ language sql stable;

commit;
```

### 5.2 `02_update.sql`（示例）

> 用于演示升级流程（可添加新事件字段 / 新类目等）。

```sql
begin;

-- 示例：给 events 加一个 jsonb payload 字段
alter table public.events add column if not exists payload jsonb;

commit;
```

### 5.3 安全与可用性
- RLS 默认拒写；所有**写入**经由服务端 Route Handler 使用 **Service Role**；前端无直连 DB。
- 升级通过后台页面触发：获取 `02_update.sql` 内容 → 申请 `pg_advisory_lock(9876501)` → 事务执行 → `ensure` 解锁。

---

## 6. 人机验证（CAPTCHA）抽象

### 6.1 站点级配置
- 字段：`captcha_provider ∈ {recaptcha, hcaptcha, turnstile}`、`captcha_site_key`、`captcha_secret`。
- 行为：当 `devices` 不存在该 `device_id` 时，`/api/consent` 与 `/api/collect` 均要求 `captcha.token` 有效。

### 6.2 统一接口（伪代码）
```ts
export async function verifyCaptcha({ provider, token, secret }: { provider: 'recaptcha'|'hcaptcha'|'turnstile'; token: string; secret: string; }) {
  switch (provider) {
    case 'recaptcha':   return call('https://www.google.com/recaptcha/api/siteverify', { secret, response: token });
    case 'hcaptcha':    return call('https://hcaptcha.com/siteverify', { secret, response: token });
    case 'turnstile':   return call('https://challenges.cloudflare.com/turnstile/v0/siteverify', { secret, response: token });
  }
}
```

---

## 7. Next.js 实现要点

### 7.1 目录结构
```
app/
  (public)/script.js            # Edge runtime，强缓存
  api/
    consent/route.ts            # POST、GET（status 合并或另建）
    collect/route.ts            # POST
  dashboard/                    # 站点后台（RSC + 图表）
  install/                      # 安装/升级向导
lib/
  supabase.ts                   # 仅服务端初始化（Service Role）
  captcha.ts                    # 验证适配层
  crypto.ts                     # sha256 等
  fp.ts                         # 指纹降级方案
components/
  ConsentModal.tsx              # 弹窗（无第三方 UI 依赖，A11y）
  Captcha.tsx                   # 三方提供商封装
  Charts.tsx                    # 仪表板图表
sql/
  01_init.sql
  02_update.sql
```

### 7.2 `script.js`（关键点）
- **Edge Runtime**：`export const runtime = 'edge'`。
- **响应头**：`Cache-Control: public, max-age=86400, immutable`，`Content-Type: text/javascript; charset=utf-8`。
- **内容**：
  - 注入一个影子 DOM 容器，挂载 **ConsentModal** Web 组件（或原生 DOM + CSS，无框架依赖）。
  - 延迟加载 `@fingerprintjs/fingerprintjs`（若允许网络）并设置 1s 超时，失败即降级。
  - 与 `/api/consent/status` 交互，决定是否渲染 CAPTCHA 与弹窗。

### 7.3 Route Handlers（简化伪代码）
```ts
// app/api/consent/route.ts
export async function POST(req: Request) {
  const { site_key, policy_version, choices, visitorId, captcha } = await req.json();
  const site = await db.siteByKey(site_key);
  const deviceId = sha256(visitorId + site.site_salt);

  if (site.captcha_provider && !(await verifyCaptcha({ provider: site.captcha_provider, token: captcha?.token, secret: site.captcha_secret! }))) {
    return json(400, { error: { code: 'CAPTCHA_INVALID' } });
  }

  // 必要类校验
  if (choices?.necessary !== true) return json(400, { error: { code: 'NECESSARY_REQUIRED' } });

  await db.upsertConsent({ site_id: site.id, device_id: deviceId, policy_version, choices, ua: req.headers.get('user-agent'), ip_truncated: truncateOrHashIP(req) });
  await db.touchDevice({ site_id: site.id, device_id: deviceId });
  return json(201, { deviceId, storedAt: new Date().toISOString() });
}
```

```ts
// app/api/collect/route.ts
export async function POST(req: Request) {
  const { site_key, visitorId, events } = await req.json();
  const site = await db.siteByKey(site_key);
  const deviceId = sha256(visitorId + site.site_salt);

  const consent = await db.latestConsent({ site_id: site.id, device_id: deviceId });
  const allowed = filterEventsByConsent(events, consent?.choices);

  if (isFirstSeenDevice(site.id, deviceId) && site.captcha_provider) {
    return json(403, { error: { code: 'CAPTCHA_REQUIRED' } });
  }

  await db.insertEvents(allowed.map(e => ({ ...e, site_id: site.id, device_id: deviceId, ip_truncated: truncateOrHashIP(req), ua: req.headers.get('user-agent') })));
  return json(202, { accepted: allowed.length });
}
```

---

## 8. 仪表板（Dashboard）

**视图**
- 概览：同意率/拒绝率（过去 7/30 天）、类目占比饼图、近 60 日趋势折线。
- 明细：按政策版本与来源页面聚合。

**数据源**
- `select * from public.get_consent_dashboard($1)`（RSC 直接调用）。

**性能**
- 图表请求 `SWR` 缓存，stale-while-revalidate。

---

## 9. 安装 / 升级向导

### 9.1 安装
- 步骤 1：检查环境变量与 Supabase 连接（只在服务端读取）。
- 步骤 2：执行 `01_init.sql`（若未安装）。
- 步骤 3：创建默认站点，生成 `site_key` 与 `site_salt`。
- 步骤 4：展示嵌入片段与后台入口。

### 9.2 升级
- 后台「数据库升级」卡片：
  - 读取 `02_update.sql`；
  - 获取 `pg_advisory_lock(9876501)`；
  - **事务**执行脚本，失败回滚；
  - 释放锁并记录审计日志（包含 Git 提交 SHA）。

---

## 10. 滥用与配额

- 首见设备需通过 CAPTCHA。
- 站点级 **Origin 白名单**；后端校验 `Origin/Referer` 与 `site_key` 的绑定关系。
- 速率限制（建议）：每 `site_id`、每 `device_id`、每 IP 每分钟写入上限（可用 Redis/Upstash；或 DB 层做轻限流：`unique(site_id, device_id, date_trunc('minute', ts), type)` 约束 + `on conflict do nothing`）。

---

## 11. 质量门槛（AI 代理务必遵守）

- **语言/工具**：TypeScript、ESLint（`@next/eslint-plugin-next`）、Prettier、Vitest + Playwright。
- **可测试性**：
  - `lib/crypto.ts`、`lib/fp.ts`、`lib/captcha.ts` 需 95%+ 覆盖率；
  - API 端点有契约测试（Zod 校验 + 录制快照）。
- **安全**：
  - 不在浏览器泄露 `site_salt`、`service_role`；
  - 所有外部请求（CAPTCHA）有超时与重试退避；
  - CORS：仅允许已绑定的站点域名。
- **可观测性**：结构化日志（request-id）、慢查询日志、错误告警（Vercel + Supabase log drains）。
- **性能**：`script.js` < 15KB gzip，首屏执行 < 50ms（Edge）；FPJS 按需/延迟加载。

---

## 12. 环境变量

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`（仅服务端）
- `NEXT_PUBLIC_FPJS_KEY`（若使用 FPJS CDN，可选）
- `CAPTCHA_RECAPTCHA_SECRET` / `HCAPTCHA_SECRET` / `TURNSTILE_SECRET`（服务端）

> 客户站点级的 `captcha_site_key` 存在 DB 中，由后台配置并下发到前端脚本渲染。

---

## 13. 示例：IP 截断/哈希

```ts
export function truncateOrHashIP(req: Request) {
  const ip = getIP(req);
  if (!ip) return null;
  if (isIPv4(ip)) return ip.split('.').slice(0,3).join('.') + '.0';
  // IPv6 / 哈希（站点盐）
  return sha256(ip + getSiteSaltFromContext());
}
```

---

## 14. 同意弹窗交互规范

- **可访问性**：键盘可达、`aria-*` 完整、焦点陷阱、对比度充足。
- **默认状态**：仅「必要」已勾选且不可取消，其余不选。
- **文案与多语言**：按 `data-locale` 加载内置文案；也可在后台 per-site 自定义。
- **再出现策略**：
  - 若 `policy_version` 未改变且有有效同意记录，**不再弹出**；
  - 版本变化 → 重新弹出。

---

## 15. Dashboard 指标定义

- **同意率** = `necessary_ok / total`。
- **广告许可率** = `ads_ok / total`。
- **最近 60 日趋势**：按日聚合 `site_consent_summary`。

---

## 16. 定义完成（DoD）

- [ ] `/script.js` 可加载、能在无 FPJS 时降级生成 `visitorId`。
- [ ] 首访按规则弹窗，必要类强制；首见设备 + 启用 CAPTCHA 时，验证通过后方可写入。
- [ ] `/api/consent`、`/api/collect` 端到端打通，最小遥测写入成功。
- [ ] Dashboard 正确显示站点 7/30/60 天指标。
- [ ] 安装器完成 `01_init.sql`；升级卡片可安全执行 `02_update.sql`（含锁与回滚）。
- [ ] RLS 与服务端密钥策略通过安全审计脚本校验。

---

## 17. 面向 AI 代理的执行清单（按顺序）

1. 初始化 Next.js + TS，创建 `app/(public)/script.js`（Edge）。
2. 落地 `lib/crypto.ts`（`sha256`）、`lib/fp.ts`（降级指纹）、`lib/captcha.ts`（三提供商）。
3. 实现 `/api/consent/status`、`/api/consent`、`/api/collect`（含 Zod 校验）。
4. 写入 `sql/01_init.sql` 与 `sql/02_update.sql`；开发安装/升级向导。
5. 构建 `ConsentModal` 与 `Captcha` 组件；完成 i18n 文案。
6. 搭建 Dashboard（RSC + 图表）。
7. 接入 ESLint/Prettier/Vitest/Playwright；补充契约测试。
8. 配置环境变量与 Vercel 项目，连通 Supabase；跑完向导。
9. 压测 `/script.js` 与 API（含速率限制 & 错误分支）。

---

## 18. 未来演进

- 多策略版本差异比对与「变更提示」。
- 更细分类目（分析、个性化等）与目的说明。
- 事件流水压缩与 S3/存储分层归档。
- 站点级 Webhook（同意变更时回调）。

---

> 本文档更新后请同步提升 `sites.policy_version` 默认值，并在安装/升级向导中提示管理员重新发布嵌入脚本参数。

