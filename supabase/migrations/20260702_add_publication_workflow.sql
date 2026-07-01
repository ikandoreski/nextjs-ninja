create table if not exists page_publications (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique,
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists published_products (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique,
  category_id uuid,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  price numeric(12,2) not null default 0,
  stock integer not null default 0,
  sku text not null,
  mpn text,
  brand text,
  status text not null default 'draft' check (status in ('draft', 'active', 'out_of_stock', 'archived')),
  featured_image_url text,
  seo_title text,
  seo_description text,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_page_publications_page_key on page_publications(page_key);
create index if not exists idx_published_products_slug on published_products(slug);
create index if not exists idx_published_products_status on published_products(status);

alter table page_publications enable row level security;
alter table published_products enable row level security;

grant select on page_publications, published_products to anon;
grant all privileges on page_publications, published_products to authenticated;

drop policy if exists "public can read page publications" on page_publications;
create policy "public can read page publications"
on page_publications for select
to anon
using (true);

drop policy if exists "public can read published products" on published_products;
create policy "public can read published products"
on published_products for select
to anon
using (status = 'active');

drop policy if exists "authenticated full access page publications" on page_publications;
create policy "authenticated full access page publications"
on page_publications for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access published products" on published_products;
create policy "authenticated full access published products"
on published_products for all
to authenticated
using (true)
with check (true);

insert into page_publications (page_key, title, payload, published_at, updated_at)
select
  'home',
  'Homepage Ninja388',
  jsonb_build_object(
    'hero',
    coalesce(hero.content, '{}'::jsonb),
    'seo',
    jsonb_build_object(
      'metaTitle', seo.meta_title,
      'metaDescription', seo.meta_description,
      'canonicalUrl', seo.canonical_url,
      'ampUrl', seo.amp_url,
      'ogTitle', seo.og_title,
      'ogDescription', seo.og_description
    )
  ),
  now(),
  now()
from pages p
left join page_blocks hero on hero.page_id = p.id and hero.block_key = 'hero'
left join page_seo seo on seo.page_id = p.id
where p.page_key = 'home'
on conflict (page_key) do update
set
  title = excluded.title,
  payload = excluded.payload,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at;

insert into page_publications (page_key, title, payload, published_at, updated_at)
select
  'global-settings',
  'Global Settings',
  jsonb_build_object(
    'brandName', coalesce(business.content->>'brandName', 'Ninja388'),
    'domainUrl', coalesce(business.content->>'domainUrl', 'https://www.ninja388.com/'),
    'ampUrl', coalesce(business.content->>'ampUrl', 'https://ampninja.org/amp/'),
    'whatsappNumber', coalesce(business.content->>'whatsappNumber', '6285959781473'),
    'phoneDisplay', coalesce(business.content->>'phoneDisplay', '0859-5978-1473'),
    'addressLines', coalesce(business.content->>'addressLines', 'Jl. Gajah Mada No.55\nBenua Melayu Darat\nPontianak Selatan\nKalimantan Barat 78124'),
    'mapsUrl', coalesce(business.content->>'mapsUrl', 'https://www.google.com/maps/place/Ninja388/@-0.0366125,109.3395039,17z/data=!4m14!1m7!3m6!1s0x2e1d59ea1e7c79bd:0x23ab65a0802c86c6!2sNinja388!8m2!3d-0.0366179!4d109.3420788!16s%2Fg%2F11ml2n230z!3m5!1s0x2e1d59ea1e7c79bd:0x23ab65a0802c86c6!8m2!3d-0.0366179!4d109.3420788!16s%2Fg%2F11ml2n230z?entry=ttu&g_ep=EgoyMDI2MDYyOC4wIKXMDSoASAFQAw%3D%3D'),
    'instagramUrl', coalesce(business.content->>'instagramUrl', 'https://instagram.com/ninja388'),
    'facebookUrl', coalesce(business.content->>'facebookUrl', 'https://facebook.com/ninja388'),
    'tiktokUrl', coalesce(business.content->>'tiktokUrl', 'https://tiktok.com/@ninja388'),
    'youtubeUrl', coalesce(business.content->>'youtubeUrl', 'https://youtube.com/@ninja388'),
    'customHeadScripts', coalesce(business.content->>'customHeadScripts', ''),
    'customFooterScripts', coalesce(business.content->>'customFooterScripts', '')
  ),
  now(),
  now()
from pages p
left join page_blocks business on business.page_id = p.id and business.block_key = 'business'
where p.page_key = 'global-settings'
on conflict (page_key) do update
set
  title = excluded.title,
  payload = excluded.payload,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at;

insert into published_products (
  product_id,
  category_id,
  name,
  slug,
  short_description,
  description,
  price,
  stock,
  sku,
  mpn,
  brand,
  status,
  featured_image_url,
  seo_title,
  seo_description,
  published_at,
  updated_at
)
select
  id,
  category_id,
  name,
  slug,
  short_description,
  description,
  price,
  stock,
  sku,
  mpn,
  brand,
  status,
  featured_image_url,
  seo_title,
  seo_description,
  now(),
  now()
from products
where status = 'active'
on conflict (product_id) do update
set
  category_id = excluded.category_id,
  name = excluded.name,
  slug = excluded.slug,
  short_description = excluded.short_description,
  description = excluded.description,
  price = excluded.price,
  stock = excluded.stock,
  sku = excluded.sku,
  mpn = excluded.mpn,
  brand = excluded.brand,
  status = excluded.status,
  featured_image_url = excluded.featured_image_url,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at;
