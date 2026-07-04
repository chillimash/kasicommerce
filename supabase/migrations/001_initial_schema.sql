-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Businesses
create table businesses (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz default now(),
  owner_name      text not null,
  business_name   text not null,
  phone           text not null unique,
  language        text not null default 'en' check (language in ('en','zu','xh','st','af')),
  business_type   text not null,
  tier            text not null default 'free' check (tier in ('free','kasibooks','kasicomply','kasistore','full')),
  status          text not null default 'trial' check (status in ('trial','active','suspended','churned')),
  trial_ends_at   timestamptz,
  onboarded_by    uuid
);

-- Transactions
create table transactions (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),
  business_id   uuid not null references businesses(id) on delete cascade,
  type          text not null check (type in ('income','expense')),
  amount        numeric(12,2) not null check (amount > 0),
  description   text not null,
  category      text not null default 'uncategorised',
  receipt_url   text,
  source        text not null default 'dashboard' check (source in ('whatsapp','dashboard','import'))
);

-- Compliance filings
create table compliance_filings (
  id               uuid primary key default uuid_generate_v4(),
  created_at       timestamptz default now(),
  business_id      uuid not null references businesses(id) on delete cascade,
  filing_type      text not null check (filing_type in ('paye','uif','sdl','vat')),
  period           text not null,
  amount_due       numeric(12,2) not null,
  status           text not null default 'pending' check (status in ('pending','submitted','paid','overdue')),
  due_date         date not null,
  reference_number text
);

-- Store products
create table store_products (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz default now(),
  business_id  uuid not null references businesses(id) on delete cascade,
  name         text not null,
  description  text,
  price        numeric(10,2) not null check (price >= 0),
  image_url    text,
  in_stock     boolean not null default true,
  category     text
);

-- Credit applications
create table credit_applications (
  id                uuid primary key default uuid_generate_v4(),
  created_at        timestamptz default now(),
  business_id       uuid not null references businesses(id) on delete cascade,
  amount_requested  numeric(12,2) not null,
  purpose           text not null,
  status            text not null default 'draft' check (status in ('draft','submitted','under_review','approved','rejected','disbursed')),
  partner_lender    text,
  origination_fee   numeric(10,2),
  approved_amount   numeric(12,2),
  decision_at       timestamptz
);

-- Kasi Champions
create table kasi_champions (
  id                        uuid primary key default uuid_generate_v4(),
  created_at                timestamptz default now(),
  name                      text not null,
  phone                     text not null unique,
  area                      text not null,
  businesses_onboarded      integer not null default 0,
  total_commission_earned   numeric(10,2) not null default 0,
  status                    text not null default 'active' check (status in ('active','inactive'))
);

-- WhatsApp sessions (bot state machine)
create table whatsapp_sessions (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz default now(),
  phone           text not null unique,
  business_id     uuid references businesses(id),
  state           text not null default 'WELCOME',
  context         jsonb not null default '{}',
  last_message_at timestamptz not null default now()
);

-- Row Level Security
alter table businesses         enable row level security;
alter table transactions       enable row level security;
alter table compliance_filings enable row level security;
alter table store_products     enable row level security;
alter table credit_applications enable row level security;

-- Indexes for performance
create index idx_transactions_business_id   on transactions(business_id);
create index idx_transactions_created_at    on transactions(created_at desc);
create index idx_sessions_phone             on whatsapp_sessions(phone);
create index idx_businesses_phone           on businesses(phone);
create index idx_filings_business_id        on compliance_filings(business_id);
create index idx_products_business_id       on store_products(business_id);
