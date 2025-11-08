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

create view if not exists public.site_consent_summary as
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

create policy sites_insert_service_role on public.sites for insert using (false) with check (false);
create policy devices_insert_service_role on public.devices for insert using (false) with check (false);
create policy consents_insert_service_role on public.consents for insert using (false) with check (false);
create policy events_insert_service_role on public.events for insert using (false) with check (false);

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
