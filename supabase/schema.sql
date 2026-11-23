-- Run this once in the Supabase SQL editor.
-- All reads and writes go through the server with the service role key,
-- so row level security is enabled with no public policies (deny by default).

create extension if not exists "pgcrypto";

-- A seller is whoever owns products. At launch there is one (the shop owner);
-- more sellers can be added later without changing the products table.
create table if not exists sellers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id),
  slug text not null unique,
  kind text not null check (kind in ('pdf', 'planner', 'course')),
  title_mn text not null,
  title_en text not null default '',
  description_mn text not null default '',
  description_en text not null default '',
  title_mong text,          -- optional Mongol bichig name
  description_mong text,    -- optional Mongol bichig description
  price_mnt integer not null check (price_mnt > 0),
  compare_at_mnt integer,   -- optional "was" price, shown crossed out
  cover_path text,          -- path in the public "covers" bucket
  file_path text,           -- path in the private "files" bucket
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  email text not null,
  amount_mnt integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  provider text not null,                 -- 'qpay' or 'test'
  provider_invoice_id text,
  qr_image text,                          -- base64 PNG from QPay
  payment_urls jsonb not null default '[]'::jsonb,
  download_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  download_count integer not null default 0,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists orders_status_idx on orders(status);

-- Newer Supabase projects don't grant table access to API roles automatically.
-- The server uses the service_role key, so give that role access explicitly.
grant usage on schema public to service_role;
grant all on sellers, products, orders to service_role;

alter table sellers enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

-- Storage buckets: covers are public images, files are private downloads.
insert into storage.buckets (id, name, public) values ('covers', 'covers', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('files', 'files', false)
  on conflict (id) do nothing;

-- The first seller (you). Change the name if you like.
insert into sellers (name)
select 'Aldam' where not exists (select 1 from sellers);
