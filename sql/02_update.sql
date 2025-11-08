begin;

alter table public.events add column if not exists purpose text;

commit;
