begin;

create extension if not exists pgcrypto;
create extension if not exists pg_stat_statements;

create table if not exists public.sites (
  id bigint generated always as identity primary key,
  name text not null,
  site_key text not null unique,
  site_salt text not null,
  policy_version text not null default '2025.11.0',
  captcha_provider text check (captcha_provider in ('recaptcha','hcaptcha','turnstile')),
  captcha_site_key text,
  captcha_secret text,
  origin_whitelist text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.devices (
  id bigint generated always as identity primary key,
  site_id bigint not null references public.sites(id) on delete cascade,
  device_id text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique(site_id, device_id)
);
create index if not exists devices_site_last_seen_idx on public.devices(site_id, last_seen_at desc);

create table if not exists public.consents (
  id bigint generated always as identity primary key,
  site_id bigint not null references public.sites(id) on delete cascade,
  device_id text not null,
  policy_version text not null,
  choices jsonb not null,
  user_agent text,
  ip_truncated text,
  created_at timestamptz not null default now(),
  unique(site_id, device_id, policy_version)
);
create index if not exists consents_site_created_idx on public.consents(site_id, created_at desc);

create table if not exists public.events (
  id bigint generated always as identity primary key,
  site_id bigint not null references public.sites(id) on delete cascade,
  device_id text not null,
  type text not null,
  url text,
  referrer text,
  ua text,
  ip_truncated text,
  ts timestamptz not null default now(),
  payload jsonb
);
create index if not exists events_site_ts_idx on public.events(site_id, ts desc);

create table if not exists public.admin_settings (
  id bigint generated always as identity primary key,
  admin_name text not null,
  admin_password_hash text not null,
  admin_path text not null,
  install_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists admin_settings_singleton_idx on public.admin_settings((true));

create table if not exists public.system_settings (
  id bigint generated always as identity primary key,
  product_name text not null default 'Cookie-Pro',
  default_locale text not null default 'zh',
  theme_preference text not null default 'auto',
  allow_self_signup boolean not null default true,
  support_email text,
  telemetry_retention_days integer not null default 90,
  updated_at timestamptz not null default now()
);
create unique index if not exists system_settings_singleton_idx on public.system_settings((true));

create table if not exists public.users (
  id bigint generated always as identity primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smtp_settings (
  id bigint generated always as identity primary key,
  host text not null,
  port integer not null default 587,
  secure boolean not null default false,
  username text not null,
  password text not null,
  from_name text not null,
  from_email text not null,
  updated_at timestamptz not null default now()
);
create unique index if not exists smtp_settings_singleton_idx on public.smtp_settings((true));

create table if not exists public.email_templates (
  id bigint generated always as identity primary key,
  template_key text not null,
  locale text not null default 'en',
  subject text not null,
  body text not null,
  updated_at timestamptz not null default now(),
  unique(template_key, locale)
);

create table if not exists public.verification_codes (
  id bigint generated always as identity primary key,
  email text not null,
  code_hash text not null,
  purpose text not null,
  expires_at timestamptz not null,
  consumed boolean not null default false,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists verification_codes_email_idx on public.verification_codes(email);

drop view if exists public.site_consent_summary;

create view public.site_consent_summary as
select site_id,
       date_trunc('day', created_at) as d,
       count(*) as total,
       count(*) filter (where (choices->>'necessary')::boolean is true) as necessary_ok,
       count(*) filter (where (choices->>'ads')::boolean is true) as ads_ok
from public.consents
group by 1,2;

alter table public.sites enable row level security;
alter table public.devices enable row level security;
alter table public.consents enable row level security;
alter table public.events enable row level security;
alter table public.admin_settings enable row level security;
alter table public.system_settings enable row level security;
alter table public.users enable row level security;
alter table public.smtp_settings enable row level security;
alter table public.email_templates enable row level security;
alter table public.verification_codes enable row level security;

create policy sites_insert_service_role on public.sites for insert with check (false);
create policy devices_insert_service_role on public.devices for insert with check (false);
create policy consents_insert_service_role on public.consents for insert with check (false);
create policy events_insert_service_role on public.events for insert with check (false);

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

create or replace function public.get_usage_overview()
returns table(
  sites bigint,
  devices bigint,
  consents bigint,
  events bigint,
  events_24h bigint,
  consents_24h bigint,
  last_event timestamptz,
  last_consent timestamptz
) security definer as $$
  select
    (select count(*) from public.sites) as sites,
    (select count(*) from public.devices) as devices,
    (select count(*) from public.consents) as consents,
    (select count(*) from public.events) as events,
    (select count(*) from public.events where ts >= now() - interval '24 hours') as events_24h,
    (select count(*) from public.consents where created_at >= now() - interval '24 hours') as consents_24h,
    (select max(ts) from public.events) as last_event,
    (select max(created_at) from public.consents) as last_consent;
$$ language sql stable;

create or replace function public.get_usage_by_site(p_limit integer default 5)
returns table(
  site_id bigint,
  site_name text,
  site_key text,
  total_events bigint,
  events_24h bigint,
  total_consents bigint,
  consents_24h bigint,
  last_event timestamptz
) security definer as $$
  with event_stats as (
    select
      site_id,
      count(*) as total_events,
      count(*) filter (where ts >= now() - interval '24 hours') as events_24h,
      max(ts) as last_event
    from public.events
    group by site_id
  ),
  consent_stats as (
    select
      site_id,
      count(*) as total_consents,
      count(*) filter (where created_at >= now() - interval '24 hours') as consents_24h
    from public.consents
    group by site_id
  )
  select
    s.id as site_id,
    s.name as site_name,
    s.site_key,
    coalesce(e.total_events, 0) as total_events,
    coalesce(e.events_24h, 0) as events_24h,
    coalesce(c.total_consents, 0) as total_consents,
    coalesce(c.consents_24h, 0) as consents_24h,
    e.last_event
  from public.sites s
  left join event_stats e on e.site_id = s.id
  left join consent_stats c on c.site_id = s.id
  order by coalesce(e.events_24h, 0) desc, s.id
  limit greatest(p_limit, 1);
$$ language sql stable;

create or replace function public.pg_version_text()
returns text
language sql
stable
as $$
  select version();
$$;

commit;
