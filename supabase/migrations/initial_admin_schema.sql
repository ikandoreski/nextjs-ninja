create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  price numeric(12,2) not null default 0,
  stock integer not null default 0,
  sku text not null unique,
  mpn text,
  brand text,
  status text not null default 'draft' check (status in ('draft', 'active', 'out_of_stock', 'archived')),
  featured_image_url text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  order_code text not null unique,
  status text not null default 'baru' check (status in ('baru', 'dibayar', 'diproses', 'dikirim', 'selesai', 'batal')),
  total_amount numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ps_stations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  status text not null default 'tersedia' check (status in ('tersedia', 'dipakai', 'maintenance', 'full')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists rental_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  station_id uuid,
  queue_code text not null unique,
  play_date date not null,
  start_time time not null,
  duration_hours integer not null default 2,
  status text not null default 'booked' check (status in ('booked', 'check_in', 'selesai', 'batal')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists page_seo (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null unique,
  meta_title text,
  meta_description text,
  canonical_url text,
  amp_url text,
  og_title text,
  og_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists page_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null,
  block_key text not null,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists business_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  review_body text not null,
  owner_reply text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  module_name text not null,
  action_name text not null,
  entity_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_slug on products(slug);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_rental_bookings_date on rental_bookings(play_date);
create index if not exists idx_ps_stations_status on ps_stations(status);
create index if not exists idx_pages_key on pages(page_key);

alter table categories enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table ps_stations enable row level security;
alter table rental_bookings enable row level security;
alter table pages enable row level security;
alter table page_seo enable row level security;
alter table page_blocks enable row level security;
alter table business_reviews enable row level security;
alter table activity_logs enable row level security;

grant usage on schema public to anon, authenticated;
grant select on categories, products, business_reviews, pages, page_seo, page_blocks to anon;
grant all privileges on categories, products, customers, orders, ps_stations, rental_bookings, pages, page_seo, page_blocks, business_reviews, activity_logs to authenticated;

drop policy if exists "public can read categories" on categories;
create policy "public can read categories"
on categories for select
to anon
using (true);

drop policy if exists "public can read products" on products;
create policy "public can read products"
on products for select
to anon
using (status = 'active');

drop policy if exists "public can read business reviews" on business_reviews;
create policy "public can read business reviews"
on business_reviews for select
to anon
using (true);

drop policy if exists "public can read pages" on pages;
create policy "public can read pages"
on pages for select
to anon
using (true);

drop policy if exists "public can read page seo" on page_seo;
create policy "public can read page seo"
on page_seo for select
to anon
using (true);

drop policy if exists "public can read page blocks" on page_blocks;
create policy "public can read page blocks"
on page_blocks for select
to anon
using (true);

drop policy if exists "authenticated full access categories" on categories;
create policy "authenticated full access categories"
on categories for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access products" on products;
create policy "authenticated full access products"
on products for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access customers" on customers;
create policy "authenticated full access customers"
on customers for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access orders" on orders;
create policy "authenticated full access orders"
on orders for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access stations" on ps_stations;
create policy "authenticated full access stations"
on ps_stations for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access bookings" on rental_bookings;
create policy "authenticated full access bookings"
on rental_bookings for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access pages" on pages;
create policy "authenticated full access pages"
on pages for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access page seo" on page_seo;
create policy "authenticated full access page seo"
on page_seo for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access page blocks" on page_blocks;
create policy "authenticated full access page blocks"
on page_blocks for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access reviews" on business_reviews;
create policy "authenticated full access reviews"
on business_reviews for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access activity logs" on activity_logs;
create policy "authenticated full access activity logs"
on activity_logs for all
to authenticated
using (true)
with check (true);

insert into categories (name, slug)
values
  ('Konsol', 'konsol'),
  ('Game PS5', 'game-ps5'),
  ('Sparepart', 'sparepart'),
  ('Aksesoris', 'aksesoris')
on conflict (slug) do update
set name = excluded.name;

insert into ps_stations (code, name, status, notes)
values
  ('PS5-01', 'PS5 Lounge 01', 'dipakai', 'Sesi aktif sampai 21:00'),
  ('PS5-02', 'PS5 Lounge 02', 'tersedia', 'Siap booking'),
  ('PS5-03', 'PS5 Lounge 03', 'full', 'Sudah dibooking untuk sesi malam'),
  ('VIP-02', 'PS5 VIP 02', 'maintenance', 'Cek kipas pendingin')
on conflict (code) do update
set
  name = excluded.name,
  status = excluded.status,
  notes = excluded.notes;

insert into pages (page_key, title)
values
  ('home', 'Beranda Ninja388'),
  ('katalog', 'Katalog Ninja388'),
  ('rental-ps', 'Rental PS Ninja388'),
  ('tentang-ninja388', 'Tentang Ninja388'),
  ('kontak-ninja388', 'Kontak Ninja388')
on conflict (page_key) do update
set title = excluded.title;

insert into business_reviews (reviewer_name, rating, review_body, owner_reply, is_featured)
values
  ('Hijau Tower', 5, 'GG Ngab, voucher-nya cengli banget, banyak promo buat first customers...', 'Terimakasih telah berlangganan bersama Ninja388', true),
  ('bunga citra atumi', 5, 'Asik banget sob, store ini aman dan voucher-nya bikin kalap...', 'Terimakasih telah berlangganan bersama Ninja388', true),
  ('game gaming', 5, 'Gokil, tempatnya mantap, vouchernya murah meriah dan sangat membantu gamer...', 'Terimakasih telah berlangganan bersama Ninja388', true)
on conflict do nothing;
