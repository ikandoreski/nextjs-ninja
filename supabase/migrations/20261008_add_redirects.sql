create table if not exists redirect_rules (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  destination text not null,
  type text not null default '301' check (type in ('301', '302')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_redirect_rules_source_unique
on redirect_rules(source);

insert into redirect_rules (source, destination, type)
values
  ('/amp', 'https://tokoninja.b-cdn.net/', '301'),
  ('/amp/**', 'https://tokoninja.b-cdn.net/', '301')
on conflict (source) do nothing;
