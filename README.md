# Cookie-Pro

> MVP implementation of the AGENTS.md consent + minimal telemetry blueprint on **Next.js (App Router) + Supabase**.

## Features

- Edge-hosted `/script.js` embed with FPJS + fallback fingerprint, CAPTCHA gating, local caching, and i18n modal UI.
- Secure APIs (`/api/consent/status`, `/api/consent`, `/api/collect`) validating Zod contracts, rate limiting, origin
  allowlisting, and Supabase persistence with RLS enforced.
- Dashboard and installer flows covering SQL migrations, site provisioning, and KPI visualisation.
- Library coverage for crypto, captcha verification, telemetry filtering, logging, IP truncation, etc.

## Prerequisites

- Node.js 20+
- Supabase project (Postgres) with Service Role key
- Optional CAPTCHA credentials (Turnstile / hCaptcha / reCAPTCHA) per site

## Local Setup

```bash
npm install
npm run lint
npm run test
npm run dev
```

Visit `http://localhost:3000/install` to run the guided installer, apply `sql/01_init.sql`, and create a site key.

## Environment Variables

Create `.env.local`:

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE=<service-role-key>
NEXT_PUBLIC_FPJS_KEY=<optional-public-key>
CAPTCHA_RECAPTCHA_SECRET=<optional>
HCAPTCHA_SECRET=<optional>
TURNSTILE_SECRET=<optional>
```

Use the installer UI to configure per-site CAPTCHA site keys and origin allowlists.

## Deploying on Vercel

1. **GitHub import** – push this repo, then in Vercel “Import Project” and select the repository.
2. **Framework preset** – Vercel detects Next.js automatically.
3. **Environment variables** – add the same values from `.env.local` (no client-side secrets except `NEXT_PUBLIC_*`).
4. **Supabase SQL** – in the Supabase dashboard run `sql/01_init.sql` once, and keep `sql/02_update.sql` for upgrades.
5. **Promote** – after the first deploy, open `https://<vercel-domain>/install` to create the first site and get the embed snippet.

### Custom Domain & Script Cache

- Map your domain in Vercel; the embed script lives at `https://<your-domain>/script.js`.
- Ensure caching headers are respected (`Cache-Control: public, max-age=86400, immutable`). Purge via Vercel when releasing script changes.

## Production Checklist

- ✅ `SUPABASE_*` env vars set on Vercel (Service Role stays server-side only).
- ✅ Turn on Supabase Log Drains / alerts for failed policies.
- ✅ Configure origin whitelist + CAPTCHA per site for abuse prevention.
- ✅ Run `sql/02_update.sql` via the installer “Upgrade” card when rolling schema changes.
- ✅ Monitor `/dashboard` for consent KPIs and verify telemetry ingestion.

## Embedding

Place before `</body>` on the customer site:

```html
<script
  src="https://<your-vercel-domain>/script.js"
  data-site-key="PUBLIC_SITE_KEY"
  data-policy-version="2025.11.0"
  data-locale="en-US"
  defer
></script>
```

The modal auto-loads when policy versions change or consent is missing; only necessary telemetry is collected until optional categories are enabled.
