create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  excerpt text,
  content_markdown text not null default '',
  thumbnail_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_blog_posts_slug_unique
on blog_posts(slug);

create table if not exists published_blog_posts (
  post_id uuid primary key references blog_posts(id) on delete cascade,
  slug text not null,
  title text not null,
  excerpt text,
  content_markdown text not null,
  thumbnail_url text,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_published_blog_posts_slug_unique
on published_blog_posts(slug);
